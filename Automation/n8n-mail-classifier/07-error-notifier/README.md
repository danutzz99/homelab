# Error Notifier

This section covers workflow-level error alerts.

## What It Does

The error notifier starts from an n8n error trigger, formats a compact alert, and sends it through the configured notification path.

The alert includes:

- workflow name
- execution ID
- failed node
- severity
- main error message

## Why It Matters

This keeps operational failures separate from ordinary review cases. It is the right place for timeouts, network issues, quota failures, and unexpected workflow errors.

## Main File

- [error-notifier-workflow.json](../error-notifier-workflow.json)

## Open Next

- [Review notifier](../06-review-notifier/)
- [Success notification](../05-success-notification/)
