import * as core from '@actions/core'
import * as github from '@actions/github'
import {GitHub, getOctokitOptions} from '@actions/github/lib/utils'
import * as retry from '@octokit/plugin-retry'
import consoleLogLevel from 'console-log-level'
import * as fs from 'fs'

type GitHubClient = InstanceType<typeof GitHub>

function getRequiredEnvParam(paramName: string): string {
  const value = process.env[paramName]
  if (value === undefined || value.length === 0) {
    throw new Error(`${paramName} environment variable must be set`)
  }
  return value
}

async function calculateDateRange(frequency: number): Promise<Date> {
  const now = new Date()
  const nowMinusFrequency = new Date(now.getTime() - frequency * 60 * 60 * 1000)
  return nowMinusFrequency
}

async function processRepoLevelAlerts(
  client: GitHubClient,
  minimumDate: Date
): Promise<void> {
  const nwo = github.context.repo
  //add in extra params based on requirements
  const repoResponse = await client.rest.secretScanning.listAlertsForRepo({
    ...nwo
  })

  //filter response to only include alerts that are create betweween nowMinusFrequency and now
  const newAlertsResponse = repoResponse.data.filter(alert => {
    if (alert.created_at != null) {
      const created = new Date(alert.created_at)
      return created > minimumDate && created < new Date()
    }
  })

  //print output for debugging
  core.debug(`The filtered response is ${JSON.stringify(newAlertsResponse)}`)

  //map only the properties we're interested in
  const newAlertsResponseFiltered = newAlertsResponse.map(alert => {
    return {
      secret_type: alert.secret_type,
      secret_state: alert.state,
      secret_url: alert.url
    }
  })

  //write newAlertsResponseFiltered to json file using fs
  fs.writeFile(
    'newAlertsRepo.json',
    JSON.stringify(newAlertsResponseFiltered),
    err => {
      if (err) {
        throw err
      }
      core.debug('JSON data is saved.')
    }
  )

  const resolvedAlertsResponse = repoResponse.data.filter(alert => {
    if (alert.resolved_at != null && alert.state === 'resolved') {
      const resolved = new Date(alert.resolved_at)
      alert.state === 'resolved'
      return resolved > minimumDate && resolved < new Date()
    }
  })
  core.debug(
    `The filtered response is ${JSON.stringify(resolvedAlertsResponse)}`
  )

  const resolvedAlertsResponseFiltered = newAlertsResponse.map(alert => {
    return {
      secret_type: alert.secret_type,
      secret_state: alert.state,
      secret_url: alert.url,
      secret_resolved_by: alert.resolved_by,
      secret_resolved_at: alert.resolved_at
    }
  })
  //write resolvedAlertsResponse to json file using fs
  fs.writeFile(
    'resolvedAlertsRepo.json',
    JSON.stringify(resolvedAlertsResponseFiltered),
    err => {
      if (err) {
        throw err
      }
      core.debug('JSON data is saved.')
    }
  )
}

//process Org level alerts
async function processOrgLevelAlerts(
  client: GitHubClient,
  minimumDate: Date
): Promise<void> {
  //Org level file generation
  const org = github.context.repo.owner
  const orgResponse = await client.rest.secretScanning.listAlertsForOrg({org})
  core.debug(`The orgResponse is ${JSON.stringify(orgResponse)}`)
  const newAlertsResponse = orgResponse.data.filter(alert => {
    if (alert.created_at != null) {
      const created = new Date(alert.created_at)
      return created > minimumDate && created < new Date()
    }
  })
  core.debug(`The filtered response is ${JSON.stringify(newAlertsResponse)}`)
  const newAlertsResponseFiltered = newAlertsResponse.map(alert => {
    return {
      secret_repo: alert?.repository?.full_name,
      secret_type: alert.secret_type,
      secret_state: alert.state,
      secret_url: alert.url
    }
  })
  //write newAlertsResponseFiltered to json file using fs
  fs.writeFile(
    'newAlertsOrg.json',
    JSON.stringify(newAlertsResponseFiltered),
    err => {
      if (err) {
        throw err
      }
      core.debug('JSON data is saved.')
    }
  )

  const resolvedAlertsResponse = orgResponse.data.filter(alert => {
    if (alert.resolved_at != null && alert.state === 'resolved') {
      const resolved = new Date(alert.resolved_at)
      alert.state === 'resolved'
      return resolved > minimumDate && resolved < new Date()
    }
  })
  core.debug(
    `The filtered response is ${JSON.stringify(resolvedAlertsResponse)}`
  )
  const resolvedAlertsResponseFiltered = newAlertsResponse.map(alert => {
    return {
      secret_repo: alert?.repository?.full_name,
      secret_type: alert.secret_type,
      secret_state: alert.state,
      secret_url: alert.url,
      secret_resolved_by: alert.resolved_by,
      secret_resolved_at: alert.resolved_at
    }
  })
  //write resolvedAlertsResponse to json file using fs
  fs.writeFile(
    'resolvedAlertsOrg.json',
    JSON.stringify(resolvedAlertsResponseFiltered),
    err => {
      if (err) {
        throw err
      }
      core.debug('JSON data is saved.')
    }
  )
}

async function run(): Promise<void> {
  try {
    const frequency: number = Number(core.getInput('frequency'))

    core.debug(`The frequency input is ${frequency}`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    const level: string = core.getInput('level')

    const api_token =
      core.getInput('token') || getRequiredEnvParam('GITHUB_TOKEN')

    const apiURL = getRequiredEnvParam('GITHUB_API_URL')

    const retryingOctokit = GitHub.plugin(retry.retry)
    const client = new retryingOctokit(
      getOctokitOptions(api_token, {
        baseUrl: apiURL,
        userAgent: 'secret-scanning-custom-notification',
        log: consoleLogLevel({level: 'debug'})
      })
    )

    //Calculate date range
    const minimumDate = await calculateDateRange(frequency)
    //Repo level file generation
    if (level === 'repo') {
      await processRepoLevelAlerts(client, minimumDate)
    } else if (level === 'organisation') {
      await processOrgLevelAlerts(client, minimumDate)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
