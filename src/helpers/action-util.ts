import * as fs from 'fs'
import * as path from 'path'

import * as core from '@actions/core'
import * as toolrunner from '@actions/exec/lib/toolrunner'
import * as safeWhich from '@chrisgavin/safe-which'
//import { JSONSchemaForNPMPackageJsonFiles } from "@schemastore/package";

import * as yaml from 'js-yaml'

import {
  doesDirectoryExist,
  doesFileExist,
  // resolveDirectory,
  getRequiredEnvParam,
  UserError
} from './utility'
import { UserConfig } from './config-utils'

/**
 * Wrapper around core.getInput for inputs that always have a value.
 * Also see getOptionalInput.
 *
 * This allows us to get stronger type checking of required/optional inputs.
 */
export function getRequiredInput(name: string): string {
  const value = core.getInput(name)
  if (!value) {
    throw new UserError(`Input required and not supplied: ${name}`)
  }
  return value
}

export function getResolvedDirectory(name: string, create: boolean): string {
  const result: string = path.resolve(name)
  if (!doesDirectoryExist(result) && create) {
    fs.mkdirSync(result)
  }
  return result
}

/**
 * Wrapper around core.getInput that converts empty inputs to undefined.
 * Also see getRequiredInput.
 *
 * This allows us to get stronger type checking of required/optional inputs.
 */
export function getOptionalInput(name: string): string | undefined {
  const value = core.getInput(name)
  return value.length > 0 ? value : undefined
}

export function getTemporaryDirectory(): string {
  const value = process.env['RUNNER_TEMP']
  return value !== undefined && value !== ''
    ? value
    : getRequiredEnvParam('TEMP')
}

/**
 * Gets the SHA of the commit that is currently checked out.
 */
export async function getCommitOid(
  checkoutPath: string,
  ref = 'HEAD'
): Promise<string> {
  // Try to use git to get the current commit SHA. If that fails then
  // log but otherwise silently fall back to using the SHA from the environment.
  // The only time these two values will differ is during analysis of a PR when
  // the workflow has changed the current commit to the head commit instead of
  // the merge commit, which must mean that git is available.
  // Even if this does go wrong, it's not a huge problem for the alerts to
  // reported on the merge commit.
  let stderr = ''
  try {
    let commitOid = ''
    await new toolrunner.ToolRunner(
      await safeWhich.safeWhich('git'),
      ['rev-parse', ref],
      {
        silent: true,
        listeners: {
          stdout: data => {
            commitOid += data.toString()
          },
          stderr: data => {
            stderr += data.toString()
          }
        },
        cwd: checkoutPath
      }
    ).exec()
    return commitOid.trim()
  } catch (e) {
    if (stderr.includes('not a git repository')) {
      core.info(
        'Could not determine current commit SHA using git. Continuing with data from user input or environment. ' +
          'The checkout path provided to the action does not appear to be a git repository.'
      )
    } else {
      core.info(
        `Could not determine current commit SHA using git. Continuing with data from user input or environment. ${stderr}`
      )
    }

    return getOptionalInput('sha') || getRequiredEnvParam('GITHUB_SHA')
  }
}

export function getYamlConfig(configPath: string): UserConfig {
  if (doesFileExist(configPath)) {
    return yaml.load(fs.readFileSync(configPath, 'utf8')) as UserConfig
  }
  throw new UserError(`Config file does not exist ${configPath}`)
}

export function getYamlConfigRaw(configPath: string): string | unknown {
  if (doesFileExist(configPath)) {
    return yaml.load(fs.readFileSync(configPath, 'utf8'))
  }
  throw new UserError(`Config file does not exist ${configPath}`)
}

/**
 * If the action was triggered by a pull request, determine the commit sha of the merge base.
 * Returns undefined if run by other triggers or the merge base cannot be determined.
 */
