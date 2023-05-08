import * as core from '@actions/core'
import {SummaryTableRow} from '@actions/core/lib/summary'
import { SecretScanningAlert } from '../types/common/main'

export function addToSummary(
  title: string,
  alerts: SecretScanningAlert[],
) {
  const headers = ['Alert Number', 'Secret State', 'Secret Type', 'HTML URL']
  // Define the table rows
  const rows = alerts.map(alert => [
    alert.number.toString(),
    alert.state,
    alert.secret_type,
    alert.html_url
  ])

  // Add the table to the Action summary
  core.summary
    .addHeading(title)
    .addTable([
      headers.map(header => ({data: header, header: true})),
      ...rows
    ] as SummaryTableRow[])
    .addBreak()
}

export function writeSummary(){
    core.summary.write()
    core.info(`[✅] Action summary written`)
}

export function getSummaryMarkdown(){
    return core.summary.stringify()
}
