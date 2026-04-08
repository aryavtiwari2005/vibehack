from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import uuid
import bcrypt
import jwt
import httpx
import json
import secrets
import subprocess
import tempfile
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# JWT config
JWT_ALGORITHM = "HS256"

def get_jwt_secret():
    return os.environ["JWT_SECRET"]

# Password helpers
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")

# ---------- AUTH MODELS ----------
class RegisterInput(BaseModel):
    email: str
    password: str
    name: str

class LoginInput(BaseModel):
    email: str
    password: str

# ---------- AUTH ROUTES ----------
@api_router.post("/auth/register")
async def register(input: RegisterInput, response: Response):
    email = input.email.strip().lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(input.password)
    user_doc = {
        "email": email,
        "password_hash": hashed,
        "name": input.name,
        "role": "student",
        "avatar_url": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "xp": 0,
        "level": 1,
        "streak": 0
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    set_auth_cookies(response, access_token, refresh_token)
    return {"_id": user_id, "email": email, "name": input.name, "role": "student", "xp": 0, "level": 1, "streak": 0, "token": access_token}

@api_router.post("/auth/login")
async def login(input: LoginInput, request: Request, response: Response):
    email = input.email.strip().lower()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5:
        last = attempt.get("last_attempt")
        if last and (datetime.now(timezone.utc) - datetime.fromisoformat(last)) < timedelta(minutes=15):
            raise HTTPException(status_code=429, detail="Too many login attempts. Try again in 15 minutes.")
        else:
            await db.login_attempts.delete_one({"identifier": identifier})
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"last_attempt": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_one({"identifier": identifier})
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    set_auth_cookies(response, access_token, refresh_token)
    return {"_id": user_id, "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "student"), "xp": user.get("xp", 0), "level": user.get("level", 1), "streak": user.get("streak", 0), "token": access_token}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def me(request: Request):
    user = await get_current_user(request)
    return user

@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access_token = create_access_token(str(user["_id"]), user["email"])
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
        return {"message": "Token refreshed"}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# ---------- COURSE MODELS ----------
class CourseOut(BaseModel):
    id: str
    title: str
    description: str
    category: str
    difficulty: str
    lessons: list
    image_url: str = ""

# ---------- COURSES ----------
@api_router.get("/courses")
async def get_courses():
    courses = await db.courses.find({}, {"_id": 0}).to_list(100)
    return courses

@api_router.get("/courses/{course_id}")
async def get_course(course_id: str):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

# ---------- PROGRESS ----------
@api_router.get("/progress")
async def get_progress(request: Request):
    user = await get_current_user(request)
    progress = await db.progress.find({"user_id": user["_id"]}, {"_id": 0}).to_list(1000)
    return progress

@api_router.post("/progress")
async def update_progress(request: Request):
    user = await get_current_user(request)
    body = await request.json()
    course_id = body.get("course_id")
    lesson_id = body.get("lesson_id")
    score = body.get("score", 0)
    existing = await db.progress.find_one({"user_id": user["_id"], "course_id": course_id, "lesson_id": lesson_id})
    if existing:
        await db.progress.update_one(
            {"user_id": user["_id"], "course_id": course_id, "lesson_id": lesson_id},
            {"$set": {"score": max(score, existing.get("score", 0)), "completed_at": datetime.now(timezone.utc).isoformat()}}
        )
    else:
        await db.progress.insert_one({
            "user_id": user["_id"],
            "course_id": course_id,
            "lesson_id": lesson_id,
            "score": score,
            "completed_at": datetime.now(timezone.utc).isoformat()
        })
        # Award XP
        await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$inc": {"xp": 10}})
    return {"message": "Progress updated"}

# ---------- BADGES ----------
@api_router.get("/badges")
async def get_badges(request: Request):
    user = await get_current_user(request)
    all_badges = await db.badges.find({}, {"_id": 0}).to_list(100)
    user_badges = await db.user_badges.find({"user_id": user["_id"]}, {"_id": 0}).to_list(100)
    earned_ids = {ub["badge_id"] for ub in user_badges}
    for badge in all_badges:
        badge["earned"] = badge["id"] in earned_ids
    return all_badges

@api_router.post("/badges/check")
async def check_badges(request: Request):
    user = await get_current_user(request)
    progress = await db.progress.find({"user_id": user["_id"]}).to_list(1000)
    all_badges = await db.badges.find({}, {"_id": 0}).to_list(100)
    user_badges = await db.user_badges.find({"user_id": user["_id"]}, {"_id": 0}).to_list(100)
    earned_ids = {ub["badge_id"] for ub in user_badges}
    newly_earned = []
    total_lessons = len(progress)
    total_courses = len(set(p["course_id"] for p in progress))
    for badge in all_badges:
        if badge["id"] in earned_ids:
            continue
        criteria = badge.get("criteria", {})
        if criteria.get("type") == "lessons_completed" and total_lessons >= criteria.get("count", 999):
            await db.user_badges.insert_one({"user_id": user["_id"], "badge_id": badge["id"], "earned_at": datetime.now(timezone.utc).isoformat()})
            newly_earned.append(badge)
            await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$inc": {"xp": 25}})
        elif criteria.get("type") == "courses_started" and total_courses >= criteria.get("count", 999):
            await db.user_badges.insert_one({"user_id": user["_id"], "badge_id": badge["id"], "earned_at": datetime.now(timezone.utc).isoformat()})
            newly_earned.append(badge)
            await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$inc": {"xp": 25}})
    return {"newly_earned": newly_earned}

# ---------- PLANNER ----------
@api_router.get("/planner")
async def get_planner(request: Request):
    user = await get_current_user(request)
    entries = await db.planner_entries.find({"user_id": user["_id"]}, {"_id": 0}).to_list(1000)
    return entries

class PlannerEntryInput(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str = ""
    scheduled_date: str
    status: str = "todo"
    priority: str = "medium"

@api_router.post("/planner")
async def create_planner_entry(input: PlannerEntryInput, request: Request):
    user = await get_current_user(request)
    entry = input.model_dump()
    entry["user_id"] = user["_id"]
    entry["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.planner_entries.insert_one(entry)
    entry.pop("_id", None)
    return entry

@api_router.put("/planner/{entry_id}")
async def update_planner_entry(entry_id: str, request: Request):
    user = await get_current_user(request)
    body = await request.json()
    body.pop("_id", None)
    body.pop("user_id", None)
    result = await db.planner_entries.update_one(
        {"id": entry_id, "user_id": user["_id"]},
        {"$set": body}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Updated"}

@api_router.delete("/planner/{entry_id}")
async def delete_planner_entry(entry_id: str, request: Request):
    user = await get_current_user(request)
    result = await db.planner_entries.delete_one({"id": entry_id, "user_id": user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Deleted"}

# ---------- FORUM ----------
@api_router.get("/forum/threads")
async def get_threads():
    threads = await db.forum_threads.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return threads

@api_router.post("/forum/threads")
async def create_thread(request: Request):
    user = await get_current_user(request)
    body = await request.json()
    thread = {
        "id": str(uuid.uuid4()),
        "title": body["title"],
        "content": body["content"],
        "category": body.get("category", "general"),
        "user_id": user["_id"],
        "user_name": user.get("name", "Anonymous"),
        "replies_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.forum_threads.insert_one(thread)
    thread.pop("_id", None)
    return thread

@api_router.get("/forum/threads/{thread_id}")
async def get_thread(thread_id: str):
    thread = await db.forum_threads.find_one({"id": thread_id}, {"_id": 0})
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    replies = await db.forum_replies.find({"thread_id": thread_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    return {"thread": thread, "replies": replies}

@api_router.post("/forum/threads/{thread_id}/reply")
async def reply_to_thread(thread_id: str, request: Request):
    user = await get_current_user(request)
    body = await request.json()
    reply = {
        "id": str(uuid.uuid4()),
        "thread_id": thread_id,
        "content": body["content"],
        "user_id": user["_id"],
        "user_name": user.get("name", "Anonymous"),
        "is_ai": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.forum_replies.insert_one(reply)
    reply.pop("_id", None)
    await db.forum_threads.update_one({"id": thread_id}, {"$inc": {"replies_count": 1}})
    return reply

@api_router.post("/forum/threads/{thread_id}/ai-answer")
async def ai_answer_thread(thread_id: str, request: Request):
    await get_current_user(request)
    thread = await db.forum_threads.find_one({"id": thread_id}, {"_id": 0})
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    replies = await db.forum_replies.find({"thread_id": thread_id}, {"_id": 0}).to_list(50)
    context = f"Question: {thread['title']}\n{thread['content']}\n"
    for r in replies:
        context += f"\nReply by {r['user_name']}: {r['content']}"
    ai_response = await call_openrouter([
        {"role": "system", "content": "You are a helpful educational assistant. Provide clear, detailed answers to student questions. Use examples where appropriate."},
        {"role": "user", "content": context}
    ])
    reply = {
        "id": str(uuid.uuid4()),
        "thread_id": thread_id,
        "content": ai_response,
        "user_id": "ai",
        "user_name": "AI Assistant",
        "is_ai": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.forum_replies.insert_one(reply)
    reply.pop("_id", None)
    await db.forum_threads.update_one({"id": thread_id}, {"$inc": {"replies_count": 1}})
    return reply

# ---------- AI / OPENROUTER ----------
async def call_openrouter(messages, model="openai/gpt-4o"):
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    try:
        async with httpx.AsyncClient(timeout=60) as http_client:
            resp = await http_client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "HTTP-Referer": "https://student-learning-platform.com",
                    "X-Title": "Student Learning Platform"
                },
                json={"model": model, "messages": messages}
            )
            data = resp.json()
            return data.get("choices", [{}])[0].get("message", {}).get("content", "I couldn't generate a response. Please try again.")
    except Exception as e:
        logging.error(f"OpenRouter error: {e}")
        return "AI service is temporarily unavailable. Please try again later."

@api_router.post("/ai/learning-path")
async def ai_learning_path(request: Request):
    user = await get_current_user(request)
    progress = await db.progress.find({"user_id": user["_id"]}, {"_id": 0}).to_list(1000)
    courses = await db.courses.find({}, {"_id": 0}).to_list(100)
    progress_summary = f"Student has completed {len(progress)} lessons across {len(set(p['course_id'] for p in progress))} courses."
    if progress:
        avg_score = sum(p.get("score", 0) for p in progress) / len(progress)
        progress_summary += f" Average score: {avg_score:.0f}%."
        completed_courses = [p["course_id"] for p in progress]
        progress_summary += f" Completed course IDs: {', '.join(set(completed_courses))}."
    course_list = "\n".join([f"- {c['title']} ({c['category']}, {c['difficulty']}): {c['description']}" for c in courses])
    prompt = f"""Based on the student's progress, recommend the next 3 learning steps.

Student Progress: {progress_summary}

Available Courses:
{course_list}

Provide recommendations in this JSON format:
[{{"title": "...", "reason": "...", "course_id": "...", "priority": "high/medium/low"}}]

Only return the JSON array, no other text."""

    response = await call_openrouter([
        {"role": "system", "content": "You are an AI learning advisor. Analyze student progress and recommend personalized next steps. Always respond with valid JSON."},
        {"role": "user", "content": prompt}
    ])
    try:
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        recommendations = json.loads(cleaned)
    except Exception:
        recommendations = [{"title": "Continue Learning", "reason": response, "course_id": "", "priority": "medium"}]
    return {"recommendations": recommendations, "progress_summary": progress_summary}

@api_router.post("/ai/chat")
async def ai_chat(request: Request):
    await get_current_user(request)
    body = await request.json()
    messages = body.get("messages", [])
    if not messages:
        raise HTTPException(status_code=400, detail="Messages required")
    system_msg = {"role": "system", "content": "You are a helpful educational AI tutor. Help students understand concepts, solve problems, and learn effectively. Be encouraging and thorough in your explanations."}
    all_messages = [system_msg] + messages
    response = await call_openrouter(all_messages)
    return {"response": response}

# ---------- CODING SANDBOX ----------
@api_router.post("/sandbox/execute")
async def execute_code(request: Request):
    await get_current_user(request)
    body = await request.json()
    code = body.get("code", "")
    language = body.get("language", "python")
    if language != "python":
        return {"output": "", "error": f"Only Python execution is supported in sandbox.", "execution_time": 0}
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            f.flush()
            result = subprocess.run(
                ["python3", f.name],
                capture_output=True, text=True, timeout=10,
                env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"}
            )
            os.unlink(f.name)
            return {
                "output": result.stdout[:5000],
                "error": result.stderr[:2000],
                "execution_time": 0
            }
    except subprocess.TimeoutExpired:
        return {"output": "", "error": "Execution timed out (10s limit)", "execution_time": 10}
    except Exception as e:
        return {"output": "", "error": str(e), "execution_time": 0}

# ---------- DASHBOARD STATS ----------
@api_router.get("/dashboard/stats")
async def dashboard_stats(request: Request):
    user = await get_current_user(request)
    progress = await db.progress.find({"user_id": user["_id"]}).to_list(1000)
    user_badges = await db.user_badges.find({"user_id": user["_id"]}).to_list(100)
    planner = await db.planner_entries.find({"user_id": user["_id"]}).to_list(1000)
    total_lessons = len(progress)
    total_courses = len(set(p["course_id"] for p in progress))
    badges_earned = len(user_badges)
    tasks_pending = len([p for p in planner if p.get("status") == "todo"])
    tasks_done = len([p for p in planner if p.get("status") == "done"])
    user_doc = await db.users.find_one({"_id": ObjectId(user["_id"])})
    xp = user_doc.get("xp", 0) if user_doc else 0
    level = user_doc.get("level", 1) if user_doc else 1
    return {
        "total_lessons": total_lessons,
        "total_courses": total_courses,
        "badges_earned": badges_earned,
        "tasks_pending": tasks_pending,
        "tasks_done": tasks_done,
        "xp": xp,
        "level": level
    }

# ---------- HEALTH ----------
@api_router.get("/")
async def root():
    return {"message": "LearnHub API is running"}

# ---------- APP SETUP ----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ---------- SEED DATA ----------
async def seed_data():
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@learnhub.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "avatar_url": "",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "xp": 0, "level": 1, "streak": 0
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    # Seed courses
    courses_count = await db.courses.count_documents({})
    if courses_count == 0:
        courses = [
            {"id": "python-101", "title": "Python Fundamentals", "description": "Master Python basics: variables, loops, functions, and data structures.", "category": "Programming", "difficulty": "beginner", "image_url": "", "lessons": [
                {"id": "py-1", "title": "Variables & Data Types", "content": "Learn about Python variables, integers, strings, floats, and booleans."},
                {"id": "py-2", "title": "Control Flow", "content": "Master if/else statements, for loops, and while loops."},
                {"id": "py-3", "title": "Functions", "content": "Define and call functions, understand parameters and return values."},
                {"id": "py-4", "title": "Lists & Dictionaries", "content": "Work with Python's core data structures."},
                {"id": "py-5", "title": "File I/O", "content": "Read from and write to files in Python."}
            ]},
            {"id": "web-dev-101", "title": "Web Development Basics", "description": "HTML, CSS, and JavaScript fundamentals for building web pages.", "category": "Web Development", "difficulty": "beginner", "image_url": "", "lessons": [
                {"id": "web-1", "title": "HTML Structure", "content": "Learn semantic HTML tags and page structure."},
                {"id": "web-2", "title": "CSS Styling", "content": "Style your pages with selectors, flexbox, and grid."},
                {"id": "web-3", "title": "JavaScript Basics", "content": "Variables, functions, and DOM manipulation."},
                {"id": "web-4", "title": "Responsive Design", "content": "Media queries and mobile-first design."}
            ]},
            {"id": "data-science-101", "title": "Introduction to Data Science", "description": "Learn data analysis with Python, pandas, and visualization.", "category": "Data Science", "difficulty": "intermediate", "image_url": "", "lessons": [
                {"id": "ds-1", "title": "NumPy Arrays", "content": "Efficient numerical computing with NumPy."},
                {"id": "ds-2", "title": "Pandas DataFrames", "content": "Data manipulation and analysis with pandas."},
                {"id": "ds-3", "title": "Data Visualization", "content": "Create charts and graphs with matplotlib."},
                {"id": "ds-4", "title": "Statistical Analysis", "content": "Mean, median, standard deviation, and distributions."}
            ]},
            {"id": "algorithms-101", "title": "Algorithms & Data Structures", "description": "Essential algorithms: sorting, searching, trees, and graphs.", "category": "Computer Science", "difficulty": "intermediate", "image_url": "", "lessons": [
                {"id": "alg-1", "title": "Big O Notation", "content": "Understand time and space complexity."},
                {"id": "alg-2", "title": "Sorting Algorithms", "content": "Bubble sort, merge sort, quicksort."},
                {"id": "alg-3", "title": "Binary Search", "content": "Efficient searching in sorted arrays."},
                {"id": "alg-4", "title": "Trees & Graphs", "content": "Binary trees, BFS, and DFS."}
            ]},
            {"id": "react-101", "title": "React Development", "description": "Build modern UIs with React components, hooks, and state management.", "category": "Web Development", "difficulty": "intermediate", "image_url": "", "lessons": [
                {"id": "react-1", "title": "Components & JSX", "content": "Create React components and understand JSX syntax."},
                {"id": "react-2", "title": "State & Props", "content": "Manage component state and pass props."},
                {"id": "react-3", "title": "Hooks", "content": "useState, useEffect, and custom hooks."},
                {"id": "react-4", "title": "Routing", "content": "Client-side routing with React Router."}
            ]}
        ]
        await db.courses.insert_many(courses)

    # Seed badges
    badges_count = await db.badges.count_documents({})
    if badges_count == 0:
        badges = [
            {"id": "first-lesson", "name": "First Step", "description": "Complete your first lesson", "icon": "Zap", "criteria": {"type": "lessons_completed", "count": 1}},
            {"id": "five-lessons", "name": "Quick Learner", "description": "Complete 5 lessons", "icon": "BookOpen", "criteria": {"type": "lessons_completed", "count": 5}},
            {"id": "ten-lessons", "name": "Knowledge Seeker", "description": "Complete 10 lessons", "icon": "Brain", "criteria": {"type": "lessons_completed", "count": 10}},
            {"id": "two-courses", "name": "Explorer", "description": "Start 2 different courses", "icon": "Compass", "criteria": {"type": "courses_started", "count": 2}},
            {"id": "three-courses", "name": "Pathfinder", "description": "Start 3 different courses", "icon": "Map", "criteria": {"type": "courses_started", "count": 3}},
            {"id": "twenty-lessons", "name": "Scholar", "description": "Complete 20 lessons", "icon": "GraduationCap", "criteria": {"type": "lessons_completed", "count": 20}},
        ]
        await db.badges.insert_many(badges)

    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.progress.create_index([("user_id", 1), ("course_id", 1), ("lesson_id", 1)])
    await db.planner_entries.create_index([("user_id", 1)])
    await db.forum_threads.create_index([("created_at", -1)])

    # Write test credentials
    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write(f"## Admin\n- Email: {admin_email}\n- Password: {admin_password}\n- Role: admin\n\n")
        f.write("## Test User\n- Register a new user via /api/auth/register\n\n")
        f.write("## Auth Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET /api/auth/me\n- POST /api/auth/refresh\n")

@app.on_event("startup")
async def startup():
    await seed_data()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
