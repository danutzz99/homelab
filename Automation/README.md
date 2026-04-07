# Automation

This section covers the automation flows, scripts, and workflow logic used across the homelab.

## Quick Access

[![Workflow Overview](https://img.shields.io/badge/Open-Workflow_Overview-1d4ed8?style=for-the-badge)](./n8n-mail-classifier/01-overview/)
[![Classifier Logic](https://img.shields.io/badge/Open-Classifier_Logic-0f766e?style=for-the-badge)](./n8n-mail-classifier/03-classifier/)
[![Canvas View](https://img.shields.io/badge/Open-Canvas_View-0891b2?style=for-the-badge)](./n8n-mail-classifier/workflow-canvas.svg)
[![Workflow JSON](https://img.shields.io/badge/Open-Workflow_JSON-2563eb?style=for-the-badge)](./n8n-mail-classifier/mail-classifier-workflow.json)
[![Logic JS](https://img.shields.io/badge/Open-Logic_JS-4338ca?style=for-the-badge)](./n8n-mail-classifier/mail-classifier-logic.js)
[![Label Cleanup](https://img.shields.io/badge/Open-Label_Cleanup-7c3aed?style=for-the-badge)](./n8n-mail-classifier/04-label-cleanup/)
[![Review Flow](https://img.shields.io/badge/Open-Review_Flow-b45309?style=for-the-badge)](./n8n-mail-classifier/06-review-notifier/)
[![Error Alerts](https://img.shields.io/badge/Open-Error_Alerts-be123c?style=for-the-badge)](./n8n-mail-classifier/07-error-notifier/)

## Start Here

- For the fastest high-level understanding, open [Workflow overview](./n8n-mail-classifier/01-overview/).
- For the closest editor-style view, open [workflow-canvas.svg](./n8n-mail-classifier/workflow-canvas.svg).
- For the actual workflow layout, open [mail-classifier-workflow.json](./n8n-mail-classifier/mail-classifier-workflow.json).
- For the decision engine, open [mail-classifier-logic.js](./n8n-mail-classifier/mail-classifier-logic.js) or the [Classifier logic](./n8n-mail-classifier/03-classifier/) explanation page.

## Main Areas

| Area | What it covers | Open |
|------|----------------|------|
| `n8n-mail-classifier/` | Mail ingestion, classification, label cleanup, and Discord notifications | [Open folder](./n8n-mail-classifier/) |
| GitLab CI pipeline | Weekly maintenance updates for core services | See below |

## n8n Mail Classifier

The n8n mail-classifier workflow is documented as a small navigation hub with focused pages for each major logic block:

| Logic Area | Brief Explanation | Open |
|------------|-------------------|------|
| Workflow overview | The end-to-end run from triggers to Gmail actions and final notifications | [Open](./n8n-mail-classifier/01-overview/) |
| Canvas view | A static editor-style diagram laid out to resemble the n8n canvas | [Open](./n8n-mail-classifier/workflow-canvas.svg) |
| Label map and inputs | How Gmail labels are turned into a lookup map and merged with fetched messages | [Open](./n8n-mail-classifier/02-label-map/) |
| Classifier logic | How the JavaScript classifier normalizes content, applies explicit rules, and falls back to scoring | [Open](./n8n-mail-classifier/03-classifier/) |
| Label cleanup | Why `removeLabels` exists and how stale labels are removed after classification | [Open](./n8n-mail-classifier/04-label-cleanup/) |
| Success notifications | How the workflow sends one final success message after the batch finishes | [Open](./n8n-mail-classifier/05-success-notification/) |
| Review notifier | Optional logic for surfacing edge cases to Discord | [Open](./n8n-mail-classifier/06-review-notifier/) |
| Error notifier | Workflow-level error alerts with lightweight severity handling | [Open](./n8n-mail-classifier/07-error-notifier/) |

## GitLab CI Pipeline

Weekly update pipeline for the Proxmox host and Plex VM.

- Schedule: Monday 11:00 AM
- Actions: `apt update && apt upgrade -y && apt autoremove -y`
- Runner: installed on the Proxmox host

## Related Script Documentation

- [Scripts overview](../Scripts/)
- [Raspberry Pi automation](../Scripts/raspberry-pi-README.md)
- [Proxmox host scripts](../Scripts/proxmox/README.md)
