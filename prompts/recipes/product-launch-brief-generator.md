---
id: "prompt-001"
title: "Product Launch Brief Generator"
summary: "Turn rough launch notes into a tight one-page launch brief with risks and owners."
tags:
  - "product"
  - "launch"
  - "marketing"
collection: "Go-To-Market"
variables:
  - "product_name"
  - "audience"
  - "launch_date"
  - "raw_notes"
outputType: "markdown"
preferredModel: "gpt-4.1"
status: "active"
category: "recipe"
favorite: true
createdAt: "2025-11-04T10:20:00.000Z"
updatedAt: "2026-02-26T13:32:00.000Z"
---

You are a senior product marketer. Use the context below to create a launch brief. Include positioning, core message, key channels, owner map, launch timeline, and top 5 launch risks with mitigation plans.

Context:
- Product: {{product_name}}
- Audience: {{audience}}
- Launch date: {{launch_date}}
- Notes: {{raw_notes}}

Output in markdown with short sections and concise bullets.
