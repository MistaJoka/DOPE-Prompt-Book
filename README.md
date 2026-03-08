# DOPE-Prompt-Book 🧱

Modular prompt building — snap together reusable parts to build powerful LLM prompts.

## What Is This?

A library of prompt modules you can mix and match. Each module does one thing well.

Stop rewriting prompts from scratch. Instead, pick a role, pick a task, add formatting or constraints, and assemble a complete prompt in seconds.

## How It Works

1. Pick a **ROLE** module → defines who the AI is
2. Pick a **TASK** module → defines what to do
3. Add **FORMAT**, **TONE**, **CONSTRAINTS** as needed
4. Assemble using the combiner template
5. Test and iterate

## Quick Start

See: [combiners/basic-template.md](combiners/basic-template.md)

## Browse All Modules

See: [index.md](index.md)

## Add Your Own

See: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## Module Types

| Type | Purpose | Example |
|------|---------|---------|
| `role` | Who the AI is | Expert Analyst, Friendly Teacher |
| `task` | What to do | Summarize, Brainstorm, Critique |
| `format` | How to structure output | Bullet Headers, Step-by-Step |
| `tone` | Voice and style | Direct No-Fluff |
| `constraint` | Limits and guardrails | Word Limit |
| `context` | Audience or situation info | Beginner User |

## Starter Modules

| Module | Type | Best For |
|--------|------|---------|
| [expert-analyst](modules/role/expert-analyst.md) | role | Research, analysis, critical review |
| [friendly-teacher](modules/role/friendly-teacher.md) | role | Education, onboarding, explainers |
| [summarize](modules/task/summarize.md) | task | TLDRs, digests, key points |
| [brainstorm](modules/task/brainstorm.md) | task | Ideation, creative exploration |
| [critique](modules/task/critique.md) | task | Feedback, evaluation, improvement |
| [bullet-headers](modules/format/bullet-headers.md) | format | Scannable, structured output |
| [step-by-step](modules/format/step-by-step.md) | format | Tutorials, how-to guides |
| [direct-no-fluff](modules/tone/direct-no-fluff.md) | tone | Professional, efficient communication |
| [word-limit](modules/constraints/word-limit.md) | constraint | Capping response length |
| [beginner-user](modules/context/beginner-user.md) | context | Non-technical or new audiences |

## Example Assembled Prompt

**Modules:** `role/friendly-teacher` + `context/beginner-user` + `task/summarize` + `format/bullet-headers`

```
You are a patient, encouraging teacher. You explain concepts clearly
using simple language, analogies, and real-world examples.

The person reading this has no prior knowledge of the subject.
Define any technical terms. Avoid assumed knowledge.

Summarize the provided content. Capture the core idea,
key supporting points, and any actionable takeaways.

Structure your response using bold headers and bullet points.
Each section should have a clear label. Keep bullets concise.
```

## Repo Structure

```
modules/
  role/         ← Who the AI is
  task/         ← What to do
  format/       ← How to structure output
  tone/         ← Voice and style
  constraints/  ← Limits and guardrails
  context/      ← Audience or situation info
combiners/
  basic-template.md   ← How to assemble modules
  examples/           ← Ready-to-use assembled prompts
index.md              ← Full module catalog
CONTRIBUTING.md       ← Module spec and contribution guide
```
