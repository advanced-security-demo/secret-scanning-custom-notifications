import * as core from '@actions/core'
import {SecurityManagerTeam, Member, inputsReturned} from '../types/common/main'
import {MyOctokit} from './myoctokit'


export const OrgSecurityManagers = async (
  input: inputsReturned
): Promise<SecurityManagerTeam[]> => {
  let res: SecurityManagerTeam[] = []
  try {
    const octokit = new MyOctokit(input)
    const iterator = await octokit.orgs.listSecurityManagerTeams(
      { org: input.owner }
    )
    res = iterator.data as unknown as SecurityManagerTeam[]
  } catch (error) {
    core.setFailed(`There was an error. Please check the logs${error}`)
  }
  return res
}

export const SecurityManagerMembers = async(
    input: inputsReturned, team: SecurityManagerTeam
): Promise<Member[]> => {
    let res: Member[] = []
    try {
        const octokit = new MyOctokit(input)
        const iterator = await octokit.paginate(
            'GET /orgs/{org}/teams/{team_slug}/members',
            {
                org: input.owner,
                team_slug: team.slug,
                per_page: 100
            }, response => { return response.data }
        )
        res = iterator as unknown as Member[]
    } catch (error) {
        core.setFailed(`There was an error. Please check the logs${error}`)
    }
    return res
}

export const Users = async(
    input: inputsReturned, username: string
): Promise<Member> => {
    let res: Member = {} as Member
    try {
        const octokit = new MyOctokit(input)
        const iterator = await octokit.users.getByUsername(
            { username: username }
        )
        res = iterator.data as unknown as Member
    } catch (error) {
        core.setFailed(`There was an error. Please check the logs${error}`)
    }
    return res
}