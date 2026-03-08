# 🏗️ DOPE Prompt Book — App Research Guide
**Building a Great Prompt Builder Web App from the Ground Up**
*Last updated: March 7, 2026*

---

## 🗺️ THE BIG PICTURE

You're building a **browser-based Prompt Builder / LLM Tool**.
The core job: let users compose, test, and reuse modular prompts with LLMs.

Here's your recommended tech stack at a glance:

| Layer | Tool |
|---|---|
| **Frontend** | React + Next.js + Tailwind CSS + shadcn/UI |
| **Backend** | Node.js (or Python FastAPI if ML-heavy) |
| **AI Engine** | Anthropic Claude API (claude-sonnet-4-6) |
| **Database + Auth** | Supabase |
| **Deployment** | Vercel |

---

## 1️⃣ FRONTEND FRAMEWORK

### ✅ Recommended: React + Next.js

- **Why React?** Massive ecosystem, huge LLM training data, excellent tooling
- **Why Next.js?** Server-side rendering, API routes, edge functions — all in one
- **Styling:** Tailwind CSS + shadcn/UI for fast, polished UI components
- **Alternative:** SvelteKit — smaller, faster for real-time UIs (good for live prompt testing)

### 🛠️ Tools to Know

- **v0 by Vercel** — Generate React + Tailwind components from text descriptions
- **Motiff** — Design + export production-ready React code from prompts
- **Cursor / Claude Code** — AI-assisted development IDEs

---

## 2️⃣ LLM API INTEGRATION (Anthropic Claude)

### ✅ Current Best Model Tiers (2026)

| Model | Use Case |
|---|---|
| `claude-opus-4-6` | Complex reasoning, hardest tasks |
| `claude-sonnet-4-6` | **Best all-rounder** — use this by default |
| `claude-haiku-4-5` | Fast + cheap — great for high-volume or simple tasks |

### 🔑 Key Best Practices

- **NEVER expose your API key client-side** — store in `.env` variables only
- Use the **official Node.js SDK**: `npm install @anthropic-ai/sdk`
- **Prompt caching** = up to 70–80% cost savings on repeated prompts
- **Token counting API** — count tokens before sending to control costs
- **Message Batches API** — process bulk requests at 50% cost reduction
- Implement **retry logic** with exponential backoff for rate limit errors
- Track **input/output tokens** per request for cost monitoring
- Use **context trimming** (remove oldest messages) for long conversations

### 📚 Essential Resources

