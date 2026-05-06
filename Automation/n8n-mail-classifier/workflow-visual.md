# n8n Mail Classifier Workflow

It answers one practical question:

`How does a run move from trigger -> mail fetch -> classify -> label cleanup -> notification?`

## Workflow Shape

- scheduled trigger
- manual trigger
- label-map preparation
- per-message loop
- classifier output with `labels` and `removeLabels`
- mail add/remove operations
- one end-of-run success notification

## Canvas View

For the closest editor-style visualization, open [workflow-canvas.svg](./workflow-canvas.svg).

![Mail Classifier Workflow Canvas](./workflow-canvas.svg)

## Operator Map

```mermaid
flowchart LR
    subgraph T["Entry"]
        ST["Schedule Trigger<br/>Periodic run"]
        MW["Manual Trigger"]
    end

    subgraph P["Prepare Inputs"]
        GL["Get many labels"]
        FL["Build labelMap"]
        GM["Get candidate messages"]
        MG["Merge"]
    end

    subgraph L["Per-Email Loop"]
        LO["Loop Over Items"]
        CJ["Classifier Logic<br/>labels + removeLabels"]
        AL["Add labels"]
        PR["Prepare removeLabels"]
        RL["Remove stale labels"]
    end

    subgraph N["Run Completion"]
        FS["Format success notification"]
        SD["Send success notification"]
    end

    ST --> GL
    ST --> GM
    MW --> GL
    MW --> GM

    GL --> FL --> MG
    GM --> MG
    MG --> LO

    LO --> CJ
    CJ --> AL
    CJ --> PR
    PR --> RL
    AL --> LO

    LO -->|no more items| FS --> SD
```

## Story Of One Run

```mermaid
sequenceDiagram
    participant Trigger as Trigger
    participant Flow as Main Workflow
    participant mail provider as mail provider
    participant Alerts as Notification Path

    Trigger->>Flow: Start run
    Flow->>mail provider: Fetch labels
    Flow->>mail provider: Fetch candidate messages
    Flow->>Flow: Merge messages + labelMap

    loop For each message
        Flow->>Flow: Classify message
        Flow->>mail provider: Add target labels
        alt removeLabels is not empty
            Flow->>mail provider: Remove stale/conflicting labels
        end
    end

    Flow->>Alerts: Send one success notification
```

## Story Of One Email

```mermaid
flowchart TD
    IN["Message enters loop"] --> CODE["Classifier evaluates sender + subject + snippet + body"]
    CODE --> OUT["Output contract<br/>messageId, labels, removeLabels, from, subject"]

    OUT --> ADD{"labels[] present?"}
    ADD -->|yes| ADDNODE["Add labels to message"]
    ADD -->|no| NEXT["Return to loop"]

    OUT --> REM{"removeLabels[] present?"}
    REM -->|yes| PREP["Prepare remove list"]
    PREP --> RMNODE["Remove labels from message"]
    REM -->|no| NEXT

    ADDNODE --> NEXT
    RMNODE --> NEXT
```

## Why `removeLabels` Exists

The workflow removes labels to keep the final mail state clean.

Example:

```text
Classifier chooses:
- Category/Finance

Add:
- Category/Finance

Remove if present:
- Category/Marketing
- [review-needed]
- other mutually exclusive primary labels
```

This prevents old and new classifications from living on the same message.

## Manual Trigger View

```mermaid
flowchart LR
    U["Operator or bot command"] --> B["HTTP request"]
    B --> W["Trigger configured workflow endpoint"]
    W --> X["Main workflow runs"]
    X --> D["Success notification"]
```

## Review Branch Concept

The optional review workflow should branch from the classifier output, not from mail result steps.

```mermaid
flowchart LR
    C["Classifier output"] --> D{"Needs review?"}
    D -->|yes| R["Format review payload"]
    R --> S["Send review notification"]
    D -->|no| N["Continue without review"]
```

Typical review signals:

- `[review-needed]`
- `removeLabels.length > 0`
- two competing primary categories
- explicit debug override

## Output Contract

```json
{
  "messageId": "mail-message-id",
  "labels": ["Category/Finance"],
  "removeLabels": ["Category/Marketing", "[review-needed]"],
  "from": "<sender>",
  "subject": "Message subject"
}
```
