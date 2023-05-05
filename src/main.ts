import * as core from '@actions/core'
import {inputs as getInput} from './utils/inputs'
import {calculateDateRange} from './utils/utils'
import {
  getSecretScanningAlertsForScope,
  filterAlerts
} from './services/secretscanning'
import {writeToFile} from './utils/utils'
import { OrgSecurityManagers, SecurityManagerMembers, Users } from './api/securitymanagers'
import { write } from 'fs'

async function run(): Promise<void> {
  try {
    const inputs = await getInput()
    core.info(`[✅] Inputs parsed]`)

    //Get Security Managers
    const securityManagers = await OrgSecurityManagers(inputs)

    //For each data element in Security managers object, get the members
    securityManagers.forEach(async (team) => {
        const members = await SecurityManagerMembers(inputs, team)
        core.info(`[✅] Members retrieved for team ${members}`)
        
        var userEmails: { email: string }[] = []
        for( var member of members){
          const user = await Users(inputs, member.login)
          core.info(`[✅] User retrieved for ${user.login}, ${user.email}`)
          if(user.email != null){
          var data = {email : user.email}    
          //add data to userEmails
          userEmails.push(data)
          }
        }
        console.info(`JSON for users is ${JSON.stringify(userEmails)}`)
        writeToFile("emails.json", JSON.stringify(userEmails))


    })

    core.info(`[✅] Security Managers and Members retrieved`)
    //Calculate date range
    const minimumDate = await calculateDateRange(inputs.frequency)
    core.info(`[✅] Date range calculated: ${minimumDate}`)

    //Get the alerts for the scope provided
    const alerts = await getSecretScanningAlertsForScope(inputs)

    // Filter new alerts created after the minimum date and before the current date
    const [newAlerts, resolvedAlerts] = await filterAlerts(minimumDate, alerts)

    // Log filtered resolved alerts
    core.debug(
      `The filtered resolved alrets is ${JSON.stringify(resolvedAlerts)}`
    )
    core.debug(`The filtered new alerts is ${JSON.stringify(newAlerts)}`)

    // Save newAlerts and resolvedAlerts to file
    writeToFile(inputs.new_alerts_filepath, JSON.stringify(newAlerts))
    writeToFile(inputs.closed_alerts_filepath, JSON.stringify(resolvedAlerts))
    core.debug('New alerts JSON data is saved.')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