export async function determineMergeBaseCommitOid(
  checkoutPathOverride?: string
): Promise<string | undefined> {
  if (getWorkflowEventName() !== 'pull_request') {
    return undefined
  }

  const mergeSha = getRequiredEnvParam('GITHUB_SHA')
  const checkoutPath = checkoutPathOverride ?? getOptionalInput('checkout_path')
  let stderr = ''

  try {
    let commitOid = ''
    let baseOid = ''
    let headOid = ''

    await new toolrunner.ToolRunner(
      await safeWhich.safeWhich('git'),
      ['show', '-s', '--format=raw', mergeSha],
      {
        silent: true,
        listeners: {
          stdline: data => {
            if (data.startsWith('commit ') && commitOid === '') {
              commitOid = data.substring(7)
            } else if (data.startsWith('parent ')) {
              if (baseOid === '') {
                baseOid = data.substring(7)
              } else if (headOid === '') {
                headOid = data.substring(7)
              }
            }
          },
          stderr: data => {
            stderr += data.toString()
          }
        },
        cwd: checkoutPath
      }
    ).exec()

    // Let's confirm our assumptions: We had a merge commit and the parsed parent data looks correct
    if (
      commitOid === mergeSha &&
      headOid.length === 40 &&
      baseOid.length === 40
    ) {
      return baseOid
    }
    return undefined
  } catch (e) {
    if (stderr.includes('not a git repository')) {
      core.info(
        'The checkout path provided to the action does not appear to be a git repository. ' +
          'Will calculate the merge base on the server.'
      )
    } else {
      core.info(
        `Failed to call git to determine merge base. Will calculate the merge base on ` +
          `the server. Reason: ${stderr}`
      )
    }
    return undefined
  }
}

/**
 * Get the ref currently being analyzed.
 */
