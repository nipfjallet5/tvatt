#!/bin/bash

starttime=`date '+%Y-%m-%dT%H:%M:%S' -d '-2 days'`
endtime=`date '+%Y-%m-%dT%H:%M:%S' -d '-1 hour'`
echo "${starttime}"
echo "${endtime}"
gh api repos/nipfjallet5/tvatt/actions/runs --paginate | \
jq --arg v1 "${starttime}Z" --arg v2 "${enddtime}Z" '.workflow_runs[] | select(.run_started_at > $v1) | select(.run_started_at < $v2) | select(.display_title == "followup check")' | \
jq '.id'

