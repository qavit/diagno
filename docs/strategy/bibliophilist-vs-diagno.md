# Bibliophilist vs Diagno

This document defines the boundary between `bibliophilist` and `diagno`.

The goal is to keep the system architecture clean, the product story legible, and the public GitHub narrative professional.

## One-line Positioning

- `bibliophilist` is a textbook understanding pipeline.
- `diagno` is a diagnostic tutoring engine.

They are related, but they do not solve the same problem.

## Product Roles

### Bibliophilist

`bibliophilist` focuses on turning photographed textbooks into structured, traceable knowledge assets.

Core responsibilities:

- ingest phone-photo textbook pages
- preprocess and OCR pages
- detect and describe figures
- extract structure from pages
- build searchable chunks and knowledge objects
- support annotation and content QA workflows

Primary users:

- developer / researcher
- teacher or annotator preparing content
- future internal content pipeline operators

Core question it answers:

> What is in this textbook, and how can we convert it into high-quality structured content?

### Diagno

`diagno` focuses on identifying where a student fails in the problem-solving process and deciding how to respond.

Core responsibilities:

- represent concepts, error types, and questions
- diagnose likely failure points from student attempts
- provide progressive hints
- route students to remediation questions
- maintain a lightweight student model
- expose teacher-facing error distributions

Primary users:

- student
- teacher

Core question it answers:

> Given a student's answer, what likely went wrong, and what should the system do next?

## Architectural Boundary

The clean split is:

- `bibliophilist` is the `content understanding layer`
- `diagno` is the `instructional decision layer`

This means:

- `bibliophilist` should not become a tutoring engine
- `diagno` should not become an OCR / RAG / textbook ingestion system

## Data Flow Between the Two

In a future integrated system, the expected flow is:

```text
Textbook photos
-> bibliophilist ingest / OCR / structure / figures / knowledge extraction
-> structured content assets
-> manually curated or reviewed teaching items
-> diagno concepts / error types / items / hints / routing rules
-> student attempts
-> diagnosis / remediation / teacher analytics
```

The key constraint is that `diagno` should consume reviewed instructional assets, not raw OCR pages.

## What Belongs in Bibliophilist

These capabilities belong in `bibliophilist`:

- photo ingestion
- OCR backend routing
- page-level structure extraction
- figure detection and figure description
- annotation workbench
- chunking and indexing
- citation-aware textbook QA
- knowledge object extraction

These are infrastructure and content-preparation concerns.

## What Belongs in Diagno

These capabilities belong in `diagno`:

- concept graph for a teaching unit
- error taxonomy
- answer-to-error mapping
- multi-error diagnosis rules
- hint sequencing
- remediation routing
- student mastery tracking
- teacher-facing error analytics

These are learning-process concerns.

## What Must Stay Out of Diagno

To keep `diagno` focused and legible, these should not become core responsibilities:

- textbook OCR pipelines
- generic RAG chat over books
- photo ingestion and cleanup
- page annotation tooling
- figure extraction infrastructure
- free-form LLM tutoring as the primary logic layer

`diagno` may eventually integrate with those capabilities, but it should not own them.

## What Must Stay Out of Bibliophilist

To keep `bibliophilist` coherent, these should not become core responsibilities:

- student mastery models
- pedagogical remediation policies
- fine-grained mistake diagnosis from answer patterns
- adaptive hint progression
- next-question tutoring logic

If these move into `bibliophilist`, the repo will lose its role clarity.

## Why This Split Matters

This separation is not just technical. It strengthens the public narrative.

### For Bibliophilist

The showcase value is:

- computer vision + OCR + content structuring
- multilingual textbook processing
- figure-aware knowledge extraction
- pipeline and annotation system design

### For Diagno

The showcase value is:

- learning science framing
- tutoring-system design
- rule-based diagnosis
- pedagogical error modeling
- student-state and remediation logic

Together, they show breadth. Separated, they remain understandable.

## Public Narrative

When describing the projects in GitHub or interviews:

- Describe `bibliophilist` as a system for converting photographed textbooks into structured knowledge assets.
- Describe `diagno` as a system for diagnosing student mistakes and guiding the next step in learning.
- Describe the relationship as upstream and downstream, not as one monolithic AI app.

Recommended phrasing:

> Bibliophilist prepares structured educational content from photographed textbooks. Diagno uses curated concepts, question structures, and error models to drive diagnostic tutoring decisions.

## Current Recommendation

For the near term:

1. Keep `diagno` self-contained and rule-based.
2. Do not block `diagno` on `bibliophilist` integration.
3. Use `bibliophilist` as a future content pipeline, not a prerequisite for the tutoring engine.
4. Make the public README of each repo explicit about this boundary.

## Integration Strategy

The recommended integration order is:

1. Prove `diagno` as a diagnostic tutor with a small hand-curated dataset.
2. Prove `bibliophilist` as a reliable textbook understanding pipeline.
3. Add a thin export contract from `bibliophilist` to produce reviewed concept and content candidates.
4. Add a content authoring / review step before anything enters `diagno`.

This preserves quality and avoids coupling diagnosis quality to OCR noise.

## Design Principle

The shared long-term system should follow this rule:

> Raw content extraction and instructional decision-making are different layers and should remain different layers.

That separation is what keeps the system extensible, testable, and credible as an EdTech product.
