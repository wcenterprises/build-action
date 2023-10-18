import * as au from '../src/helpers/action-util'
import * as fs from 'fs'
import * as path from 'path'
import { expect } from '@jest/globals'
import { UserConfig } from '../src/helpers/config-utils'

describe('test action-util', () => {
  beforeAll(() => {})

  afterAll(() => {})

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {})

  it('getYamlConfig should return a UserConfig instance', () => {
    const config: UserConfig = au.getYamlConfig(
      path.join(__dirname, 'action-config.yml')
    )
    expect(config).toBeTruthy()
    expect(config).toHaveProperty('name')
    expect(config).toHaveProperty('config')
    expect(config).toHaveProperty('config.authors')
    expect(config).toHaveProperty('config.company')
    expect(config).toHaveProperty('config.copyright')
    expect(config).toHaveProperty('config.description')
    expect(config).toHaveProperty('config.product')
  })

  it('UserConfig should return all properties', async () => {
    const userConfig: UserConfig = au.getYamlConfig(
      path.join(__dirname, 'action-config.yml')
    )
  })
})