- [Anthropic API Docs](https://platform.claude.com/docs/en/api/overview)
- [Anthropic Cookbook (code snippets & patterns)](https://www.anthropic.com/learn/build-with-claude)
- [Models Overview](https://platform.claude.com/docs/en/about-claude/models/overview)

---

## 3️⃣ UI/UX — PROMPT BUILDER DESIGN PATTERNS

### 🎨 The "Prompt Augmentation" Pattern

Users often struggle to articulate what they want. Great prompt builders solve this with:

- **Style Galleries** — visual examples users can select to set tone/format
- **Prompt Rewrite** — AI rewrites the user's prompt to be clearer
- **Related Prompts** — suggest similar prompts as user types
- **Prompt Builders** — guided form-style input for complex prompts
- **Parametrization** — turn prompt variables into simple UI controls (sliders, dropdowns)

### 💡 Prompting UX Principles (for YOUR users)

- **Role-Based Prompting** — let users assign roles ("You are a senior engineer…")
- **Chain-of-Thought** — expose step-by-step prompting flows visually
- **Iterative Refinement** — make it easy to tweak one thing at a time
- **Self-Review Loop** — let users ask the AI to critique its own outputs

### 🧰 Design Tools

- **Figma** — still king for wireframing
- **Anima** — converts Figma to React/Vue code
- **Locofy** — Figma → Next.js/React Native code

---

## 4️⃣ AUTHENTICATION

### ✅ Recommendation Matrix

| Tool | Best For |
|---|---|
| **Clerk** | Best Next.js DX, pre-built components, fast setup |
| **Supabase Auth** | Best if you're already using Supabase for database — 50K free MAUs |
| **NextAuth.js** | Full control, self-hosted, good for strict data requirements |

### 🎯 For DOPE Prompt Book: Use **Supabase Auth**

- Free tier: **50,000 Monthly Active Users**
- Built-in Row-Level Security (users only see their own prompts)
- OAuth (Google/GitHub login) built in
- Works perfectly with the Supabase database layer

---

## 5️⃣ DATABASE

### ✅ Recommended: Supabase (PostgreSQL)

- Hosted PostgreSQL — no infrastructure management
- **Realtime subscriptions** — great for live prompt output streaming
- **Row-Level Security** — users can only access their own data
- **File Storage** — if you need users to upload documents/context files
- Edge Functions for serverless logic

---

## 6️⃣ DEPLOYMENT

### ✅ Recommended Stack: Vercel + Supabase

**Vercel** handles:
- Frontend deployment (optimized for Next.js)
- Serverless API routes
- Automatic preview deployments for every branch
- Global CDN — fast everywhere

**Supabase** handles:
- Database + Auth + Storage
- Free tier is generous for early stage

### 🚀 "Go Live" Checklist

- [ ] Move API keys to Vercel environment variables
- [ ] Set up Supabase project and connect to Vercel
- [ ] Enable Vercel's Edge Network for fast global delivery
- [ ] Set up CI/CD (Vercel auto-deploys on every GitHub push)
- [ ] Add error monitoring (Sentry — free tier available)

---

## 7️⃣ PROMPT STORAGE & ORGANIZATION

### Tools for Managing Prompts as Assets

- **PromptLayer** — store, version, and monitor prompt performance
- **PromptHub** — team collaboration around prompt templates
- **Your own Supabase table** — full control, custom schema for DOPE Prompt Book

### Suggested Prompt Schema (Supabase)

```
prompts
  - id
  - user_id
  - title
  - content (the prompt text)
  - variables (JSON — for parametrized prompts)
  - tags
  - model (which Claude model to use)
  - version
  - created_at
  - updated_at
```

---

## 🧠 CHALLENGE YOUR THINKING

Ask yourself these before writing a line of code:

- **Who is the user?** Developers? Non-technical writers? Teams?
- **What's the core loop?** Write prompt → test with Claude → save/share?
- **How do prompts get reused?** Templates? Forks? Version history?
- **What makes a prompt "modular"?** Variables? Composable blocks? Chaining?
- **What's the data model for a "composed" prompt?**

---

## 📌 SOURCES

- [Best frameworks for web dev 2026 — Wasp](https://wasp.sh/resources/2026/02/24/best-frameworks-web-dev-2026)
- [Top LLM Engineering Frameworks 2026 — Ryz Labs](https://learn.ryzlabs.com/ai-development/top-llm-engineering-frameworks-2026)
- [Anthropic Claude API Complete Guide 2026 — Calmops](https://calmops.com/ai/claude-api-complete-guide-2026/)
- [Claude API Docs — Models Overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [Prompt Augmentation UX Design Patterns — UX Tigers](https://www.uxtigers.com/post/prompt-augmentation)
- [Prompt Engineering for Designers — Parallel HQ](https://www.parallelhq.com/blog/prompt-engineering-designers)
- [Clerk vs Supabase Auth vs NextAuth — Medium](https://medium.com/better-dev-nextjs-react/clerk-vs-supabase-auth-vs-nextauth-js-the-production-reality-nobody-tells-you-a4b8f0993e1b)
- [Vercel vs Railway 2026 — Build MVP Fast](https://www.buildmvpfast.com/compare/vercel-vs-railway)
- [Supabase + Vercel Startup Toolkit — Medium](https://medium.com/innova-technology/a-startup-toolkit-overview-supabase-vercel-and-railway-ee979de32414)
- [AI Prototyping & UX Tools 2026 — Vibe Coding](https://vibecoding.app/blog/ai-prototyping-ux-tools)
