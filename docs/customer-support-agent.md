# Rat Studios Customer Support Triage Agent

Status: draft for Topher/Richard review

## Purpose

This agent monitors approved Rat Studios support inboxes and turns incoming email into internal support briefs. It is designed to reduce missed customer issues without letting automation speak for Rat Studios.

The agent is explicitly read-only at launch.

## Source of truth

The behavior and permission manifest live in:

- `data/customer-support-agent-policy.json`
- `scripts/run-customer-support-triage.mjs`
- `app/admin/customer-support/page.tsx`

If the dashboard and this document ever disagree, the JSON policy wins.

## Exact Gmail permission model

Allowed Gmail scope:

- `https://www.googleapis.com/auth/gmail.readonly`

Forbidden Gmail scopes:

- `https://mail.google.com/`
- `https://www.googleapis.com/auth/gmail.modify`
- `https://www.googleapis.com/auth/gmail.compose`
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/gmail.labels`
- `https://www.googleapis.com/auth/gmail.insert`
- `https://www.googleapis.com/auth/gmail.settings.basic`
- `https://www.googleapis.com/auth/gmail.settings.sharing`

The runner refuses to start if any configured scope is outside the allowed list or inside the forbidden list.

## What the agent can do

- Read Gmail message metadata and bodies from approved Rat Studios support mailboxes.
- Classify messages by support category, severity, product, and required owner.
- Summarize customer issues and platform alerts.
- Redact sensitive material before writing notifications or logs.
- Create internal support briefs with suggested next actions.
- Draft suggested replies for Topher or Richard to review and send manually.
- Group repeated bug reports by product and theme.
- Produce a daily digest of low-priority or non-urgent mail.
- Write local audit records of what it read, how it classified the message, and whether it notified.

## What the agent cannot do

- Send email.
- Create Gmail drafts.
- Reply to customers automatically.
- Forward emails.
- Archive, delete, mark spam, star, snooze, or otherwise mutate messages.
- Create, edit, or apply Gmail labels.
- Change Gmail filters, forwarding, signatures, vacation responders, or mailbox settings.
- Promise refunds, credits, discounts, delivery timelines, legal positions, tax advice, or policy exceptions.
- Handle password reset, account takeover, ownership disputes, billing identity changes, or security incidents without human approval.
- Expose customer private data in group chats or public channels.
- Store raw email bodies longer than the configured retention window.

## Notification behavior

Notify immediately when:

- A paying customer is blocked from using a product.
- A customer reports payment, subscription, refund, cancellation, or account access trouble.
- Apple, Google, Stripe, Vercel, Supabase, GitHub, domain registrar, or email provider requires action.
- The message contains legal threat, security report, privacy concern, chargeback, or data loss language.
- Multiple customers report the same bug or outage.
- A credible sales lead, partnership inquiry, or press inquiry arrives.

Digest only when:

- Newsletter, marketing, or vendor promotional email.
- Routine SaaS receipt or non-actionable product update.
- Cold outreach with no clear Rat Studios relevance.
- Low urgency customer praise or general comment with no required action.

## Support brief format

Every escalated message should produce:

- `messageId`
- `receivedAt`
- `sender`
- `product`
- `category`
- `severity`
- `summary`
- `evidence`
- `suggestedOwner`
- `suggestedInternalAction`
- `suggestedReplyDraft`
- `redactionsApplied`

Suggested replies are drafts only. Humans send all outbound customer communication.

## Environment variables

Required for live Gmail polling:

- `CUSTOMER_SUPPORT_AGENT_SCOPES`
- `GMAIL_READONLY_ACCESS_TOKEN`

Optional:

- `CUSTOMER_SUPPORT_AGENT_DRY_RUN`
- `CUSTOMER_SUPPORT_MAX_MESSAGES`

Recommended launch values:

```bash
CUSTOMER_SUPPORT_AGENT_SCOPES=https://www.googleapis.com/auth/gmail.readonly
CUSTOMER_SUPPORT_AGENT_DRY_RUN=1
```

Do not add send, compose, modify, label, mailbox settings, or full mailbox scopes.

## Review checklist

- Confirm the mailbox list is correct.
- Confirm the allowed Gmail scope is read-only.
- Confirm forbidden scopes include send, compose, modify, labels, and settings.
- Confirm the support brief fields are enough for human review.
- Confirm notification destinations before live polling.
- Run dry-run first.

## Launch process

1. Review this file and `data/customer-support-agent-policy.json`.
2. Create or confirm the Rat Studios support mailbox aliases.
3. Create a Google OAuth client or service connection with Gmail read-only scope only.
4. Put the read-only access token in the runtime environment.
5. Run:

```bash
npm run support:triage -- --dry-run
```

6. Review output in `data/customer-support-triage-outbox.json`.
7. Only after review, schedule the runner every 10 to 15 minutes during business hours.

No sending capability is part of launch.
