# LearnHub - Student-Centric Educational Platform PRD

## Original Problem Statement
Build a next-generation learning hub that blends AI-personalized tutoring, collaborative study tools, and gamified progress tracking. Adapted from `current-plan.md` MVP blueprint.

## Architecture
- **Frontend:** React (CRA) + Tailwind CSS + Radix UI + Monaco Editor + DnD Kit
- **Backend:** FastAPI (Python) + Motor (async MongoDB driver) + WebSocket
- **Database:** MongoDB (local)
- **AI:** GPT-4o via Emergent LLM key (emergentintegrations library)
- **Auth:** JWT (Bearer token + httpOnly cookies)
- **Video:** WebRTC (browser-native) + WebSocket signaling

## User Personas
- **Students** - Primary users who learn, code, plan, and collaborate
- **Admin** - Platform administrator (seeded on startup)

## Core Requirements
1. JWT Authentication (register/login/logout/refresh)
2. AI-Powered Personalized Learning Path (GPT-4o recommendations)
3. Interactive Coding Sandbox (Monaco Editor + Python execution)
4. Gamified Progress & Badges (6 badges, XP system, levels)
5. Smart Study Planner & Calendar (drag-and-drop kanban)
6. AI-Moderated Q&A Forum (threads + AI answers)
7. Video Call Study Rooms (WebRTC + WebSocket signaling)

## What's Been Implemented

### Phase 1 (2026-04-08)
- Full JWT auth system with admin seeding, brute-force protection
- 5 seeded courses with 21 total lessons
- 6 achievement badges with automated award logic
- Dashboard with stats, XP, level progress
- AI Learning Path with GPT-4o recommendations
- Code Sandbox with Monaco Editor, Python execution
- Study Planner with kanban (TODO/IN PROGRESS/DONE) + drag-and-drop
- Q&A Forum with thread creation, replies, and AI answers
- Dark theme with 3-color palette

### Phase 2 (2026-04-08)
- Switched AI from OpenRouter (402 error) to Emergent LLM key (GPT-4o)
- Removed "Made with Emergent" watermark
- Added CSS animations: fadeInUp, slideIn, scaleIn, pulse, float, shimmer
- Added feature images to landing page and dashboard
- Added grain overlay texture for depth
- Added hover animations (card-hover, btn-press)
- Added Video Call Study Rooms with WebRTC peer-to-peer
- WebSocket signaling for real-time room management
- In-room text chat alongside video
- Video/audio toggle controls

## Prioritized Backlog
### P1 (Important)
- Multi-Modal Content Hub (video player, quizzes)
- Open-Source Project Collaboration (GitHub API)
- Real-time notifications
- Screen sharing in study rooms

### P2 (Nice to have)
- Voice-guided tutoring (ElevenLabs TTS)
- Advanced analytics dashboard
- Multi-language support (i18n)
- Email reminders via Resend
- VR/AR immersive labs

## Next Tasks
1. Add quizzes to courses (multiple choice with instant feedback)
2. Add screen sharing to study rooms
3. Add leaderboard for gamification
4. Add email notifications for planner reminders
5. Add GitHub integration for project collaboration