export async function getRef(): Promise<string> {
  // Will be in the form "refs/heads/master" on a push event
  // or in the form "refs/pull/N/merge" on a pull_request event
  const refInput = getOptionalInput('ref')
  const shaInput = getOptionalInput('sha')
  const checkoutPath =
    getOptionalInput('checkout_path') ||
    getOptionalInput('source-root') ||
    getRequiredEnvParam('GITHUB_WORKSPACE')

  const hasRefInput = !!refInput
  const hasShaInput = !!shaInput
  // If one of 'ref' or 'sha' are provided, both are required
  if ((hasRefInput || hasShaInput) && !(hasRefInput && hasShaInput)) {
    throw new Error(
      "Both 'ref' and 'sha' are required if one of them is provided."
    )
  }

  const ref = refInput || getRefFromEnv()
  const sha = shaInput || getRequiredEnvParam('GITHUB_SHA')

  // If the ref is a user-provided input, we have to skip logic
  // and assume that it is really where they want to upload the results.
  if (refInput) {
    return refInput
  }

  // For pull request refs we want to detect whether the workflow
  // has run `git checkout HEAD^2` to analyze the 'head' ref rather
  // than the 'merge' ref. If so, we want to convert the ref that
  // we report back.
  const pull_ref_regex = /refs\/pull\/(\d+)\/merge/
  if (!pull_ref_regex.test(ref)) {
    return ref
  }

  const head = await getCommitOid(checkoutPath, 'HEAD')

  // in actions/checkout@v2+ we can check if git rev-parse HEAD == GITHUB_SHA
  // in actions/checkout@v1 this may not be true as it checks out the repository
  // using GITHUB_REF. There is a subtle race condition where
  // git rev-parse GITHUB_REF != GITHUB_SHA, so we must check
  // git rev-parse GITHUB_REF == git rev-parse HEAD instead.
  const hasChangedRef =
    sha !== head &&
    (await getCommitOid(
      checkoutPath,
      ref.replace(/^refs\/pull\//, 'refs/remotes/pull/')
    )) !== head

  if (hasChangedRef) {
    const newRef = ref.replace(pull_ref_regex, 'refs/pull/$1/head')
    core.debug(
      `No longer on merge commit, rewriting ref from ${ref} to ${newRef}.`
    )
    return newRef
  } else {
    return ref
  }
}

function getRefFromEnv(): string {
  // To workaround a limitation of Actions dynamic workflows not setting
  // the GITHUB_REF in some cases, we accept also the ref within the
  // CODE_SCANNING_REF variable. When possible, however, we prefer to use
  // the GITHUB_REF as that is a protected variable and cannot be overwritten.
  let refEnv: string
  try {
    refEnv = getRequiredEnvParam('GITHUB_REF')
  } catch (e) {
    // If the GITHUB_REF is not set, we try to rescue by getting the
    // CODE_SCANNING_REF.
    const maybeRef = process.env['CODE_SCANNING_REF']
    if (maybeRef === undefined || maybeRef.length === 0) {
      throw e
    }
    refEnv = maybeRef
  }
  return refEnv
}

/**
 * Returns the name of the event that triggered this workflow.
 *
 * This will be "dynamic" for default setup workflow runs.
 */
export function getWorkflowEventName(): string {
  return getRequiredEnvParam('GITHUB_EVENT_NAME')
}

/**
 * Returns whether the current workflow is executing a local copy of the Action, e.g. we're running
 * a workflow on the codeql-action repo itself.
 */
export function isRunningLocalAction(): boolean {
  const relativeScriptPath = getRelativeScriptPath()
  return (
    relativeScriptPath.startsWith('..') || path.isAbsolute(relativeScriptPath)
  )
}

/**
 * Get the location where the Action is running from.
 *
 * This can be used to get the Action's name or tell if we're running a local Action.
 */
export function getRelativeScriptPath(): string {
  const runnerTemp = getRequiredEnvParam('RUNNER_TEMP')
  const actionsDirectory = path.join(path.dirname(runnerTemp), '_actions')
  return path.relative(actionsDirectory, __filename)
}

/** Returns the contents of `GITHUB_EVENT_PATH` as a JSON object. */
function getWorkflowEvent(): any {
  const eventJsonFile = getRequiredEnvParam('GITHUB_EVENT_PATH')
  try {
    return JSON.parse(fs.readFileSync(eventJsonFile, 'utf-8'))
  } catch (e) {
    throw new Error(
      `Unable to read workflow event JSON from ${eventJsonFile}: ${e}`
    )
  }
}

function removeRefsHeadsPrefix(ref: string): string {
  return ref.startsWith('refs/heads/') ? ref.slice('refs/heads/'.length) : ref
}

/**
 * Returns whether we are analyzing the default branch for the repository.
 *
 * This first checks the environment variable `CODE_SCANNING_IS_ANALYZING_DEFAULT_BRANCH`. This
 * environment variable can be set in cases where repository information might not be available, for
 * example dynamic workflows.
 */
export async function isAnalyzingDefaultBranch(): Promise<boolean> {
  if (process.env.CODE_SCANNING_IS_ANALYZING_DEFAULT_BRANCH === 'true') {
    return true
  }

  // Get the current ref and trim and refs/heads/ prefix
  let currentRef = await getRef()
  currentRef = removeRefsHeadsPrefix(currentRef)

  const event = getWorkflowEvent()
  let defaultBranch = event?.repository?.default_branch

  if (getWorkflowEventName() === 'schedule') {
    defaultBranch = removeRefsHeadsPrefix(getRefFromEnv())
  }

  return currentRef === defaultBranch
}

/**
 * Get the workflow run ID.
 */
export function getWorkflowRunID(): number {
  const workflowRunIdString = getRequiredEnvParam('GITHUB_RUN_ID')
  const workflowRunID = parseInt(workflowRunIdString, 10)
  if (Number.isNaN(workflowRunID)) {
    throw new Error(
      `GITHUB_RUN_ID must define a non NaN workflow run ID. Current value is ${workflowRunIdString}`
    )
  }
  if (workflowRunID < 0) {
    throw new Error(
      `GITHUB_RUN_ID must be a non-negative integer. Current value is ${workflowRunIdString}`
    )
  }
  return workflowRunID
}

/**
 * Get the workflow run attempt number.
 */
export function getWorkflowRunAttempt(): number {
  const workflowRunAttemptString = getRequiredEnvParam('GITHUB_RUN_ATTEMPT')
  const workflowRunAttempt = parseInt(workflowRunAttemptString, 10)
  if (Number.isNaN(workflowRunAttempt)) {
    throw new Error(
      `GITHUB_RUN_ATTEMPT must define a non NaN workflow run attempt. Current value is ${workflowRunAttemptString}`
    )
  }
  if (workflowRunAttempt <= 0) {
    throw new Error(
      `GITHUB_RUN_ATTEMPT must be a positive integer. Current value is ${workflowRunAttemptString}`
    )
  }
  return workflowRunAttempt
}
