import * as core from '@actions/core'
import type {SecurityManagerTeam, inputsReturned} from '../types/common/main'
import {
  OrgSecretScanningAlerts,
  RepoSecretScanningAlerts,
  EnterpriseSecretScanningAlerts
} from '../api/secretscanningalerts'
import {SecretScanningAlert} from '../types/common/main'
import { OrgSecurityManagers } from '../api/securitymanagers'

export async function getSecretScanningAlertsForScope(
  input: inputsReturned
): Promise<SecretScanningAlert[]> {
  let res: SecretScanningAlert[] = []
  if (input.scope === 'repository') {
    res = await RepoSecretScanningAlerts(input)
  } else if (input.scope === 'organisation') {
    res = await OrgSecretScanningAlerts(input)
  } else if (input.scope === 'enterprise') {
    res = await EnterpriseSecretScanningAlerts(input)
  } else {
    core.info(`[❌] Scope is invalid`)
  }
  return res
}

export async function getSecurityManagersForScope( 
  input: inputsReturned 
  ): Promise<SecurityManagerTeam[]> {
  let res: SecurityManagerTeam[] = [] 
  res = await OrgSecurityManagers(input)
  return res
  }  



// filter the alerts based on the minimum date and current date and by status (new or resolved) and return in two objects
export async function filterAlerts(
  minimumDate: Date,
  alerts: SecretScanningAlert[]
): Promise<SecretScanningAlert[][]> {
  // Filter new alerts created after the minimum date and before the current date
  const newAlertsResponse = alerts.filter(alert => {
    if (alert.created_at != null) {
      const created = new Date(alert.created_at)
      return created > minimumDate && created < new Date()
    }
  })

  // Filter resolved alerts created after the minimum date and before the current date
  const resolvedAlertsResponse = alerts.filter(alert => {
    if (alert.resolved_at != null && alert.status === 'resolved') {
      const resolved = new Date(alert.resolved_at)
      alert.status === 'resolved'
      return resolved > minimumDate && resolved < new Date()
    }
  })

  return [newAlertsResponse, resolvedAlertsResponse]
}
