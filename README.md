# Secret Scanning Alerts GitHub Action

This GitHub Action retrieves secret scanning alerts from GitHub and filters them based on a specified date range. It then saves the filtered alerts to files and outputs a summary of the new and resolved alerts.

You can use the ouput to create a GitHub issue or send a notification to Email, Slack, Teams, etc.


## How does it work?

The code is realitvely simple. The flow is defined in `src/main.ts` and is as follows:

1. Parse inputs using the `getInput()` function.
2. Calculate the minimum date for the alert scan using the `calculateDateRange()` function.
3. Retrieve secret scanning alerts for the specified scope by calling the GitHub Secret Scanning REST API.
4. Filter the alerts based on the minimum date using the `filterAlerts()` function.
5. Write the new alerts and resolved alerts to json files.
6. Print the results as GitHub Actions summary.
7. Set the `summary-markdown` output to make it available to other steps in the workflow.

## Usage

To use this action, add the following step to your workflow:

```yaml
- name: Secret Scanning Alerts
  uses: advanced-security/secret-scanning-custom-notifications/@v1
  with:
    frequency: 24 # hours
    scope: 'repository'
    repository: 'repo-name'
    new_alerts_filepath: 'new_alerts.json'
    closed_alerts_filepath: 'closed_alerts.json'
```

## Inputs
This action requires the following inputs:

- `frequency`: The frequency of the action. Valid values are daily, weekly, and monthly. Required.
- `scope`: The scope of the action. Valid values are repo, org, and enterprise. Required.
- `token`: The GitHub API token to use for the action. Required.
- `new_alerts_filepath`: The path to the file where the new alerts should be stored for email attachment. Required.
- `closed_alerts_filepath`: The path to the file where the closed alerts should be stored for email attachment. Required.
- `api_url`: The GitHub API URL to use for the action. Needed only if you are using GitHub Enterprise Server. Optional.
- `repo`: The repo to run the action on. Needed only if scope is repo and you intend to fetch alerts from other repos than the one where the action is running. Optional.
- `org`: The org to run the action on. Needed only if scope is org and you intend to fetch alerts from other repos than the one where the action is running. Optional.
- `enterprise`: The enterprise to run the action on. Required if you run it on the enterprise level. Optional.


## Outputs
This action has the following outputs:

- `summary-markdown`: A markdown formatted summary of the new and resolved alerts.


## Example Workflow

Run the action every 4 hours and upload the new and resolved alerts to an artifact if there are any new or resolved alerts.

```yaml
name: Secret Scanning Alerts

on:
  schedule:
    - cron: '0 */6 * * 0' # Run every 4 hours
jobs:
  secret-scanning-alerts:
    runs-on: ubuntu-latest

    steps:
    - name: Secret Scanning Alerts
      uses: advanced-security/secret-scanning-custom-notifications/@v1
      with:
        frequency: 3000
        scope: 'repository'
        new_alerts_filepath: 'created_alerts.json'
        closed_alerts_filepath: 'closed_alerts.json'
        token: ${{ secrets.TOKEN }}

    - name: Count the number of entries in the alert files
      id: count_alerts
      run: |
        created_alerts_count=$(jq '. | length' created_alerts.json)
        closed_alerts_count=$(jq '. | length' closed_alerts.json)
        echo "created_alerts_count=$created_alerts_count" >> $GITHUB_OUTPUT
        echo "closed_alerts_count=$closed_alerts_count" >> $GITHUB_OUTPUT
    
    - name: Upload artifact
      if: steps.count_alerts.outputs.created_alerts_count > 0 || steps.count_alerts.outputs.closed_alerts_count > 0
      uses: actions/upload-artifact@v3
      with:
        name: my-artifact
        path: |
          created_alerts.json
          closed_alerts.json
```


    
## License
This project is distributed under the [MIT license](LICENSE.md).

## Contributing
- Fork this repo 
- Work on your new feature
- Create new Pull Request