# LearnHub - Student-Centric Educational Platform PRD

## Original Problem Statement
Build a next-generation learning hub blending AI-personalized tutoring, collaborative study tools, and gamified progress tracking. Adapted from `current-plan.md` MVP blueprint.

## Architecture
- **Frontend:** React (CRA) + Tailwind CSS + Monaco Editor + DnD Kit
- **Backend:** FastAPI (Python) + Motor (async MongoDB) + WebSocket
- **Database:** MongoDB
- **AI:** GPT-4o via Emergent LLM key (emergentintegrations)
- **Auth:** JWT (Bearer token localStorage + httpOnly cookies)
- **Video:** WebRTC (browser-native) + WebSocket signaling via /api/ws/

## Color Palette
- Primary: Deep Blue #1E3A8A
- Secondary: Soft Sky Blue #60A5FA
- Accent: Mint Green #34D399
- Background: Off White #F9FAFB

## User Personas
- **Students** - Learn, code, plan, collaborate via video
- **Admin** - Platform administrator (seeded on startup)

## Core Features (7)
1. JWT Authentication (register/login/logout/refresh + brute-force protection)
2. AI-Powered Learning Path (GPT-4o recommendations)
3. Interactive Coding Sandbox (Monaco Editor + Python execution)
4. Gamified Progress & Badges (6 badges, XP system, levels)
5. Smart Study Planner (drag-and-drop kanban)
6. AI-Moderated Q&A Forum (threads + AI answers)
7. Video Call Study Rooms (WebRTC + WebSocket signaling, auto-cleanup)

## Implementation Timeline
### Phase 1 (2026-04-08) - MVP
- All 5 core features, JWT auth, dark theme, 5 courses, 6 badges

### Phase 2 (2026-04-08) - AI Fix + Study Rooms
- Switched AI to Emergent LLM key (GPT-4o)
- Added Video Call Study Rooms with WebRTC
- Added CSS animations, feature images

### Phase 3 (2026-04-08) - Color Palette + Room Fixes
- Complete color palette overhaul (blue/green/white light theme)
- Fixed WebSocket routing (/api/ws/ prefix for K8s ingress)
- Fixed WebRTC signaling (existing-participants handshake)
- Zero rooms by default (cleared on startup)
- Auto-delete rooms after 10 min inactivity (background task)

## Prioritized Backlog
### P1
- Screen sharing in study rooms
- Multi-Modal Content Hub (video, quizzes)
- Leaderboard for gamification

### P2
- GitHub project collaboration integration
- Email notifications for planner
- Multi-language support (i18n)
- Voice-guided tutoring
