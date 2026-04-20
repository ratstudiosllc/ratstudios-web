import json
from pathlib import Path

ideas_path = Path('data/ideas-store.json')
ideas_data = json.loads(ideas_path.read_text())
ideas = ideas_data['ideas']

recommendation_map = {
    'pursue_now': 'Pursue',
    'pursue_with_niche_focus': 'Pursue',
    'Strong pursue': 'Pursue',
    'Pursue': 'Pursue',
    'revisit_later': 'Hold',
    'Pursue carefully': 'Hold',
    'do_not_pursue': 'Pass',
}
confidence_map = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'High': 'High',
    'Medium-high': 'High',
    'Medium': 'Medium',
}
for idea in ideas:
    idea['recommendation'] = recommendation_map.get(idea.get('recommendation'), idea.get('recommendation'))
    idea['confidence'] = confidence_map.get(idea.get('confidence'), idea.get('confidence'))

ideas_path.write_text(json.dumps(ideas_data, indent=2) + '\n')

page = Path('app/admin/ideas/page.tsx')
text = page.read_text()
text = text.replace('''        <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">\n          <div className="h-2 gradient-bg" />\n          <div className="p-8 md:p-10">\n            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--color-orange)" }}>Admin Portal</p>\n            <h1 className="mt-3 text-4xl font-bold" style={{ color: "var(--color-dark)" }}>{view === "archived" ? "Archived Ideas" : "Opportunity Research Queue"}</h1>\n            <p className="mt-4 max-w-3xl text-lg" style={{ color: "var(--color-slate)" }}>{view === "archived" ? "Past ideas kept for memory, reference, and pattern spotting." : "New concepts under active scoring, pressure testing, and founder review."}</p>\n            <div className="mt-8 flex flex-col sm:flex-row gap-4">\n              {view === "active" ? <Link href="/admin/ideas/new" className="btn-gradient px-6 py-3 text-sm">New Idea</Link> : null}\n              {view === "archived" ? <Link href="/admin/ideas" className="btn-gradient px-6 py-3 text-sm">Active Ideas</Link> : null}\n              <Link href="/admin" className="btn-gradient px-6 py-3 text-sm">Studio Dashboard</Link>\n              <Link href="/admin/future-apps" className="btn-gradient px-6 py-3 text-sm">Future Apps</Link>\n            </div>\n          </div>\n        </div>''', '''        <div className="rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">\n          <h1 className="text-3xl font-semibold text-orange-500">RaT Studios Admin</h1>\n          <div className="mt-5 flex flex-wrap gap-3">\n            <Link href="/admin/current-apps" className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Current Apps</Link>\n            <Link href="/admin/ideas" className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Ideas</Link>\n            <Link href="/admin/future-apps" className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Future Apps</Link>\n            <Link href="/admin/issues" className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Issues</Link>\n            <Link href="/admin/org-chart" className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Org Chart</Link>\n          </div>\n        </div>''')
text = text.replace('const recommendationOptions = Array.from(new Set(allIdeas.map((idea) => idea.recommendation))).sort((a, b) => a.localeCompare(b));', 'const recommendationOptions = ["Pursue", "Hold", "Pass"];')
text = text.replace('const confidenceOptions = Array.from(new Set(allIdeas.map((idea) => idea.confidence))).sort((a, b) => a.localeCompare(b));', 'const confidenceOptions = ["High", "Medium", "Low"];')
text = text.replace('statusLabel(recommendation)', 'recommendation')
text = text.replace('                    <span>• {idea.recommendation.replaceAll("_", " ")}</span>', '                    <span>• {idea.recommendation}</span>')
text = text.replace('                    <span>• {idea.confidence} confidence</span>', '                    <span>• {idea.confidence} confidence</span>')
page.write_text(text)

agent_list = Path('/tmp/rat_agents.txt')
agent_list.write_text('\n'.join([
    'Bub',
    'Bugs & Issues Manager',
    'Execution Agent',
    'QA / Verification Agent',
    'Mark',
    'Ideas Research Agent',
    'Frontend Developer Agent',
    'Backend Architect Agent',
    'release-agent',
    'growth-agent',
    'ops-agent',
    'qa-agent',
    'marketing-worker',
    'execution-worker',
]))
print('ideas cleaned and agent list prepared')
