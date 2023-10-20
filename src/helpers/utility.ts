import * as fs from 'fs'
import * as path from 'path'

/**
 * Get an environment parameter, but throw an error if it is not set.
 */
export function getRequiredEnvParam(paramName: string): string {
  const value = process.env[paramName]
  if (value === undefined || value.length === 0) {
    throw new Error(`${paramName} environment variable must be set`)
  }
  return value
}

export class HTTPError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

/**
 * An Error class that indicates an error that occurred due to
 * a misconfiguration of the action or the CodeQL CLI.
 */
export class UserError extends Error {
  /* eslint-disable-next-line no-useless-constructor */
  constructor(message: string) {
    super(message)
  }
}

/*eslint-next-line @typescript-eslint/no-explicit-any*/
export function isHTTPError(arg: any): arg is HTTPError {
  return arg?.status !== undefined && Number.isInteger(arg.status)
}

/*
 * Returns whether the path in the argument represents an existing directory.
 */
export function doesDirectoryExist(dirPath: string): boolean {
  try {
    const stats = fs.lstatSync(dirPath)
    return stats.isDirectory()
  } catch (e) {
    return false
  }
}

/*
 * Returns whether the file exists
 */
export function doesFileExist(filePath: string): boolean {
  try {
    const stats = fs.lstatSync(filePath)
    return stats.isFile()
  } catch (e) {
    return false
  }
}

/**
 * Returns a recursive list of files in a given directory.
 */
export function listFolder(dir: string): string[] {
  if (!doesDirectoryExist(dir)) {
    return []
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  let files: string[] = []
  for (const entry of entries) {
    if (entry.isFile()) {
      files.push(path.resolve(dir, entry.name))
    } else if (entry.isDirectory()) {
      files = files.concat(listFolder(path.resolve(dir, entry.name)))
    }
  }
  return files
}

/**
 * This function implements a heuristic to determine whether the
 * runner we are on is hosted by GitHub. It does this by checking
 * the name of the runner against the list of known GitHub-hosted
 * runner names. It also checks for the presence of a toolcache
 * directory with the name hostedtoolcache which is present on
 * GitHub-hosted runners.
 *
 * @returns true iff the runner is hosted by GitHub
 */
export function isHostedRunner(): boolean | undefined {
  return (
    // Name of the runner on hosted Windows runners
    process.env['RUNNER_NAME']?.includes('Hosted Agent') ||
    // Name of the runner on hosted POSIX runners
    process.env['RUNNER_NAME']?.includes('GitHub Actions') ||
    // Segment of the path to the tool cache on all hosted runners
    process.env['RUNNER_TOOL_CACHE']?.includes('hostedtoolcache')
  )
}

export function wrapError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

export function resolveDirectory(testPath: string): string {
  return path.resolve(testPath)
}
