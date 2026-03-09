---
id: "prompt-009"
title: "Sprint Planning Risk Scanner"
summary: "Scan backlog items and highlight sprint risk by dependency and uncertainty."
tags:
  - "planning"
  - "delivery"
  - "risk"
collection: "Engineering"
variables:
  - "sprint_backlog"
outputType: "json"
preferredModel: "o4-mini"
status: "active"
category: "recipe"
favorite: true
createdAt: "2025-10-03T13:13:00.000Z"
updatedAt: "2026-02-24T12:01:00.000Z"
---

Assess sprint backlog and return risk table with dependency risk, effort uncertainty, and rollout concern. Suggest mitigations and sequencing improvements.

Backlog:
{{sprint_backlog}}
