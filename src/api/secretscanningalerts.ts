import * as core from '@actions/core'
import {SecretScanningAlert, inputsReturned} from '../types/common/main'
import {MyOctokit} from './myoctokit'

export async function fetchSecretScanningAlerts(input: inputsReturned) {
  let res: SecretScanningAlert[] = []
  const options = getOptions(input)
  const octokit = new MyOctokit(input)
  const iterator = await octokit.paginate(options.url, options)
  res = iterator as SecretScanningAlert[]

  return res
}

function getOptions(input: inputsReturned) {
  switch (input.scope) {
    case 'repository':
      return {
        method: 'GET',
        url: '/repos/{owner}/{repo}/secret-scanning/alerts',
        owner: input.owner,
        repo: input.repo,
        per_page: 100
      }
    case 'organisation':
      return {
        method: 'GET',
        url: '/orgs/{org}/secret-scanning/alerts',
        org: input.owner,
        per_page: 100
      }
    case 'enterprise':
      return {
        method: 'GET',
        url: '/enterprises/{enterprise}/secret-scanning/alerts',
        enterprise: input.enterprise,
        per_page: 100
      }
    default:
      core.info(`[❌] Invalid scope: ${input.scope}`)
      throw new Error('Invalid scope')
  }
}
