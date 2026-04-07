# Classifier Logic

This is the main decision engine of the workflow.

## What It Does

The classifier:

1. normalizes sender, subject, snippet, and body text
2. extracts sender email and sender domain
3. applies high-confidence rules first
4. falls back to weighted scoring when needed
5. chooses the final label set
6. computes `removeLabels` so stale labels can be removed

## Core Ideas

- Header-first matching is stronger than long-body matching.
- Explicit rules should win before fallback scoring.
- Sender parsing is more reliable than raw text matching alone.
- Label cleanup is part of classification, not an afterthought.

## Key Outputs

The classifier returns:

```json
{
  "messageId": "gmail-message-id",
  "labels": ["target-label-id"],
  "removeLabels": ["old-label-id"],
  "from": "Sender <sender@example.com>",
  "subject": "Message subject"
}
```

## Main File

- [mail-classifier-logic.js](../mail-classifier-logic.js)

## Open Next

- [Label cleanup](../04-label-cleanup/)
- [Review notifier](../06-review-notifier/)
- [Workflow notes](../workflow-notes.md)
