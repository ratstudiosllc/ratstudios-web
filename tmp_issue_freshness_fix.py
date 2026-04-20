from pathlib import Path

p = Path('lib/issues-tracker.ts')
text = p.read_text()
text = text.replace('''export interface IssueTrackerResponse {
  trackerPath: string;
  lastUpdated: string | null;
  counts: {
''', '''export interface IssueTrackerResponse {
  trackerPath: string;
  lastUpdated: string | null;
  lastUpdatedRaw: string | null;
  counts: {
''')
text = text.replace('''  return {
    trackerPath: "supabase.admin_issues",
    lastUpdated: formatMountainTimestamp(lastUpdated),
    counts: {
''', '''  return {
    trackerPath: "supabase.admin_issues",
    lastUpdated: formatMountainTimestamp(lastUpdated),
    lastUpdatedRaw: lastUpdated,
    counts: {
''')
p.write_text(text)

p2 = Path('app/admin/page.tsx')
text2 = p2.read_text()
text2 = text2.replace('updatedAt={issues?.lastUpdated ?? null}', 'updatedAt={issues?.lastUpdatedRaw ?? null}')
text2 = text2.replace('Updated {formatMountainNow(issues?.lastUpdated ?? null)}', 'Updated {formatMountainNow(issues?.lastUpdatedRaw ?? null)}')
p2.write_text(text2)

p3 = Path('lib/studio-admin.ts')
text3 = p3.read_text()
text3 = text3.replace('''  const identifiedToday = issues.filter((issue) => sameMountainDay(issue.identified, today)).length;
  const fixedToday = issues.filter((issue) => {
    const verifiedToday = sameMountainDay(issue.updatedAt, today);
    return verifiedToday && issue.status === "Resolved" && issue.committed === "Yes" && issue.pushed === "Yes" && issue.deployed === "Yes";
  }).length;
''', '''  const identifiedToday = issues.filter((issue) => sameMountainDay(issue.identified, today)).length;
  const fixedToday = issues.filter((issue) => {
    return sameMountainDay(issue.updatedAt, today)
      && issue.status == "Resolved"
      && issue.committed == "Yes"
      && issue.pushed == "Yes"
      && issue.deployed == "Yes";
  }).length;
''')
p3.write_text(text3)

print('issue freshness fixed')
