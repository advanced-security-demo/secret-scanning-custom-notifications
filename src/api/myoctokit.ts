import {Octokit} from '@octokit/action'
import {inputsReturned} from '../types/common/main'

export class MyOctokit extends Octokit {
  constructor(input: inputsReturned) {
    super({
      baseUrl: input.apiURL,
      auth: input.api_token,
      throttle: {
        onRateLimit: (retryAfter: any, options: any, octokit: any) => {
          octokit.log.warn(
            `Request quota exhausted for request ${options.method} ${options.url}`
          )
          if (options.request.retryCount <= 2) {
            octokit.log.warn(`Retrying after ${retryAfter} seconds!`)
            return true
          }
        },
        onSecondaryRateLimit: (retryAfter: any, options: any, octokit: any) => {
          octokit.log.warn(
            `Secondary rate limit for request ${options.method} ${options.url}`
          )
          if (options.request.retryCount <= 2) {
            octokit.log.warn(
              `Secondary Limit - Retrying after ${retryAfter} seconds!`
            )
            return true
          }
        }
      }
    })
  }
}
