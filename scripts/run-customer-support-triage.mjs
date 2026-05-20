#!/usr/bin/env node
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const policyPath = resolve(root, "data/customer-support-agent-policy.json");
const policy = JSON.parse(readFileSync(policyPath, "utf8"));

function loadEnvFile(path) {
  const fullPath = resolve(root, path);
  if (!existsSync(fullPath)) return;
  for (const line of readFileSync(fullPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^[\'\"]|[\'\"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env.vercel");
loadEnvFile(".env.vercel.production");

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run") || process.env.CUSTOMER_SUPPORT_AGENT_DRY_RUN === "1" || process.env.CUSTOMER_SUPPORT_AGENT_DRY_RUN === "true";
const configuredScopes = (process.env.CUSTOMER_SUPPORT_AGENT_SCOPES || policy.gmail.allowedScopes.join(" "))
  .split(/[\s,]+/)
  .map((scope) => scope.trim())
  .filter(Boolean);

function fail(message) {
  console.error("customer-support-triage refused to start: " + message);
  process.exit(1);
}

function validateScopes() {
  const allowed = new Set(policy.gmail.allowedScopes);
  const forbidden = new Set(policy.gmail.forbiddenScopes);
  for (const scope of configuredScopes) {
    if (forbidden.has(scope)) fail("forbidden Gmail scope configured: " + scope);
    if (!allowed.has(scope)) fail("unapproved Gmail scope configured: " + scope);
  }
  if (!configuredScopes.includes("https://www.googleapis.com/auth/gmail.readonly")) {
    fail("gmail.readonly scope is required");
  }
}

validateScopes();

const secretPatterns = [
  { label: "secret", pattern: /\b(?:password|passcode|api[_ -]?key|token|secret|oauth|reset link|magic link)\b\s*[:=]?\s*([^\s<>"']{8,})/gi, replacement: "[REDACTED_SECRET]" },
  { label: "auth_link", pattern: /https?:\/\/[^\s<>"']*(?:token|code|session|auth|reset|magic)[^\s<>"']*/gi, replacement: "[REDACTED_SECRET]" },
  { label: "financial", pattern: /\b(?:\d[ -]*?){13,19}\b/g, replacement: "[REDACTED_FINANCIAL]" },
  { label: "ssn", pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: "[REDACTED_FINANCIAL]" }
];

function redact(value) {
  let text = String(value ?? "");
  const applied = new Set();
  for (const rule of secretPatterns) {
    if (rule.pattern.test(text)) applied.add(rule.label);
    rule.pattern.lastIndex = 0;
    text = text.replace(rule.pattern, rule.replacement);
  }
  return { text, redactionsApplied: [...applied] };
}

function decodeBase64Url(value) {
  if (!value) return "";
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function flattenPayload(payload) {
  if (!payload) return "";
  const chunks = [];
  if (payload.body && payload.body.data) chunks.push(decodeBase64Url(payload.body.data));
  for (const part of payload.parts ?? []) chunks.push(flattenPayload(part));
  return chunks.filter(Boolean).join("\n");
}

function header(headers, name) {
  const found = headers?.find((item) => item.name?.toLowerCase() === name.toLowerCase());
  return found?.value ?? "";
}

function senderDomain(sender) {
  const match = String(sender).match(/@([^>\s]+)/);
  return match ? match[1].toLowerCase() : "unknown";
}

function detectProduct(text) {
  const lower = text.toLowerCase();
  if (lower.includes("agalmanac") || lower.includes("ag almanac")) return "AgAlmanac";
  if (lower.includes("stitchlogic") || lower.includes("stitch logic")) return "StitchLogic";
  if (lower.includes("mowpro") || lower.includes("mow pro")) return "MowPro";
  if (lower.includes("storagehq") || lower.includes("storage hq")) return "StorageHQ";
  if (lower.includes("expiredfda") || lower.includes("expired fda")) return "ExpiredFDA";
  if (lower.includes("rat studios") || lower.includes("ratstudios")) return "RaT Studios";
  return "Unknown";
}

function classify({ sender, subject, body }) {
  const content = (sender + "\n" + subject + "\n" + body).toLowerCase();
  const domain = senderDomain(sender);
  const platformDomains = ["stripe.com", "apple.com", "google.com", "vercel.com", "supabase.com", "github.com", "godaddy.com", "namecheap.com", "cloudflare.com"];

  if (/\b(lawyer|attorney|legal|lawsuit|subpoena|privacy|security|breach|vulnerability|chargeback|data loss)\b/.test(content)) {
    return { category: "legal_or_security", severity: "P1", notify: true, suggestedOwner: "Topher" };
  }
  if (platformDomains.some((item) => domain.endsWith(item)) || /\b(app store|google play|stripe|vercel|supabase|github|domain|dns)\b/.test(content)) {
    return { category: "platform_alert", severity: "P1", notify: true, suggestedOwner: "Topher" };
  }
  if (/\b(refund|billing|invoice|charged|subscription|cancel|payment|paid|pro access|plan)\b/.test(content)) {
    return { category: "billing_or_refund", severity: "P1", notify: true, suggestedOwner: "Topher" };
  }
  if (/\b(can't login|cannot login|locked out|not working|broken|crash|blocked|urgent|can't access|cannot access)\b/.test(content)) {
    return { category: "urgent_customer_issue", severity: "P1", notify: true, suggestedOwner: "Topher" };
  }
  if (/\b(bug|error|crash|fails|failure|glitch|doesn't work|not saving)\b/.test(content)) {
    return { category: "bug_report", severity: "P2", notify: true, suggestedOwner: "Topher" };
  }
  if (/\b(partnership|demo|pricing|interested|sales|quote|pilot|enterprise|press|media)\b/.test(content)) {
    return { category: "sales_lead", severity: "P2", notify: true, suggestedOwner: "Richard" };
  }
  if (/\b(unsubscribe|newsletter|webinar|promotion|limited time|sale)\b/.test(content)) {
    return { category: "newsletter_or_marketing", severity: "Digest", notify: false, suggestedOwner: "None" };
  }
  return { category: "unknown_needs_review", severity: "P3", notify: false, suggestedOwner: "Bub" };
}

function buildSuggestedReply({ category, product }) {
  if (category === "billing_or_refund") {
    return "Thanks for flagging this. We are checking the billing and account state now and will follow up once we verify what happened.";
  }
  if (category === "urgent_customer_issue") {
    return "Thanks for the heads up. We are looking into the " + (product === "Unknown" ? "account" : product) + " issue now. If you can share the device/browser and what you were trying to do right before it failed, that will help us narrow it down.";
  }
  if (category === "bug_report") {
    return "Thanks for reporting this. We are going to try to reproduce it. If you can send the steps you took, device/browser, and any screenshot that does not include sensitive info, that will help.";
  }
  if (category === "sales_lead") {
    return "Thanks for reaching out. We would be glad to learn more about what you are trying to solve and see whether there is a fit.";
  }
  if (category === "legal_or_security") {
    return "Thanks for contacting us. We have received this and will review it carefully before responding further.";
  }
  return "Thanks for reaching out. We are reviewing this and will follow up if we need anything else.";
}

function buildBrief(message) {
  const headers = message.payload?.headers ?? [];
  const sender = header(headers, "From");
  const subject = header(headers, "Subject");
  const receivedAt = header(headers, "Date");
  const rawBody = flattenPayload(message.payload);
  const redactedBody = redact(rawBody);
  const redactedSubject = redact(subject);
  const product = detectProduct(subject + "\n" + rawBody);
  const classification = classify({ sender, subject, body: rawBody });
  const summarySource = redactedBody.text.replace(/\s+/g, " ").trim().slice(0, 700);
  const evidence = redactedSubject.text ? "Subject: " + redactedSubject.text : "No subject";
  const redactionsApplied = [...new Set([...redactedBody.redactionsApplied, ...redactedSubject.redactionsApplied])];

  return {
    messageId: message.id,
    threadId: message.threadId,
    receivedAt,
    sender,
    product,
    category: classification.category,
    severity: classification.severity,
    summary: summarySource || "No readable body found.",
    evidence,
    suggestedOwner: classification.suggestedOwner,
    suggestedInternalAction: classification.notify ? "Review now and decide whether to reply, fix, or open an issue." : "Include in daily digest unless a human wants to review.",
    suggestedReplyDraft: buildSuggestedReply({ category: classification.category, product }),
    notify: classification.notify,
    redactionsApplied
  };
}

async function gmailFetch(path, token) {
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/" + path, {
    headers: { Authorization: "Bearer " + token }
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error("Gmail API " + response.status + ": " + body.slice(0, 500));
  }
  return response.json();
}

async function fetchMessages(token) {
  const maxResults = Number(process.env.CUSTOMER_SUPPORT_MAX_MESSAGES || policy.gmail.maxMessagesPerRun || 25);
  const list = await gmailFetch("messages?maxResults=" + maxResults + "&q=" + encodeURIComponent(policy.gmail.query), token);
  const messages = [];
  for (const item of list.messages ?? []) {
    messages.push(await gmailFetch("messages/" + item.id + "?format=full", token));
  }
  return messages;
}

function ensureParent(path) {
  mkdirSync(dirname(path), { recursive: true });
}

const runId = "support-" + Date.now();

function writeOutputs(briefs) {
  const triagePath = resolve(root, policy.audit.triageOutputPath);
  ensureParent(triagePath);
  writeFileSync(triagePath, JSON.stringify({ generatedAt: new Date().toISOString(), agentName: policy.agentName, briefs }, null, 2) + "\n");

  const auditPath = resolve(root, policy.audit.localOutputPath);
  ensureParent(auditPath);
  for (const brief of briefs) {
    appendFileSync(auditPath, JSON.stringify({
      runId,
      timestamp: new Date().toISOString(),
      messageId: brief.messageId,
      threadId: brief.threadId,
      senderDomain: senderDomain(brief.sender),
      category: brief.category,
      severity: brief.severity,
      notified: brief.notify,
      redactionsApplied: brief.redactionsApplied
    }) + "\n");
  }
}

async function main() {
  const token = process.env.GMAIL_READONLY_ACCESS_TOKEN;
  if (!token) {
    console.log(JSON.stringify({
      agentName: policy.agentName,
      mode: "permission-check-only",
      dryRun,
      status: "ready_for_review",
      message: "No GMAIL_READONLY_ACCESS_TOKEN configured, so no Gmail messages were read.",
      allowedScopes: policy.gmail.allowedScopes,
      forbiddenScopes: policy.gmail.forbiddenScopes,
      canDo: policy.canDo,
      cannotDo: policy.cannotDo
    }, null, 2));
    return;
  }

  const messages = await fetchMessages(token);
  const briefs = messages.map(buildBrief);
  writeOutputs(briefs);

  console.log(JSON.stringify({
    agentName: policy.agentName,
    mode: dryRun ? "dry-run" : "read-only-triage",
    runId,
    messagesRead: messages.length,
    briefsWritten: briefs.length,
    notifyNow: briefs.filter((brief) => brief.notify).length,
    output: policy.audit.triageOutputPath,
    audit: policy.audit.localOutputPath
  }, null, 2));
}

main().catch((error) => fail(error.message));
