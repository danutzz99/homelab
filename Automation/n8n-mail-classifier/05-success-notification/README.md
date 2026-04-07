# Success Notification

This section covers the final notification that runs when the batch is complete.

## What It Does

When the message loop finishes, the workflow formats one success payload and sends it to Discord.

The success message includes:

- workflow name
- run status
- completion timestamp

## Why It Matters

This is the simplest confirmation that the workflow ran end to end without failing mid-batch.

## Core Logic

- `Format Success Notification`
- `Send Success To Discord`

## Open Next

- [Main workflow JSON](../mail-classifier-workflow.json)
- [Error notifier](../07-error-notifier/)
