// Get inputs for the action
import * as core from '@actions/core'
import * as github from '@actions/github'
import type {scopeInput, inputsReturned} from '../types/common/main'
import * as dotenv from "dotenv";
dotenv.config();

export const inputs = async (): Promise<inputsReturned> => {
  try {
    
    let frequency: number;
    let scope: scopeInput;
    let api_token: string;
    let apiURL: string;
    let repo = "";
    let owner = "";
    let enterprise = "";
    //if the env LOCAL_DEV is set to true, then use the .env file
    if (process.env.LOCAL_DEV === 'true') {
      frequency = Number(process.env.FREQUENCY)
      scope = process.env.SCOPE as scopeInput
      api_token = process.env.GITHUB_TOKEN as string
      apiURL = process.env.GITHUB_API_URL as string
      repo = process.env.GITHUB_REPOSITORY as string
      owner = process.env.GITHUB_ACTOR as string
      enterprise = process.env.GITHUB_ENTERPRISE as string
    } else {
      //otherwise use the inputs from the action
      frequency = Number(core.getInput('frequency'))
      scope = core.getInput('scope') as scopeInput
      api_token = core.getInput('token')
      apiURL = core.getInput('api_url')
      repo = core.getInput('repo') || github.context.repo.repo
      owner = core.getInput('owner') || github.context.repo.owner
      enterprise = core.getInput('enterprise')
    }
    return {
      frequency,
      scope,
      api_token,
      apiURL,
      repo,
      owner,
      enterprise
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.debug(`Error in inputs.ts: ${error}`)
      core.setFailed(
        'Error: There was an error getting the inputs. Please check the logs.'
      )
      throw new Error(error.message)
    }
  }
  throw new Error('Unexpected error occurred in inputs.ts')
}
