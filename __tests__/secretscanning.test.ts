import {
  getSecretScanningAlertsForScope,
  filterAlerts
} from '../src/services/secretscanning'
import {
  inputsReturned,
  SecretScanningAlert
} from '../src/types/common'
import {fetchSecretScanningAlerts} from '../src/api/secretscanningalerts'

jest.mock('@actions/core')
jest.mock('../src/api/secretscanningalerts')

describe('secretscanning', () => {
  let processEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    processEnv = {...process.env}
    jest.resetAllMocks()
  })

  afterEach(() => {
    process.env = processEnv
  })

  describe('getSecretScanningAlertsForScope', () => {
    it('should return the alerts for a repository', async () => {
      const input: inputsReturned = {
        frequency: 1,
        scope: 'repository',
        api_token: 'ghp_1234567890',
        apiURL: 'https://api.github.com',
        repo: 'repo',
        owner: 'owner',
        enterprise: 'octocat',
        new_alerts_filepath: 'new-alerts.json',
        closed_alerts_filepath: 'closed-alerts.json'
      }
      const alerts: SecretScanningAlert[] = [{}, {}] as SecretScanningAlert[]
      ;(fetchSecretScanningAlerts as jest.Mock).mockResolvedValueOnce(alerts)
      const result = await getSecretScanningAlertsForScope(input)
      expect(result).toEqual(alerts)
      expect(fetchSecretScanningAlerts).toHaveBeenCalledWith(input)
    })

    it('should return the alerts for an organization', async () => {
      const input: inputsReturned = {
        frequency: 1,
        scope: 'organisation',
        api_token: 'ghp_1234567890',
        apiURL: 'https://api.github.com',
        repo: 'repo',
        owner: 'owner',
        enterprise: 'octocat',
        new_alerts_filepath: 'new-alerts.json',
        closed_alerts_filepath: 'closed-alerts.json'
      }
      const alerts: SecretScanningAlert[] = [{}, {}] as SecretScanningAlert[]
      ;(fetchSecretScanningAlerts as jest.Mock).mockResolvedValueOnce(alerts)
      const result = await getSecretScanningAlertsForScope(input)
      expect(result).toEqual(alerts)
      expect(fetchSecretScanningAlerts).toHaveBeenCalledWith(input)
    })

    it('should return the alerts for an enterprise', async () => {
      const input: inputsReturned = {
        frequency: 1,
        scope: 'enterprise',
        api_token: 'ghp_1234567890',
        apiURL: 'https://api.github.com',
        repo: 'repo',
        owner: 'owner',
        enterprise: 'octocat',
        new_alerts_filepath: 'new-alerts.json',
        closed_alerts_filepath: 'closed-alerts.json'
      }
      const alerts: SecretScanningAlert[] = [{}, {}] as SecretScanningAlert[]
      ;(fetchSecretScanningAlerts as jest.Mock).mockResolvedValueOnce(alerts)
      const result = await getSecretScanningAlertsForScope(input)
      expect(result).toEqual(alerts)
      expect(fetchSecretScanningAlerts).toHaveBeenCalledWith(input)
    })

  })

  describe('filterAlerts', () => {
    it('should filter new alerts created after the minimum date and before the current date', async () => {
      const minimumDate = new Date('2022-01-01T00:00:00Z')
      const alerts: SecretScanningAlert[] = [
        {created_at: '2022-01-01T00:00:00Z', state: 'open'},
        {created_at: '2022-01-02T00:00:00Z', state: 'open'},
        {created_at: '2022-01-03T00:00:00Z', state: 'open'}
      ] as SecretScanningAlert[]
      const expectedNewAlerts = [
        {created_at: '2022-01-02T00:00:00Z', state: 'open'},
        {created_at: '2022-01-03T00:00:00Z', state: 'open'}
      ] as SecretScanningAlert[]
      const result = await filterAlerts(minimumDate, alerts)
      expect(result[0]).toEqual(expectedNewAlerts)
    })

    it('should filter resolved alerts created after the minimum date and before the current date', async () => {
      const minimumDate = new Date('2022-01-01T00:00:00Z')
      const alerts: SecretScanningAlert[] = [
        {resolved_at: '2022-01-01T00:00:00Z', state: 'resolved'},
        {resolved_at: '2022-01-02T00:00:00Z', state: 'resolved'},
        {resolved_at: '2022-01-03T00:00:00Z', state: 'resolved'},
        {resolved_at: '2022-01-04T00:00:00Z', state: 'open'}
      ] as SecretScanningAlert[]
      const expectedResolvedAlerts = [
        {resolved_at: '2022-01-02T00:00:00Z', state: 'resolved'},
        {resolved_at: '2022-01-03T00:00:00Z', state: 'resolved'}
      ] as SecretScanningAlert[]
      const result = await filterAlerts(minimumDate, alerts)
      expect(result[1]).toEqual(expectedResolvedAlerts)
    })

    it('should return an empty array if there are no new or resolved alerts', async () => {
      const minimumDate = new Date('2022-01-01T00:00:00Z')
      const alerts: SecretScanningAlert[] = [{}] as SecretScanningAlert[]
      const result = await filterAlerts(minimumDate, alerts)
      expect(result[0]).toEqual([])
      expect(result[1]).toEqual([])
    })
  })
})
