# MVP Plan for Student-Centric Educational Platform

## 1. Executive Summary
Build a next‑generation learning hub that blends AI‑personalized tutoring, collaborative study tools, and gamified progress tracking. The platform will be constructed with:

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Backend:** Serverless API on Netlify (written in TypeScript)
- **Database:** Supabase (PostgreSQL + Auth + Realtime)
- **AI:** OpenRouter API key for LLM‑driven assistance

The goal is to deliver 7‑8 high‑impact features that surpass typical EdTech solutions for students.

---

## 2. Core Features (7‑8)

| # | Feature | Student Benefit | Implementation Highlights |
|---|---------|----------------|----------------------------|
| 1 | **AI‑Powered Personalized Learning Path** | Adaptive curriculum recommendations based on strengths/weaknesses | • OpenRouter LLM endpoint wrapped via Netlify serverless function <br>• Supabase storing user progress & preference vectors <br>• API returns next‑lesson suggestions |
| 2 | **Interactive Coding Sandbox** | Write/run code directly in-browser without local setup | • Embedded CodeSandbox‑style component <br>• Secure execution via isolated Docker containers (external service) <br>• Results stored in Supabase for review |
| 3 | **Collaborative Study Rooms** | Real‑time co‑editing of notes, whiteboards, and projects | • Y‑js or ShareDB for CRDT collaboration <br>• Supabase realtime channels broadcast changes <br>• Integrated video chat via WebRTC (optional) |
| 4 | **Gamified Progress & Badges** | Motivation through achievements, leaderboards, and rewards | • Tables: `users`, `badges`, `user_badges` <br>• Badge logic runs in serverless function <br>• UI displays badge collection in student dashboard |
| 5 | **Smart Study Planner & Calendar** | Auto‑generated schedules, reminders, and exam preparation plans | • Drag‑and‑drop planner UI <br>• Backend aggregates workload using Supabase queries <br>• Push notifications via webhooks or email (resend) |
| 6 | **AI‑Moderated Q&A Forum** | Peer‑to‑peer questioning with AI‑assisted answers & moderation | • Forum posts stored in Supabase <br>• API routes forward unanswered queries to OpenRouter for instant responses <br>• AI flags low‑quality content before posting |
| 7 | **Multi‑Modal Content Hub** (Video, Text, Quizzes) | Varied learning formats to suit different preferences | • Content stored as Supabase rows with media URLs <br>• Adaptive streaming (HLS) for videos <br>• Embedded quiz component with instant feedback |
| 8 | **Open‑Source Project Collaboration** | Students can team up on Git‑based projects with versioning | • Integration with GitHub API (OAuth) <br>• Issue & PR tracking UI <br>• AI code review suggestions via OpenRouter |

---

## 3. Technology Stack Details

### Frontend (Next.js)
- **Pages/ API Routes:** `/app/*` for all UI pages.
- **Styling:** Tailwind CSS + CSS Modules.
- **State Management:** React Context + Zustand (lightweight) for global store.
- **Authentication:** Supabase Auth SDK (`@supabase/supabase-js`).
- **API Client:** Custom wrapper around `fetch` that injects the OpenRouter API key from env vars.

### Backend (Netlify Serverless Functions)
- **Runtime:** Node.js 20 (via Netlify Edge Functions).
- **Framework:** `netlify/functions` written in TypeScript.
- **Key Functions:**
  - `/api/ai-chat` – proxy to OpenRouter.
  - `/api/auth/callback` – handle Supabase OAuth flow.
  - `/api/planner` – generate study plans.
  - `/api/badge-check` – evaluate progress for badge unlocks.

### Database (Supabase)
- **Core Tables:**
  - `users` (id, email, avatar_url, created_at)
  - `courses` (id, title, description,category)
  - `progress` (user_id, course_id, lesson_id, completed_at, mastery_score)
  - `badges` (id, name, criteria_json)
  - `planner_entries` (id, user_id, scheduled_date, task_type)
  - `forum_posts` (id, user_id, thread_id, content, ai_response)
- **Real‑time Channels:** Enabled for `progress`, `forum_posts`.

### AI Integration (OpenRouter)
- **Endpoint:** `/api/ai/*` routes forward request bodies to `https://openrouter.ai/api/v1/chat/completions`.
- **Headers:** `Authorization: Bearer ${OPENROUTER_API_KEY}`, `HTTP-Referer: https://your‑site.com`, `X-Title: Student Learning Platform`.
- **Rate Limiting:** Apply Netlify function durability with `lru-cache` middleware.

