import * as core from '@actions/core'

export async function run(): Promise<void> {
  try {
    const timestamp: string = core.getInput('timestamp')
    console.log(`TIMESTAMP: ${timestamp}`)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
