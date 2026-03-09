---
id: "prompt-008"
title: "Interview Debrief Matrix"
summary: "Create calibrated candidate debriefs with competency scoring and risk flags."
tags:
  - "hiring"
  - "people"
  - "evaluation"
collection: "Talent"
variables:
  - "candidate_name"
  - "role_name"
  - "interview_notes"
outputType: "table"
preferredModel: "gpt-4.1"
status: "active"
category: "recipe"
favorite: false
createdAt: "2025-07-12T16:20:00.000Z"
updatedAt: "2026-01-16T18:24:00.000Z"
---

From interview notes, produce a debrief matrix with competency scores (1-5), evidence, concerns, and hiring recommendation. Mention confidence for each score.

Candidate: {{candidate_name}}
Role: {{role_name}}
Notes: {{interview_notes}}
