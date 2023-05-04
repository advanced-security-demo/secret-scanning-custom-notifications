export {inputsReturned, scopeInput, SecretScanningAlert, RateLimitOptions}

type inputsReturned = {
  frequency: number
  scope: scopeInput
  api_token: string
  apiURL: string
  repo: string
  owner: string
  enterprise: string
  new_alerts_filepath: string
  closed_alerts_filepath: string
}

type scopeInput = 'organisation' | 'repository' | 'enterprise'

type SecretScanningAlert = {
  number: number
  created_at: string
  updated_at: string
  resolved_at: string | null
  url: string
  html_url: string
  status: string
  secret_type: string
  secret: {
    name: string
    created_at: string
    updated_at: string
    visibility: string
  }
  repository: {
    name: string
    full_name: string
    owner: {
      login: string
    }
  }
}

type RateLimitOptions = {
  request: {
    retryCount: number
  }
}
