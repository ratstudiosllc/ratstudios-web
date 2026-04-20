from pathlib import Path
p = Path('lib/org-chart.ts')
text = p.read_text()
needle = '''  {
    slug: "backend-architect-agent",
    name: "Backend Architect Agent",
    title: "Systems and Data Architecture Lead",
    team: "Engineering",
    reportsTo: "Execution Agent",
    type: "agent",
    summary: "Owns backend patterns, API logic, database-safe changes, and boring-but-correct system plumbing.",
    duties: [
      "Design stable backend flows",
      "Guard critical paths like auth, issues, and persistence",
      "Keep architecture understandable and debuggable",
    ],
    tasks: [
      "Design API/data changes",
      "Implement safe backend logic",
      "Prevent clever nonsense in critical plumbing",
    ],
  },
];
'''
replacement = '''  {
    slug: "backend-architect-agent",
    name: "Backend Architect Agent",
    title: "Systems and Data Architecture Lead",
    team: "Engineering",
    reportsTo: "Execution Agent",
    type: "agent",
    summary: "Owns backend patterns, API logic, database-safe changes, and boring-but-correct system plumbing.",
    duties: [
      "Design stable backend flows",
      "Guard critical paths like auth, issues, and persistence",
      "Keep architecture understandable and debuggable",
    ],
    tasks: [
      "Design API/data changes",
      "Implement safe backend logic",
      "Prevent clever nonsense in critical plumbing",
    ],
  },
  {
    slug: "marketing-worker",
    name: "Marketing Worker",
    title: "Campaign and Content Execution Worker",
    team: "Marketing",
    reportsTo: "Mark",
    type: "agent",
    summary: "Handles hands-on marketing tasks spawned from the growth lane, including content, SEO, and outreach execution.",
    duties: [
      "Execute specific growth and content tasks",
      "Work marketing issues to completion",
      "Report concrete outputs back to the growth lane",
    ],
    tasks: [
      "Draft campaigns and assets",
      "Run SEO and content tasks",
      "Close marketing issue loops",
    ],
  },
  {
    slug: "execution-worker",
    name: "Execution Worker",
    title: "Implementation Task Worker",
    team: "Engineering",
    reportsTo: "Execution Agent",
    type: "agent",
    summary: "Handles spawned implementation work for tracked issues and focused engineering tasks under the execution lane.",
    duties: [
      "Take scoped issue work from execution",
      "Make targeted code changes",
      "Return work in a verifiable state",
    ],
    tasks: [
      "Implement fixes",
      "Commit focused changes",
      "Summarize results for verification",
    ],
  },
  {
    slug: "release-agent",
    name: "Release Agent",
    title: "Release Prep and Shipping Coordinator",
    team: "Quality",
    reportsTo: "QA / Verification Agent",
    type: "agent",
    summary: "Prepares release notes, packaging, and final shipping coordination for product updates.",
    duties: [
      "Prepare release materials",
      "Support shipping readiness",
      "Keep release communication clear",
    ],
    tasks: [
      "Draft changelogs",
      "Prepare build notes",
      "Coordinate final release handoff",
    ],
  },
  {
    slug: "growth-agent",
    name: "Growth Agent",
    title: "Growth Analysis Specialist",
    team: "Marketing",
    reportsTo: "Mark",
    type: "agent",
    summary: "Focuses on funnel analysis, growth opportunities, and recommendation work across studio products.",
    duties: [
      "Analyze growth bottlenecks",
      "Recommend practical experiments",
      "Support product growth decisions with data",
    ],
    tasks: [
      "Review onboarding and funnel drop-off",
      "Propose growth tests",
      "Summarize findings for operators",
    ],
  },
  {
    slug: "ops-agent",
    name: "Ops Agent",
    title: "Operations Summary Specialist",
    team: "Operations",
    reportsTo: "Bub",
    type: "agent",
    summary: "Consolidates execution status, weekly summaries, and operational reporting across the studio.",
    duties: [
      "Compile operational snapshots",
      "Summarize execution state",
      "Support dashboard and reporting hygiene",
    ],
    tasks: [
      "Build weekly summaries",
      "Collect status across agents",
      "Prepare operator briefings",
    ],
  },
  {
    slug: "qa-agent",
    name: "QA Agent",
    title: "Regression and Validation Specialist",
    team: "Quality",
    reportsTo: "QA / Verification Agent",
    type: "agent",
    summary: "Runs focused QA passes and regression checks on scoped product work.",
    duties: [
      "Run targeted QA sweeps",
      "Catch regressions before closure",
      "Document validation outcomes",
    ],
    tasks: [
      "Execute regression passes",
      "Record failures clearly",
      "Support verification decisions",
    ],
  },
];
'''
if needle not in text:
    raise SystemExit('needle not found')
p.write_text(text.replace(needle, replacement))
print('org chart expanded')
