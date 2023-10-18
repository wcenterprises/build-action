import * as core from '@actions/core'
import { context } from '@actions/github'

import {
  TimeStamp,
  calculateRevison,
  getBuildNumber
} from './helpers/version-helpers'

import { ActionInput, EnvVar } from './helpers/environment'

import {
  getRequiredInput,
  getOptionalInput,
  getYamlConfig
} from './helpers/action-util'

import { UserConfig } from './helpers/config-utils'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const timeStamp: Date = TimeStamp
    core.exportVariable(String(EnvVar.TIMESTAMP), timeStamp)

    const configPath = getOptionalInput(String(ActionInput.CONFIGFILE))
    if (configPath) {
      const userConfig: UserConfig = getYamlConfig(configPath)
      core.exportVariable(String(EnvVar.COMPANY), userConfig.config?.company)
      core.exportVariable(String(EnvVar.AUTHORS), userConfig.config?.authors)
      core.exportVariable(String(EnvVar.COPYRIGHT), userConfig.config?.copyright)
      core.exportVariable(String(EnvVar.PRODUCT), userConfig.config?.product)
    }

    core.exportVariable(String(EnvVar.ARTIFACTDIRECORY),'TODO: ')

  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
