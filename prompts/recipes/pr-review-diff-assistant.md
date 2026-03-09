---
id: "prompt-002"
title: "PR Review Diff Assistant"
summary: "Analyze a git diff and surface regressions, edge cases, and missing tests."
tags:
  - "engineering"
  - "review"
  - "quality"
collection: "Engineering"
variables:
  - "git_diff"
outputType: "bullet-list"
preferredModel: "o4-mini"
status: "active"
category: "recipe"
favorite: true
createdAt: "2025-09-14T09:18:00.000Z"
updatedAt: "2026-03-01T16:14:00.000Z"
---

Review this diff for correctness and maintainability. Prioritize bugs and behavioral regressions. Provide findings in severity order, include exact file and line references, and mention missing tests.

Diff:
{{git_diff}}