### Deployment
- **CI/CD:** GitHub → Netlify auto‑deploy on push.
- **Environment Variables:** Managed via Netlify UI (API keys, Supabase URL, JWT secret).
- **Edge Caching:** Static assets cached for 5 min; dynamic routes disabled for caching.

---

## 4. Step‑by‑Step Implementation Plan

1. **Repo & Project Bootstrap**
   - Create GitHub repo `student-platform`.
   - `npx create-next-app@latest --typescript --tailwind --eslint`.
   - Set up Netlify repo for serverless functions (`netlify/functions/`).

2. **Supabase Provisioning**
   - Create Supabase project; note URL & anon key.
   - Enable Auth (email + Google) and create required tables.
   - Configure Row Level Security (RLS) policies.

3. **Environment Variables**
   - `.env.local` for Next.js: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENROUTER_API_KEY`.
   - Netlify: add same variables + `NETLIFY_SITE_ID`.

4. **Authentication Layer**
   - Install `@supabase/supabase-js`.
   - Implement sign‑up/sign‑in flows using Supabase Auth UI components.
   - Store user UUID in session and persist to Supabase `users`.

5. **Database Service Layer**
   - Build a serverless helper (`/api/db`) wrapping Supabase client.
   - CRUD utilities for `progress`, `badges`, `planner_entries`.

6. **AI Proxy Function**
   - Create `/api/ai/chat.ts` to forward messages to OpenRouter.
   - Add validation of payload and error handling.
   - Cache frequent prompts with `lru-cache` (TTL 5 min).

7. **Personalized Learning Path**
   - Query `progress` to compute mastery scores.
   - Use OpenRouter LLM to generate next lesson recommendation.
   - Persist recommendations in a `recommendations` table.

8. **Coding Sandbox**
   - Embed Monaco Editor (or CodeMirror) component.
   - Backend endpoint `/api/sandbox/execute` that triggers external execution service.
   - Save execution results (stdout, errors) to `sandbox_results` table.

9. **Collaborative Study Rooms**
   - Choose `yjs` + `y-websocket` for CRDT sync.
   - Set up Supabase Realtime channel for room membership.
   - Build UI with shared document, media, and chat panes.

10. **Gamification Engine**
    - Define badge criteria in JSON (e.g., “Complete 5 lessons in a week”).
    - Serverless function runs nightly (via Netlify cron) to award badges.
    - UI component `BadgeDashboard` displays earned badges.

11. **Smart Planner & Calendar**
    - Front‑end drag‑and‑drop planner built with `react-beautiful-dnd`.
    - POST to `/api/planner/create` → stores sessions in `planner_entries`.
    - Simple email reminder via Resend (optional).

12. **AI‑Moderated Forum**
    - Forum UI with threads & replies.
    - When a thread is stale, auto‑trigger `/api/ai/respond` to fetch AI answer.
    - Moderation rules stored in Supabase; flagged posts hide pending admin review.

13. **Multi‑Modal Content Hub**
    - Upload videos, PDFs, quizzes via Supabase Storage.
    - UI components: video player (Video.js), quiz engine (multiple‑choice).
    - Track completion via `progress` table.

14. **Open‑Source Collaboration**
    - OAuth flow with GitHub; fetch user repositories via GitHub API.
    - UI to import repo into workspace, display issues and PRs.
    - AI code‑review endpoint similar to chat endpoint.

15. **Testing & QA**
    - Unit tests with Jest for all serverless functions.
    - End‑to‑end tests using Cypress for critical user flows.
    - Performance profiling with Lighthouse.

16. **CI/CD & Deployment**
    - Configure Netlify build command: `npm run build && netlify deploy --prod`.
    - Set up automatic env var sync from GitHub secrets.
    - Enable Netlify Analytics for usage insights.

17. **Post‑Launch Iteration**
    - Collect analytics (feature usage, drop‑off points).
    - Prioritize roadmap items based on student feedback.
    - Schedule bi‑weekly sprint cycles.

---

## 5. Future Enhancements (Post‑MVP)

- Voice‑guided tutoring (text‑to‑speech via ElevenLabs).
- VR/AR immersive labs.
- Advanced analytics dashboard (PowerBI embed).
- Multi‑language support (i18n with Next‑i18next).

---

**Deliverable:** This markdown file (`current-plan.md`) captures the complete MVP blueprint. It can be version‑controlled and refined as the project progresses.  

*End of Plan*