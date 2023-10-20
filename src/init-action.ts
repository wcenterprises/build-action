import * as core from '@actions/core'
import { context, getOctokit } from '@actions/github'
import process from 'process'
import fs from 'fs'
import path from 'path'

import {
  TimeStamp,
  calculateRevison,
  getBuildNumber
} from './helpers/version-helpers'

import { ActionInput, ActionOutput, EnvVar } from './helpers/environment'

import {
  getRequiredInput,
  getOptionalInput,
  getYamlConfig,
  getResolvedDirectory
} from './helpers/action-util'

import { UserConfig } from './helpers/config-utils'
import { UserError } from './helpers/utility'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const timeStamp: Date = TimeStamp
    core.setOutput(String(ActionOutput.TIMESTAMP), timeStamp)
    const token = core.getInput(String(ActionInput.TOKEN), { required: true })

    const configPath = getOptionalInput(String(ActionInput.CONFIGFILE))
    if (configPath) {
      const userConfig: UserConfig = getYamlConfig(configPath)
      if (userConfig) {
        core.setOutput(String(ActionOutput.COMPANY), userConfig.config?.company)

        core.exportVariable(String(EnvVar.COMPANY), userConfig.config?.company)
        core.setOutput(String(ActionOutput.AUTHORS), userConfig.config?.authors)
        core.exportVariable(String(EnvVar.AUTHORS), userConfig.config?.authors)
        core.setOutput(
          String(ActionOutput.COPYRIGHT),
          userConfig.config?.copyright
        )
        core.exportVariable(
          String(EnvVar.COPYRIGHT),
          userConfig.config?.copyright
        )
        core.setOutput(String(ActionOutput.PRODUCT), userConfig.config?.product)
        core.exportVariable(String(EnvVar.PRODUCT), userConfig.config?.product)
      } else {
        throw new UserError('Invalid configuration!')
      }
    }
    const workspaceDirectory: string = process.env.GITHUB_WORKSPACE as string

    const workspaceDiretoryBase: string = getResolvedDirectory(
      path.join(workspaceDirectory, '../'),
      false
    )

    const stagingDirectory: string = getResolvedDirectory(
      path.join(workspaceDiretoryBase, 's'),
      true
    )
    core.setOutput(String(ActionOutput.STAGINGDIRECTORY), stagingDirectory)

    const artifactDirectory: string = getResolvedDirectory(
      path.join(workspaceDiretoryBase, 'a'),
      true
    )
    core.setOutput(String(ActionOutput.ARTIFACTDIRECORY), artifactDirectory)

    const packageDirectory: string = getResolvedDirectory(
      path.join(workspaceDiretoryBase, 'p'),
      true
    )
    core.setOutput(String(ActionOutput.PACKAGEDIRECTORY), packageDirectory)

    core.setOutput(String(ActionOutput.WORKSPACE), process.env.GITHUB_WORKSPACE)

    core.exportVariable(String(EnvVar.ARTIFACTDIRECORY), 'TODO: ')
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
