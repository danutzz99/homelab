# n8n Workflow Notes

## Scope

These notes summarize the mail-classifier workflow pattern used for inbox labeling, stale-label cleanup, and Discord notifications.

## Recommended Workflow Shape

1. scheduled trigger
2. optional manual webhook trigger
3. Gmail label fetch
4. Gmail message fetch
5. merge with `labelMap`
6. per-item classifier
7. Gmail add-label node
8. Gmail remove-label node
9. optional Discord review workflow
10. separate workflow error notifier

## Important Behavior To Keep

### 1. Explicit rules before fallback scoring

The classifier is safest when it applies high-confidence direct rules first and only then falls back to weighted scoring.

### 2. Sender parsing matters

Parsing sender address and sender domain is more reliable than long-body matching alone.

### 3. Header weighting matters

`from`, `subject`, and `snippet` should usually be weighted more heavily than full-body content.

### 4. `removeLabels` is as important as `labels`

If the workflow only adds labels, stale primary labels can remain on a message and create contradictory states.

## Recommended Review Triggers

Send an item to a review workflow when one of these is true:

- the classifier returns `[review-needed]`
- `removeLabels.length > 0`
- more than one primary category is present
- a debug flag explicitly requests review

## Configuration

Use environment variables or deployment-specific values for service integrations.

Examples:

- `DISCORD_WEBHOOK`
- `DISCORD_WEBHOOK_URL`
- `DISCORD_ERROR_WEBHOOK`
- `DISCORD_REVIEW_WEBHOOK`
- `MAIL_WORKFLOW_URL`

## Suggested Next Upgrade

If you want better observability, add a small `debug` object to classifier output:

- `debug.primaryRule`
- `debug.fallbackUsed`
- `debug.reason`
- `debug.category`

That helps explain decisions in review messages without changing the label model itself.
