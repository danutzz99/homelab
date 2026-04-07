# Label Map And Inputs

This section explains the setup work that happens before classification starts.

## What It Does

The workflow begins by fetching all Gmail labels and building a lookup object shaped like:

```json
{
  "Label Name": "label-id"
}
```

That lookup is merged with the fetched messages so the classifier can resolve human-readable label names into Gmail label IDs during the run.

## Why It Matters

The classifier does not work directly with hard-coded label IDs. It works with label names and resolves them through `labelMap`, which makes the logic easier to maintain and easier to adapt to another mailbox.

## Core Logic

- `Get many labels`
- `Build labelMap`
- `Get candidate messages`
- `Merge`

## Open Next

- [Main workflow JSON](../mail-classifier-workflow.json)
- [Classifier logic](../03-classifier/)
- [Label cleanup](../04-label-cleanup/)
