# Review Notifier

This section covers the optional Discord review flow for edge cases.

## What It Does

The review workflow receives classifier output and decides whether the item deserves manual attention.

Typical review signals:

- `[review-needed]`
- `removeLabels.length > 0`
- more than one primary category
- an explicit debug override

If one of those signals is present, the workflow formats a Discord message with the message subject, sender, labels, and review reason.

## Why It Matters

This keeps low-confidence or messy classifications visible without making the main workflow harder to read.

## Main File

- [discord-classifier-review.json](../discord-classifier-review.json)

## Open Next

- [Classifier logic](../03-classifier/)
- [Error notifier](../07-error-notifier/)
