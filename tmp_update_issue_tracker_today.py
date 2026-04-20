import json
from pathlib import Path

p = Path('data/issues-tracker.json')
data = json.loads(p.read_text())
issues = data['issues']

for issue in issues:
    if issue['number'] == 19:
        issue['status'] = 'Resolved'
        issue['committed'] = 'Yes'
        issue['pushed'] = 'Yes'
        issue['deployed'] = 'Yes'
        issue['commits'] = 'eca1275'
        issue['currentState'] = 'Crop Coach send failures are visible in production and the missing production persistence tables were created directly in Supabase. End-to-end behavior was verified working today.'
        issue['nextStep'] = 'Monitor for regressions, but the production fix is complete.'
    if issue['number'] == 20:
        issue['status'] = 'Resolved'
        issue['committed'] = 'Yes'
        issue['pushed'] = 'Yes'
        issue['deployed'] = 'Yes'
        issue['commits'] = '4294c79, 516e876'
        issue['currentState'] = 'Rat Ops admin login is now working in production via the existing admin gate credentials, and the broken auth loop is cleared.'
        issue['nextStep'] = 'Replace the temporary gate with a cleaner long-term auth path later, but access is restored now.'
    if issue['number'] == 21:
        issue['status'] = 'Resolved'
        issue['committed'] = 'Yes'
        issue['pushed'] = 'Yes'
        issue['deployed'] = 'Yes'
        issue['commits'] = '9873f45, 1466121, aa0c981'
        issue['currentState'] = 'Dashboard issue visibility, KPI tiles, and org chart rendering are working in production after schema fixes and admin UI cleanup.'
        issue['nextStep'] = 'Keep the tracker current so the dashboard remains trustworthy.'

numbers = {issue['number'] for issue in issues}
if 22 not in numbers:
    issues.append({
        'id': 'issue-22',
        'number': 22,
        'project': 'RaT Studios',
        'priority': 'P2',
        'title': 'Admin issues page failed in production because admin_issues schema drifted',
        'status': 'Resolved',
        'identified': '2026-04-20',
        'committed': 'Yes',
        'pushed': 'Yes',
        'deployed': 'Yes',
        'commits': 'schema patch + aa0c981',
        'summary': 'The production admin issues page broke because the admin_issues table was missing owner_agent and resolved_at columns expected by the live code.',
        'currentState': 'Production schema was patched directly in Supabase and the issues page now loads successfully.',
        'nextStep': 'Backfill proper schema discipline so code and production do not drift again.'
    })

if 23 not in numbers:
    issues.append({
        'id': 'issue-23',
        'number': 23,
        'project': 'RaT Studios',
        'priority': 'P2',
        'title': 'Org chart omitted built agents because page rendering was hard-coded to two reporting buckets',
        'status': 'Resolved',
        'identified': '2026-04-20',
        'committed': 'Yes'
        , 'pushed': 'Yes',
        'deployed': 'Yes',
        'commits': '91742ae, fe3ab23',
        'summary': 'The org chart data included more agents than the page rendered, so several built agents never appeared in the UI.',
        'currentState': 'The org chart now renders all reporting groups, including marketing and QA sub-teams.',
        'nextStep': 'Keep data model and page rendering aligned when the roster grows.'
    })

data['lastUpdated'] = '2026-04-20 09:38 MDT'
data['issues'] = sorted(issues, key=lambda x: x['number'])
p.write_text(json.dumps(data, indent=2) + '\n')
print('issue tracker updated for today')
