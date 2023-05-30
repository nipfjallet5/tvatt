#!/bin/bash
# today=`date '+%Y-%m-%d'` -d '-1 day'
today=`date '+%Y-%m-%d'`
echo "${today}"

gh api repos/nipfjallet5/tvatt/actions/runs --paginate | \
jq --arg v1 "${today}T00:00:00Z" --arg v2 "${today}T23:59:59Z" '.workflow_runs[] | select(.run_started_at > $v1) | select(.run_started_at < $v2)' | \
jq '.id'

