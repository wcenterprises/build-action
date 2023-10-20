/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import * as util from '../src/helpers/utility'
import { expect } from '@jest/globals'
//import * as fs from 'fs'

describe('utility', () => {
  it('file should exist doesFileExist', async () => {
    const result: boolean = util.doesFileExist(`${__dirname}/utility.test.ts`)
    expect(result).toBeTruthy()
  })

  it('file should not exist doesFileExist', async () => {
    const result: boolean = util.doesFileExist(`${__dirname}/foobar.test.ts`)
    expect(result).toBeFalsy()
  })
})
