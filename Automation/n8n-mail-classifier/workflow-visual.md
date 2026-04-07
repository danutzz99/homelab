# n8n Mail Classifier Workflow

It answers one practical question:

`How does a run move from trigger -> Gmail fetch -> classify -> label cleanup -> notification?`

## Workflow Shape

- scheduled trigger
- manual webhook trigger
- label-map preparation
- per-message loop
- classifier output with `labels` and `removeLabels`
- Gmail add/remove operations
- one end-of-run success notification

## Canvas View

For the closest editor-style visualization, open [workflow-canvas.svg](./workflow-canvas.svg).

![Mail Classifier Workflow Canvas](./workflow-canvas.svg)

## Operator Map

```mermaid
flowchart LR
    subgraph T["Entry"]
        ST["Schedule Trigger<br/>Periodic run"]
        MW["Manual Trigger Webhook<br/>POST /webhook/<manual-trigger-path>"]
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
        SD["Send success to Discord"]
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
    participant Gmail as Gmail
    participant Discord as Discord

    Trigger->>Flow: Start run
    Flow->>Gmail: Fetch labels
    Flow->>Gmail: Fetch candidate messages
    Flow->>Flow: Merge messages + labelMap

    loop For each message
        Flow->>Flow: Classify message
        Flow->>Gmail: Add target labels
        alt removeLabels is not empty
            Flow->>Gmail: Remove stale/conflicting labels
        end
    end

    Flow->>Discord: Send one success notification
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

The workflow removes labels to keep the final Gmail state clean.

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
    B --> W["POST https://<n8n-domain>/webhook/<manual-trigger-path>"]
    W --> X["Main workflow runs"]
    X --> D["Discord success notification"]
```

## Review Branch Concept

The optional review workflow should branch from the classifier output, not from Gmail result nodes.

```mermaid
flowchart LR
    C["Classifier output"] --> D{"Needs review?"}
    D -->|yes| R["Format review payload"]
    R --> S["Send review to Discord"]
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
  "messageId": "gmail-message-id",
  "labels": ["Category/Finance"],
  "removeLabels": ["Category/Marketing", "[review-needed]"],
  "from": "Sender <sender@example.com>",
  "subject": "Message subject"
}
```
