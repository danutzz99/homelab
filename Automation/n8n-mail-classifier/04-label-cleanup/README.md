# Label Cleanup

This section explains the `removeLabels` side of the workflow.

## What It Does

After the classifier chooses the current target labels, the workflow checks whether there are old labels that should no longer remain on the message.

If `removeLabels` contains values:

1. the workflow keeps the new label state
2. filters out empty values
3. removes stale or conflicting labels from Gmail

## Why It Matters

Without this step, Gmail messages can keep old primary-category labels and end up looking like they belong to more than one category at the same time.

Typical examples:

- a message moving from `Category/Marketing` to `Category/Finance`
- a message leaving `[review-needed]` after a confident classification
- a message shedding an outdated primary label from an earlier rule set

## Core Logic

- `Prepare Remove Labels`
- `Remove labels from message`

## Open Next

- [Classifier logic](../03-classifier/)
- [Main workflow JSON](../mail-classifier-workflow.json)
