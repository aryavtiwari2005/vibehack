# LearnHub - Student-Centric Educational Platform PRD

## Original Problem Statement
Build a next-generation learning hub that blends AI-personalized tutoring, collaborative study tools, and gamified progress tracking. Adapted from the `current-plan.md` MVP blueprint.

## Architecture
- **Frontend:** React (CRA) + Tailwind CSS + Radix UI components
- **Backend:** FastAPI (Python) + Motor (async MongoDB driver)
- **Database:** MongoDB (local)
- **AI:** OpenRouter API (proxied via backend)
- **Auth:** JWT (Bearer token + httpOnly cookies)

## User Personas
- **Students** - Primary users who learn, code, plan, and collaborate
- **Admin** - Platform administrator (seeded on startup)

## Core Requirements
1. JWT Authentication (register/login/logout/refresh)
2. AI-Powered Personalized Learning Path (OpenRouter LLM recommendations)
3. Interactive Coding Sandbox (Monaco Editor + Python execution)
4. Gamified Progress & Badges (6 badges, XP system, levels)
5. Smart Study Planner & Calendar (drag-and-drop kanban)
6. AI-Moderated Q&A Forum (threads + AI answers)

## What's Been Implemented (2026-04-08)
- Full JWT auth system with admin seeding, brute-force protection
- 5 seeded courses with 21 total lessons
- 6 achievement badges with automated award logic
- Dashboard with stats (XP, lessons, courses, badges, tasks)
- Learning Path page with AI recommendations via OpenRouter
- Code Sandbox with Monaco Editor and real Python execution
- Badges page with earned/locked visual states
- Study Planner with kanban (TODO/IN PROGRESS/DONE) + drag-and-drop
- Q&A Forum with thread creation, replies, and AI-powered answers
- Dark theme with 3-color palette (#0A0A0A, #FFFFFF, #FACC15)
- Responsive sidebar navigation

## Prioritized Backlog
### P0 (Critical)
- ~~JWT Auth~~ DONE
- ~~Core 5 features~~ DONE

### P1 (Important)
- Collaborative Study Rooms (Y.js CRDT sync)
- Multi-Modal Content Hub (video player, quizzes)
- Open-Source Project Collaboration (GitHub API)
- Real-time notifications

### P2 (Nice to have)
- Voice-guided tutoring (ElevenLabs TTS)
- VR/AR immersive labs
- Advanced analytics dashboard
- Multi-language support (i18n)
- Email reminders via Resend

## Next Tasks
1. Verify OpenRouter API key has credits (currently 402)
2. Add Collaborative Study Rooms feature
3. Add Multi-Modal Content Hub with quizzes
4. Add GitHub integration for project collaboration
5. Add email notifications for planner reminders
