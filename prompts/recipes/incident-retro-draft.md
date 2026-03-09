---
id: "prompt-005"
title: "Incident Retro Draft"
summary: "Generate concise post-incident retro with timeline and corrective actions."
tags:
  - "sre"
  - "incident"
  - "postmortem"
collection: "Reliability"
variables:
  - "incident_notes"
outputType: "markdown"
preferredModel: "gpt-4.1"
status: "active"
category: "recipe"
favorite: true
createdAt: "2025-10-18T08:01:00.000Z"
updatedAt: "2026-01-30T20:18:00.000Z"
---

Draft an engineering incident retro from these notes. Include incident summary, user impact, timeline, root cause, what worked, what failed, action items with owners and due dates.

Incident notes:
{{incident_notes}}
