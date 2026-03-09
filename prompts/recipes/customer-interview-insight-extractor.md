---
id: "prompt-004"
title: "Customer Interview Insight Extractor"
summary: "Parse transcript text and extract signal, jobs-to-be-done, and quote-ready snippets."
tags:
  - "research"
  - "customer"
  - "insights"
collection: "Discovery"
variables:
  - "transcript_text"
outputType: "json"
preferredModel: "claude-sonnet"
status: "active"
category: "recipe"
favorite: false
createdAt: "2025-12-06T11:11:00.000Z"
updatedAt: "2026-02-09T09:02:00.000Z"
---

Read the transcript and return JSON with: themes, pains, desired outcomes, notable quotes, product opportunities, confidence score. Use evidence-based extraction only.

Transcript:
{{transcript_text}}
