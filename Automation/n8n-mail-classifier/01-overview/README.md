# Workflow Overview

This page is the fastest way to understand the mail-classifier workflow as a whole.

## What It Does

The workflow:

1. starts from either a schedule or a manual webhook
2. fetches Gmail labels and candidate messages
3. builds a `labelMap`
4. loops through each message
5. classifies the message
6. adds the new labels
7. removes stale or conflicting labels
8. sends one end-of-run success notification

## Why It Matters

This is the top-level view of the system. If someone needs to understand how the workflow behaves before reading code, this is the best first stop.

## Open Next

- [Visual workflow map](../workflow-visual.md)
- [Workflow notes](../workflow-notes.md)
- [Main workflow JSON](../mail-classifier-workflow.json)
- [Classifier logic](../03-classifier/)
