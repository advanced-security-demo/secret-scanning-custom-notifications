import * as core from '@actions/core'
import {inputs as getInput} from './utils/inputs'
import {calculateDateRange} from './utils/utils'
import {
  getSecretScanningAlertsForScope,
  filterAlerts
} from './services/secretscanning'
import {writeToFile} from './utils/utils'
import { OrgSecurityManagers, SecurityManagerMembers, Users } from './api/securitymanagers'
import { SummaryTableRow } from "@actions/core/lib/summary";

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
        
        const userEmails: { email: string }[] = []
        for( const member of members){
          const user = await Users(inputs, member.login)
          core.info(`[✅] User retrieved for ${user.login}, ${user.email}`)
          if(user.email != null){
            userEmails.push({email : user.email} )
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
    
    // Print them as Action summary output
    const headers = ['Alert Number', 'Secret Name', 'Repository Name', 'HTML URL']
    // Define the table rows
    const rowsNewAlerts = newAlerts.map(alert => [
      alert.number,
      alert.secret.name,
      alert.repository.name,
      alert.html_url
    ])
    const rowsResolvedAlerts = resolvedAlerts.map(alert => [
      alert.number,
      alert.secret.name,
      alert.repository.name,
      alert.html_url
    ])

    // Add the table to the Action summary
    core.summary.addHeading('New Alerts')
    core.summary.addTable([
      headers.map(header => ({ data: header, header: true })),
      ...rowsNewAlerts
    ] as SummaryTableRow[])
    core.summary.addHeading('Resolved Alerts')
    core.summary.addTable([
      headers.map(header => ({ data: header, header: true })),
      ...rowsResolvedAlerts
    ] as SummaryTableRow[])
    core.summary.write()
    core.info(`[✅] Action summary written`)


  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
