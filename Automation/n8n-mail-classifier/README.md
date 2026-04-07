# n8n Mail Classifier

This directory documents an n8n workflow set for inbox classification, label cleanup, and Discord-based observability.

## Quick Access

[![Overview](https://img.shields.io/badge/Open-Overview-1d4ed8?style=for-the-badge)](./01-overview/)
[![Inputs](https://img.shields.io/badge/Open-Label_Map_And_Inputs-0f766e?style=for-the-badge)](./02-label-map/)
[![Classifier](https://img.shields.io/badge/Open-Classifier_Logic-7c3aed?style=for-the-badge)](./03-classifier/)
[![Canvas](https://img.shields.io/badge/Open-Canvas_View-0891b2?style=for-the-badge)](./workflow-canvas.svg)
[![Workflow JSON](https://img.shields.io/badge/Open-Workflow_JSON-2563eb?style=for-the-badge)](./mail-classifier-workflow.json)
[![Logic JS](https://img.shields.io/badge/Open-Logic_JS-4338ca?style=for-the-badge)](./mail-classifier-logic.js)
[![Cleanup](https://img.shields.io/badge/Open-Label_Cleanup-b45309?style=for-the-badge)](./04-label-cleanup/)
[![Review](https://img.shields.io/badge/Open-Review_Notifier-9333ea?style=for-the-badge)](./06-review-notifier/)
[![Errors](https://img.shields.io/badge/Open-Error_Notifier-be123c?style=for-the-badge)](./07-error-notifier/)

## Start Here

- Start with [01-overview](./01-overview/) for the full run path.
- Open [workflow-canvas.svg](./workflow-canvas.svg) for the closest editor-style layout.
- Open [mail-classifier-workflow.json](./mail-classifier-workflow.json) to see the node layout.
- Open [03-classifier](./03-classifier/) and [mail-classifier-logic.js](./mail-classifier-logic.js) to understand the decision engine.

The workflow design centers on a few core ideas:

- dual trigger entry points
- Gmail label-map preparation
- per-message classifier execution
- add-label and remove-label cleanup
- optional Discord review flow
- separate workflow-level error reporting

## Included Files

- `mail-classifier-workflow.json`
  Main n8n workflow layout.

- `mail-classifier-logic.js`
  JavaScript classifier logic with explicit rules, fallback scoring, and label cleanup behavior.

- `workflow-visual.md`
  Operator-friendly visual explanation of the workflow shape.

- `workflow-canvas.svg`
  Static editor-style canvas view of the workflow layout.

- `workflow-notes.md`
  Notes on review branches, label cleanup, and notifier split.

- `discord-classifier-review.json`
  Optional child workflow for manual-review messages.

- `discord-error-notifier.json`
  Optional error workflow for Discord alerts.

## Logic Index

| Folder | What it explains | Open |
|--------|------------------|------|
| `01-overview/` | End-to-end workflow flow | [Open](./01-overview/) |
| `02-label-map/` | Gmail labels, fetched messages, and merge setup | [Open](./02-label-map/) |
| `03-classifier/` | The main JavaScript decision engine | [Open](./03-classifier/) |
| `04-label-cleanup/` | `removeLabels` and stale-label removal | [Open](./04-label-cleanup/) |
| `05-success-notification/` | Final success message flow | [Open](./05-success-notification/) |
| `06-review-notifier/` | Optional Discord review path | [Open](./06-review-notifier/) |
| `07-error-notifier/` | Workflow-level error alerts | [Open](./07-error-notifier/) |

## Configuration Notes

The workflow files use configuration placeholders for environment-specific values such as:

- `<manual-trigger-path>`
- `<gmail-credential-id>`
- `<gmail-credential-name>`
- `<n8n-domain>`

These files are intended as implementation documentation and starting-point workflow definitions for a similar setup.
