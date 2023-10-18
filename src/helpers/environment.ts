export enum EnvVar {
  TIMESTAMP = '__TIMESTAMP',
  ARTIFACTDIRECORY = '__ARTIFACTDIRECORY',
  STAGINGDIRECTORY = '__STAGINGDIRECTORY',
  PACKAGEDIRECTORY = '__PACKAGEDIRECTORY',
  COPYRIGHT = '__COPYRIGHT',
  AUTHORS = '__AUTHORS',
  COMPANY = '__COMPANY',
  CHANNEL = '__CHANNEL',
  VERSION = '__VERSION',
  INFORMATIONALVERSION = '__INFORMATIONALVERSION',
  REVISION = '__REVISION',
  PRODUCT = '__PRODUCT'
}

export enum ActionInput {
  REPOSITORY = 'repository',
  TOKEN = 'token',
  SHA = 'sha',
  NAME = 'name',
  CONFIGFILE = 'config-file'
}

export enum ActionOutput {
  ARTIFACTDIRECORY = 'artifact-directory',
  STAGINGDIRECTORY = 'staging-directory',
  PACKAGEDIRECTORY = 'packaging-directory',
  COPYRIGHT = 'copyright',
  AUTHORS = 'authors',
  COMPANY = 'company',
  CHANNEL = 'channel',
  VERSION = 'version',
  INFORMATIONALVERSION = 'informational-version',
  REVISION = 'revision'
}

export class Environment {
  github_workspace: string
  constructor() {

  }
}
