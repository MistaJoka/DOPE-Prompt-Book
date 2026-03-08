import { PromptItem } from "@/types/prompt";

export const mockPrompts: PromptItem[] = [
  {
    id: "prompt-001",
    title: "Product Launch Brief Generator",
    summary: "Turn rough launch notes into a tight one-page launch brief with risks and owners.",
    body: "You are a senior product marketer. Use the context below to create a launch brief. Include positioning, core message, key channels, owner map, launch timeline, and top 5 launch risks with mitigation plans.\n\nContext:\n- Product: {{product_name}}\n- Audience: {{audience}}\n- Launch date: {{launch_date}}\n- Notes: {{raw_notes}}\n\nOutput in markdown with short sections and concise bullets.",
    tags: ["product", "launch", "marketing"],
    collection: "Go-To-Market",
    variables: ["product_name", "audience", "launch_date", "raw_notes"],
    outputType: "markdown",
    preferredModel: "gpt-4.1",
    favorite: true,
    status: "active",
    createdAt: "2025-11-04T10:20:00.000Z",
    updatedAt: "2026-02-26T13:32:00.000Z",
    lastUsedAt: "2026-03-04T08:09:00.000Z",
    useCount: 54,
    versions: [
      {
        id: "v1",
        body: "Early version focused only on message pillars and channels.",
        updatedAt: "2025-12-01T12:00:00.000Z",
        note: "Added owner map and launch risks"
      },
      {
        id: "v2",
        body: "Added timeline and section constraints for better scanability.",
        updatedAt: "2026-02-26T13:32:00.000Z",
        note: "Current"
      }
    ]
  },
  {
    id: "prompt-002",
    title: "PR Review Diff Assistant",
    summary: "Analyze a git diff and surface regressions, edge cases, and missing tests.",
    body: "You are a strict code reviewer. Review this diff for correctness and maintainability. Prioritize bugs and behavioral regressions. Provide findings in severity order, include exact file and line references, and mention missing tests.\n\nDiff:\n{{git_diff}}",
    tags: ["engineering", "review", "quality"],
    collection: "Engineering",
    variables: ["git_diff"],
    outputType: "bullet-list",
    preferredModel: "o4-mini",
    favorite: true,
    status: "active",
    createdAt: "2025-09-14T09:18:00.000Z",
    updatedAt: "2026-03-01T16:14:00.000Z",
    lastUsedAt: "2026-03-05T14:11:00.000Z",
    useCount: 112,
    versions: [
      {
        id: "v1",
        body: "Initial reviewer structure.",
        updatedAt: "2025-09-14T09:18:00.000Z",
        note: "Initial"
      },
      {
        id: "v2",
        body: "Added explicit line references and test coverage requirement.",
        updatedAt: "2026-03-01T16:14:00.000Z",
        note: "Current"
      }
    ]
  },
  {
    id: "prompt-003",
    title: "Weekly Team Update Condenser",
    summary: "Convert long async updates into a compact weekly memo with blockers and asks.",
    body: "Condense these team updates into 5 sections: Wins, Risks, Blockers, Decisions Needed, Next Week Plan. Keep each section to 3-5 bullets. Preserve specific names and dates.\n\nUpdates:\n{{updates_blob}}",
    tags: ["operations", "leadership", "summary"],
    collection: "Management",
    variables: ["updates_blob"],
    outputType: "markdown",
    preferredModel: "gpt-4o",
    favorite: false,
    status: "active",
    createdAt: "2025-08-10T07:05:00.000Z",
    updatedAt: "2026-02-12T18:41:00.000Z",
    lastUsedAt: "2026-02-28T15:55:00.000Z",
    useCount: 38,
    versions: [
      {
        id: "v1",
        body: "Original single paragraph output version.",
        updatedAt: "2025-08-10T07:05:00.000Z",
        note: "Initial"
      },
      {
        id: "v2",
        body: "Switched to structured sections and strict bullet caps.",
        updatedAt: "2026-02-12T18:41:00.000Z",
        note: "Current"
      }
    ]
  },
  {
    id: "prompt-004",
    title: "Customer Interview Insight Extractor",
    summary: "Parse transcript text and extract signal, jobs-to-be-done, and quote-ready snippets.",
    body: "Read the transcript and return JSON with: themes, pains, desired outcomes, notable quotes, product opportunities, confidence score. Use evidence-based extraction only.\n\nTranscript:\n{{transcript_text}}",
    tags: ["research", "customer", "insights"],
    collection: "Discovery",
    variables: ["transcript_text"],
    outputType: "json",
    preferredModel: "claude-sonnet",
    favorite: false,
    status: "active",
    createdAt: "2025-12-06T11:11:00.000Z",
    updatedAt: "2026-02-09T09:02:00.000Z",
    lastUsedAt: "2026-02-22T10:20:00.000Z",
    useCount: 27,
    versions: [
      {
        id: "v1",
        body: "Early extraction prompt.",
        updatedAt: "2025-12-06T11:11:00.000Z",
        note: "Initial"
      }
    ]
  },
  {
    id: "prompt-005",
    title: "Incident Retro Draft",
    summary: "Generate concise post-incident retro with timeline and corrective actions.",
    body: "Draft an engineering incident retro from these notes. Include incident summary, user impact, timeline, root cause, what worked, what failed, action items with owners and due dates.\n\nIncident notes:\n{{incident_notes}}",
    tags: ["sre", "incident", "postmortem"],
    collection: "Reliability",
    variables: ["incident_notes"],
    outputType: "markdown",
    preferredModel: "gpt-4.1",
    favorite: true,
    status: "active",
    createdAt: "2025-10-18T08:01:00.000Z",
    updatedAt: "2026-01-30T20:18:00.000Z",
    lastUsedAt: "2026-02-19T18:10:00.000Z",
    useCount: 63,
    versions: [
      {
        id: "v1",
        body: "Initial template.",
        updatedAt: "2025-10-18T08:01:00.000Z",
        note: "Initial"
      },
      {
        id: "v2",
        body: "Added ownership and deadlines in action items.",
        updatedAt: "2026-01-30T20:18:00.000Z",
        note: "Current"
      }
    ]
  },
  {
    id: "prompt-006",
    title: "Executive Email Rewriter",
    summary: "Rewrite rough notes into concise executive email drafts with clear asks.",
    body: "Rewrite these notes into an executive-friendly email. Keep it under 180 words. Include context, decision required, and recommended next step.\n\nNotes:\n{{draft_notes}}",
    tags: ["communication", "leadership", "email"],
    collection: "Management",
    variables: ["draft_notes"],
    outputType: "email",
    preferredModel: "gpt-4o",
    favorite: false,
    status: "draft",
    createdAt: "2026-02-15T12:00:00.000Z",
    updatedAt: "2026-03-03T14:28:00.000Z",
    lastUsedAt: "2026-03-03T14:27:00.000Z",
    useCount: 9,
    versions: [
      {
        id: "v1",
        body: "Draft with less strict word limit.",
        updatedAt: "2026-02-15T12:00:00.000Z",
        note: "Initial"
      }
    ]
  },
  {
    id: "prompt-007",
    title: "SEO Article Outline Builder",
    summary: "Generate intent-first article outlines with headings and FAQ schema suggestions.",
    body: "Build a content outline from keyword and audience intent. Include H1/H2/H3, search intent mapping, FAQs, and internal link suggestions.\n\nKeyword: {{keyword}}\nAudience: {{audience_profile}}",
    tags: ["content", "seo", "growth"],
    collection: "Content Ops",
    variables: ["keyword", "audience_profile"],
    outputType: "table",
    preferredModel: "gemini-pro",
    favorite: false,
    status: "active",
    createdAt: "2025-11-22T06:44:00.000Z",
    updatedAt: "2026-02-20T11:30:00.000Z",
    lastUsedAt: "2026-02-25T10:40:00.000Z",
    useCount: 45,
    versions: [
      {
        id: "v1",
        body: "Original outline generator.",
        updatedAt: "2025-11-22T06:44:00.000Z",
        note: "Initial"
      },
      {
        id: "v2",
        body: "Added FAQ and internal links sections.",
        updatedAt: "2026-02-20T11:30:00.000Z",
        note: "Current"
      }
    ]
  },
  {
    id: "prompt-008",
    title: "Interview Debrief Matrix",
    summary: "Create calibrated candidate debriefs with competency scoring and risk flags.",
    body: "From interview notes, produce a debrief matrix with competency scores (1-5), evidence, concerns, and hiring recommendation. Mention confidence for each score.\n\nCandidate: {{candidate_name}}\nRole: {{role_name}}\nNotes: {{interview_notes}}",
    tags: ["hiring", "people", "evaluation"],
    collection: "Talent",
    variables: ["candidate_name", "role_name", "interview_notes"],
    outputType: "table",
    preferredModel: "gpt-4.1",
    favorite: false,
    status: "active",
    createdAt: "2025-07-12T16:20:00.000Z",
    updatedAt: "2026-01-16T18:24:00.000Z",
    lastUsedAt: "2026-02-11T09:54:00.000Z",
    useCount: 22,
    versions: [
      {
        id: "v1",
        body: "Structured matrix baseline.",
        updatedAt: "2025-07-12T16:20:00.000Z",
        note: "Initial"
      }
    ]
  },
  {
    id: "prompt-009",
    title: "Sprint Planning Risk Scanner",
    summary: "Scan backlog items and highlight sprint risk by dependency and uncertainty.",
    body: "Assess sprint backlog and return risk table with dependency risk, effort uncertainty, and rollout concern. Suggest mitigations and sequencing improvements.\n\nBacklog:\n{{sprint_backlog}}",
    tags: ["planning", "delivery", "risk"],
    collection: "Engineering",
    variables: ["sprint_backlog"],
    outputType: "json",
    preferredModel: "o4-mini",
    favorite: true,
    status: "active",
    createdAt: "2025-10-03T13:13:00.000Z",
    updatedAt: "2026-02-24T12:01:00.000Z",
    lastUsedAt: "2026-03-05T08:01:00.000Z",
    useCount: 71,
    versions: [
      {
        id: "v1",
        body: "First pass risk scan.",
        updatedAt: "2025-10-03T13:13:00.000Z",
        note: "Initial"
      },
      {
        id: "v2",
        body: "Added rollout concern and sequencing guidance.",
        updatedAt: "2026-02-24T12:01:00.000Z",
        note: "Current"
      }
    ]
  },
  {
    id: "prompt-010",
    title: "Legacy Data Migration Checklist",
    summary: "Generate migration steps and rollback plan from source-target mapping notes.",
    body: "Create a migration checklist from source-target mapping. Include pre-flight checks, migration steps, validation tests, rollback procedure, and monitoring plan.\n\nInputs:\n{{mapping_notes}}",
    tags: ["data", "migration", "ops"],
    collection: "Reliability",
    variables: ["mapping_notes"],
    outputType: "markdown",
    preferredModel: "gpt-4o",
    favorite: false,
    status: "archived",
    createdAt: "2025-05-16T15:45:00.000Z",
    updatedAt: "2025-12-10T10:07:00.000Z",
    lastUsedAt: "2025-12-11T10:30:00.000Z",
    useCount: 12,
    versions: [
      {
        id: "v1",
        body: "Legacy migration template.",
        updatedAt: "2025-05-16T15:45:00.000Z",
        note: "Initial"
      }
    ]
  }
];
