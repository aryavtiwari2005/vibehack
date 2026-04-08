# Auth Testing Playbook

## Test Credentials
- Admin: admin@learnhub.com / Admin@123
- Test User: test@student.com / Test@123 (may already exist)

## Auth Endpoints
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login
- POST /api/auth/logout - Logout (clears cookies)
- GET /api/auth/me - Get current user
- POST /api/auth/refresh - Refresh access token

## API Endpoints
- GET /api/courses - List courses
- GET /api/courses/:id - Get course detail
- GET /api/progress - Get user progress
- POST /api/progress - Update progress
- GET /api/badges - Get all badges with earned status
- POST /api/badges/check - Check and award badges
- GET /api/planner - Get planner entries
- POST /api/planner - Create planner entry
- PUT /api/planner/:id - Update entry
- DELETE /api/planner/:id - Delete entry
- GET /api/forum/threads - List threads
- POST /api/forum/threads - Create thread
- GET /api/forum/threads/:id - Get thread + replies
- POST /api/forum/threads/:id/reply - Reply to thread
- POST /api/forum/threads/:id/ai-answer - Get AI answer
- POST /api/ai/learning-path - Get AI recommendations
- POST /api/ai/chat - AI chat
- POST /api/sandbox/execute - Execute Python code
- GET /api/dashboard/stats - Dashboard stats
