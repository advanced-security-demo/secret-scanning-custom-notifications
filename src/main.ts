import * as core from '@actions/core'
import * as github from '@actions/github';
import { GitHub, getOctokitOptions } from "@actions/github/lib/utils";
import * as retry from "@octokit/plugin-retry"; 
import consoleLogLevel from "console-log-level";


type GitHubClient = InstanceType<typeof GitHub>;

interface Nwo {
  owner: string;
  repo: string;
}

function getRequiredEnvParam(paramName: string): string {

  const value = process.env[paramName];
  if (value === undefined || value.length === 0) {
    throw new Error(`${paramName} environment variable must be set`);
  }
  return value ;
}

async function run(): Promise<void> {
  try {
    const frequency: number = Number(core.getInput('frequency'))

    core.debug(`The frequency input is ${frequency}`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    const level: string = core.getInput('level')
    const api_token = 
      core.getInput("token") || getRequiredEnvParam("GITHUB_TOKEN");
      
    const apiURL = getRequiredEnvParam("GITHUB_API_URL");

    const retryingOctokit = GitHub.plugin(retry.retry);
    const client = new retryingOctokit(
      getOctokitOptions(api_token, {
        baseUrl: apiURL,
        userAgent: "secret-scanning-custom-notification",
        log: consoleLogLevel({ level: "debug" }),
      })
    );
    if (level === 'repo') {
      const nwo = github.context.repo
      //add in extra params based on requirements 
      const repoResponse = await client.rest.secretScanning.listAlertsForRepo({ ...nwo})

      //get UTC Date and time now 
      const now = new Date()

      //get UTC Date and time now minus frequency in hours
      const nowMinusFrequency = new Date(now.getTime() - frequency * 60 * 60 * 1000)

      //filter response to only include alerts that are create betweween nowMinusFrequency and now
      const filteredResponse = repoResponse.data.filter((alert) => {
        const created = new Date(Number(alert.created_at))
        return created > nowMinusFrequency && created < now
      })
      //print output for debugging
      core.debug(`The filtered response is ${JSON.stringify(filteredResponse)}`)

    }
  }
   catch (error) {
  if (error instanceof Error) core.setFailed(error.message)
}
}


run()
