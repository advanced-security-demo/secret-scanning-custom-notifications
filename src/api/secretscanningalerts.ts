import * as core from '@actions/core'
import {SecretScanningAlert, inputsReturned} from '../types/common/main'
import {MyOctokit} from './myoctokit'

export const RepoSecretScanningAlerts = async (
  input: inputsReturned
): Promise<SecretScanningAlert[]> => {
  let res: SecretScanningAlert[] = []
  try {
    const octokit = new MyOctokit(input)
    const iterator = await octokit.paginate(
      'GET /repos/{owner}/{repo}/secret-scanning/alerts',
      {
        owner: input.owner,
        repo: input.repo,
        per_page: 100
      },
      response => {
        return response.data
      }
    )
    res = iterator as unknown as SecretScanningAlert[]
  } catch (error) {
    core.setFailed(`There was an error. Please check the logs${error}`)
  }
  return res
}

export const OrgSecretScanningAlerts = async (
  input: inputsReturned
): Promise<SecretScanningAlert[]> => {
  let res: SecretScanningAlert[] = []
  try {
    const octokit = new MyOctokit(input)
    const iterator = await octokit.paginate(
      'GET /orgs/{org}/secret-scanning/alerts',
      {
        org: input.owner,
        per_page: 100
      },
      response => {
        return response.data
      }
    )
    res = iterator as unknown as SecretScanningAlert[]
  } catch (error) {
    core.setFailed(`There was an error. Please check the logs${error}`)
  }
  return res
}

export const EnterpriseSecretScanningAlerts = async (
  input: inputsReturned
): Promise<SecretScanningAlert[]> => {
  let res: SecretScanningAlert[] = []
  try {
    const octokit = new MyOctokit(input)
    const iterator = await octokit.paginate(
      'GET /enterprises/{enterprise}/secret-scanning/alerts',
      {
        enterprise: input.enterprise,
        per_page: 100
      },
      response => {
        return response.data
      }
    )
    res = iterator as unknown as SecretScanningAlert[]
  } catch (error) {
    core.setFailed(`There was an error. Please check the logs${error}`)
  }
  return res
}
