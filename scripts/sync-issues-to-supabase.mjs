import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const trackerPath = path.join(root, "data", "issues-tracker.json");
const raw = await fs.readFile(trackerPath, "utf8");
const tracker = JSON.parse(raw);

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const rows = (tracker.issues ?? []).map((issue) => ({
  id: issue.id,
  number: issue.number,
  project: issue.project,
  priority: issue.priority,
  title: issue.title,
  status: issue.status,
  identified: issue.identified ?? null,
  committed: issue.committed,
  pushed: issue.pushed,
  deployed: issue.deployed,
  commits: issue.commits,
  summary: issue.summary ?? null,
  current_state: issue.currentState ?? null,
  next_step: issue.nextStep ?? null,
}));

const { error } = await supabase.from('admin_issues').upsert(rows, { onConflict: 'id' });
if (error) throw error;

console.log(`Synced ${rows.length} issues to Supabase admin_issues`);
