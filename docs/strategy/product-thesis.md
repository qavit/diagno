# Diagno Product Thesis

This document explains what `diagno` is, what problem it is designed to solve, and what architectural choices follow from that product position.

It is intended to serve as the public strategy document behind the repository.

## Thesis

`diagno` is not a quiz system.

It is a diagnostic tutoring system designed to identify where a student fails in the problem-solving process and decide how the system should respond.

The central claim is:

> In learning, the highest-leverage behavior is not question delivery. It is diagnosis, targeted feedback, and the selection of the next instructional move.

## Problem

Many students do not fail because they lack access to content.

They fail because they cannot reliably do one or more of the following:

- interpret what the problem is asking
- identify the relevant conditions
- choose the correct physical relationship
- keep track of vectors, signs, or reference frames
- complete the algebra without breaking the physics

Traditional materials are weak at responding to that failure mode.

- a textbook is static
- an answer key reveals outcomes but not diagnosis
- a question bank scales practice but not judgment

A strong teacher does something different:

- observes where the student breaks down
- distinguishes conceptual mistakes from modeling or algebra mistakes
- gives a hint at the right level
- selects a better next question

`diagno` is an attempt to encode that teacher behavior explicitly.

## Target Outcome

The target outcome is not simply higher question throughput.

The target outcome is a tighter learning loop:

1. the student attempts a problem
2. the system infers likely error types
3. the system provides targeted hints
4. the system updates a lightweight student model
5. the system routes the student to the right next problem

This is the core product loop.

## Product Position

`diagno` sits between a static question bank and a free-form AI tutor.

### It is more useful than a quiz app because

- it models why an answer is wrong
- it supports multiple simultaneous errors
- it includes remediation logic
- it treats hints as part of the tutoring policy

### It is more controlled than a generic LLM tutor because

- it uses explicit domain models
- its diagnosis behavior is inspectable
- its routing is testable
- its current logic can be reviewed against teacher expectations

## Core Product Principles

### 1. Questions Are Interfaces, Not the Product

Questions matter, but they are not the main asset.

The product asset is the instructional logic around them:

- concept mapping
- error taxonomy
- hint design
- remediation decisions

### 2. Small Curated Data Beats Large Noisy Data in Early Stages

For this product, a small set of carefully designed items is more valuable than a large weakly structured bank.

The MVP should optimize for:

- pedagogical clarity
- reliable diagnosis
- explicit error modeling
- understandable evaluation

### 3. Rule-Based Systems Are an Asset, Not a Limitation

At this stage, rule-based logic is a feature.

It makes the system:

- debuggable
- auditable
- easy to align with teacher intuition
- suitable for incremental expansion

The goal is not to avoid future model-based components. The goal is to avoid skipping explicit instructional design.

### 4. Learning Diagnosis Is Distinct From Content Extraction

This is why `diagno` is intentionally separate from `bibliophilist`.

- `bibliophilist` handles textbook understanding and content preparation
- `diagno` handles student diagnosis and instructional response

That separation is both a product decision and an architecture decision.

## Initial Domain Choice

The MVP focuses on Taiwan high school physics, specifically:

- center of mass
- angular momentum
- binary-system problems

This topic was chosen because it has strong diagnostic value.

Students can fail in meaningfully different ways:

- ignoring the center-of-mass frame
- reversing the mass-distance relation
- misapplying `v = omega r`
- summing only one body's angular momentum
- treating vector quantities as scalars
- making algebra errors after otherwise correct setup

That makes it a good domain for a diagnosis-first system.

## Instructional Model

The instructional model behind `diagno` is:

### A. Student errors are structured

Wrong answers are not random.

They often reflect recurring, classifiable failures.

### B. Diagnosis can be multi-label

A single wrong answer may indicate:

- a reading failure
- a concept failure
- a modeling failure
- a vector reasoning failure
- an algebra failure

The system should therefore allow multiple detected error types.

### C. Hints should be progressive

Hints should not collapse immediately into full solutions.

They should move through levels such as:

1. conceptual reminder
2. structural hint
3. near-solution scaffold

### D. The next question is part of the teaching act

The system should not assume that "more questions" is enough.

It should ask:

- what should the student practice next?
- should the next item be more basic, similar, or integrative?

## What the MVP Must Prove

The MVP does not need to prove scale.

It needs to prove these narrower claims:

1. the system can represent a useful error taxonomy
2. the system can map student answers to plausible diagnoses
3. the hint system can reflect the diagnosis
4. the next-question routing can reflect instructional intent
5. the structure is clean enough for future expansion

If those claims hold, the product direction is credible.

## What the MVP Intentionally Does Not Prove

The MVP is not trying to prove:

- broad curriculum coverage
- OCR ingestion quality
- RAG quality over external textbooks
- open-ended tutoring dialogue
- full student personalization at scale
- end-to-end automated content generation

Those may matter later, but they are not the first problem.

## Evaluation Criteria

The right evaluation questions for `diagno` are:

- does the diagnosis match what a teacher would infer?
- does the system distinguish different failure modes clearly?
- do the hints help without over-revealing?
- does the recommended next item feel pedagogically reasonable?
- does the student model update in a meaningful direction?

This is a system design and instructional quality problem before it becomes a data scale problem.

## Product Boundary

To protect the product identity, `diagno` should remain centered on:

- diagnosis
- feedback
- remediation
- student-state representation

It should not drift into being primarily:

- a generic content chat app
- an OCR pipeline
- a textbook QA frontend
- a bulk question generator

Those adjacent capabilities may become inputs or extensions, but they should not replace the tutoring core.

## Long-Term Direction

The long-term vision is a layered educational system:

1. content understanding and preparation
2. reviewed instructional asset creation
3. diagnosis and tutoring policy
4. student-facing learning interaction
5. teacher-facing analytics and authoring

In that architecture, `diagno` owns layer 3 and part of layer 4.

## Why This Matters

In EdTech, many systems scale access to content.

Fewer systems scale the teacher's judgment about:

- what kind of mistake happened
- how much help to give
- what to do next

That is the part `diagno` is trying to make explicit.

If successful, the value of the product is not that it contains many questions.

It is that, when a student does not know how to proceed, the system can take over in a way that feels instructionally coherent.
