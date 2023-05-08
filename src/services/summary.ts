import * as core from '@actions/core'
import {SummaryTableRow} from '@actions/core/lib/summary'
import { SecretScanningAlert } from '../types/common/main'

export function addToSummary(
  title: string,
  alerts: SecretScanningAlert[],
) {
  const headers = ['Alert Number', 'Secret Name', 'Repository Name', 'HTML URL']
  // Define the table rows
  const rows = alerts.map(alert => [
    alert.number,
    alert.secret.name,
    alert.repository.name,
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
