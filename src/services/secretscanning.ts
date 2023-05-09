import type {inputsReturned} from '../types/common/main'
import {fetchSecretScanningAlerts} from '../api/secretscanningalerts'
import {SecretScanningAlert} from '../types/common/main'
import * as core from '@actions/core'

export async function getSecretScanningAlertsForScope(
  input: inputsReturned
): Promise<SecretScanningAlert[]> {
  let res: SecretScanningAlert[] = []
  try {
    res = await fetchSecretScanningAlerts(input)
    return res
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.debug(`Error with fatching alerts from the API.: ${error}`)
      core.setFailed(
        'Error: There was an error fetching the alerts from the API. Please check the logs.'
      )
      throw new Error(error.message)
    }
  }
  return res
}

// filter the alerts based on the minimum date and current date and by status (new or resolved) and return in two objects
export async function filterAlerts(
  minimumDate: Date,
  alerts: SecretScanningAlert[]
): Promise<SecretScanningAlert[][]> {
  // Filter new alerts created after the minimum date and before the current date
  const newAlertsResponse = alerts.filter(alert => {
    if (alert.created_at != null && alert.state === 'open') {
      const created = new Date(alert.created_at)
      return created > minimumDate && created < new Date()
    }
  })

  // Filter resolved alerts created after the minimum date and before the current date
  const resolvedAlertsResponse = alerts.filter(alert => {
    if (alert.resolved_at != null && alert.state === 'resolved') {
      const resolved = new Date(alert.resolved_at)
      alert.state === 'resolved'
      return resolved > minimumDate && resolved < new Date()
    }
  })

  return [newAlertsResponse, resolvedAlertsResponse]
}
