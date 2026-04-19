export interface OrgChartMember {
  slug: string;
  name: string;
  title: string;
  team: string;
  reportsTo?: string;
  type: "human" | "agent";
  summary: string;
  duties: string[];
  tasks: string[];
}

export const orgChartMembers: OrgChartMember[] = [
  {
    slug: "richard-ashcraft",
    name: "Richard Ashcraft",
    title: "Co-Founder and Operating Principal",
    team: "Leadership",
    type: "human",
    summary: "Owns business direction, operating priorities, customer reality, and final verification on shipped work.",
    duties: [
      "Set business priorities and studio direction",
      "Approve what matters for customers and operations",
      "Verify finished work before final closure",
    ],
    tasks: [
      "Review Needs Verification queue",
      "Prioritize issues and opportunities",
      "Give final go/no-go on important product decisions",
    ],
  },
  {
    slug: "topher",
    name: "Topher",
    title: "Co-Founder and Technical Principal",
    team: "Leadership",
    type: "human",
    summary: "Owns technical architecture, shipping standards, repo health, and the studio systems that make execution possible.",
    duties: [
      "Set engineering standards and technical direction",
      "Approve infrastructure and system design decisions",
      "Support verification and deployment confidence",
    ],
    tasks: [
      "Review technical changes and architecture decisions",
      "Monitor platform health and deployment integrity",
      "Help unblock complex engineering issues",
    ],
  },
  {
    slug: "bub",
    name: "Bub",
    title: "Chief of Staff and Agent Orchestrator",
    team: "Operations",
    reportsTo: "Richard Ashcraft + Topher",
    type: "agent",
    summary: "Coordinates work across the studio, manages issue flow, routes tasks to the right agents, and keeps execution moving.",
    duties: [
      "Own the operating queue across apps and internal work",
      "Route issues, ideas, and marketing work to the right agents",
      "Move completed work into verification instead of letting it stall",
    ],
    tasks: [
      "Triage new issues",
      "Launch and supervise agents",
      "Update dashboards, queues, and trackers",
    ],
  },
  {
    slug: "bugs-issues-manager",
    name: "Bugs & Issues Manager",
    title: "Issue Intake and Workflow Manager",
    team: "Operations",
    reportsTo: "Bub",
    type: "agent",
    summary: "Owns issue intake, prioritization, assignment logic, and workflow hygiene so nothing falls through the cracks.",
    duties: [
      "Review new issues and keep metadata clean",
      "Set priorities, owners, and next steps",
      "Maintain queue discipline from intake through verification",
    ],
    tasks: [
      "Claim unowned issues",
      "Assign workflow state",
      "Escalate blocked work",
    ],
  },
  {
    slug: "execution-agent",
    name: "Execution Agent",
    title: "Engineering Fix and Delivery Specialist",
    team: "Engineering",
    reportsTo: "Bub",
    type: "agent",
    summary: "Does the actual implementation work in product repos, fixes issues, commits code, and prepares work for verification.",
    duties: [
      "Inspect canonical repos and implement fixes",
      "Make safe commits and push changes when appropriate",
      "Leave work in a verifiable state instead of vague maybe-done status",
    ],
    tasks: [
      "Fix bugs",
      "Refactor targeted workflows",
      "Prepare clean handoff notes for verification",
    ],
  },
  {
    slug: "qa-verification-agent",
    name: "QA / Verification Agent",
    title: "Verification and Release Confidence Lead",
    team: "Quality",
    reportsTo: "Bub",
    type: "agent",
    summary: "Turns code-complete work into structured verification tasks and checks whether fixes actually behave in the target environment.",
    duties: [
      "Define verification steps and regression watch items",
      "Check that fixes are testable and not just theoretically complete",
      "Support final move from Needs Verification to Resolved",
    ],
    tasks: [
      "Build verification checklists",
      "Track pass/fail outcomes",
      "Flag regressions and incomplete fixes",
    ],
  },
  {
    slug: "mark-growth-agent",
    name: "Mark",
    title: "Growth and Marketing Operator",
    team: "Marketing",
    reportsTo: "Bub",
    type: "agent",
    summary: "Owns marketing execution, research, growth experiments, and content-oriented workflow across active studio products.",
    duties: [
      "Research channels, positioning, and growth opportunities",
      "Draft campaigns, content, and outreach",
      "Support product growth with practical experiments, not fluff",
    ],
    tasks: [
      "Build lead and outreach lists",
      "Draft content and campaign assets",
      "Track growth experiments and results",
    ],
  },
  {
    slug: "ideas-research-agent",
    name: "Ideas Research Agent",
    title: "Opportunity Research Analyst",
    team: "Product",
    reportsTo: "Bub",
    type: "agent",
    summary: "Researches new product and feature opportunities, scores them, and turns raw concepts into structured bets.",
    duties: [
      "Research candidate opportunities",
      "Write concise operator-grade memos",
      "Populate the ideas system with decision-ready entries",
    ],
    tasks: [
      "Generate and score ideas",
      "Surface risks and wedges",
      "Move strong ideas toward validation",
    ],
  },
  {
    slug: "frontend-developer-agent",
    name: "Frontend Developer Agent",
    title: "UI and Frontend Systems Engineer",
    team: "Engineering",
    reportsTo: "Execution Agent",
    type: "agent",
    summary: "Focuses on admin interfaces, product UX, frontend bugs, and making the apps feel usable instead of clunky.",
    duties: [
      "Implement admin and app UI changes",
      "Improve usability and workflow clarity",
      "Keep frontend changes build-safe and testable",
    ],
    tasks: [
      "Build screens and controls",
      "Refine layouts and interactions",
      "Fix frontend regressions",
    ],
  },
  {
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

export function getOrgChartRoots() {
  return orgChartMembers.filter((member) => !member.reportsTo);
}

export function getOrgChartChildren(name: string) {
  return orgChartMembers.filter((member) => member.reportsTo?.includes(name));
}

export function getOrgChartMember(slug: string) {
  return orgChartMembers.find((member) => member.slug === slug) ?? null;
}
