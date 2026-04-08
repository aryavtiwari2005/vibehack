import requests
import sys
import json
from datetime import datetime

class LearnHubAPITester:
    def __init__(self, base_url="https://adaptive-learn-box.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_token = None
        self.user_token = None
        self.test_user_email = f"testuser_{datetime.now().strftime('%H%M%S')}@test.com"
        self.test_course_id = None
        self.test_thread_id = None
        self.test_planner_entry_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, use_admin=False, use_user=False):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
            
        if use_admin and self.admin_token:
            test_headers['Authorization'] = f'Bearer {self.admin_token}'
        elif use_user and self.user_token:
            test_headers['Authorization'] = f'Bearer {self.user_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        return self.run_test("API Health Check", "GET", "", 200)

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@learnhub.com", "password": "Admin@123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
            return True
        return False

    def test_user_registration(self):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": self.test_user_email,
                "password": "Test@123",
                "name": "Test User"
            }
        )
        if success and 'token' in response:
            self.user_token = response['token']
            print(f"   User registered: {self.test_user_email}")
            print(f"   User token obtained: {self.user_token[:20]}...")
            return True
        return False

    def test_auth_me(self):
        """Test getting current user info"""
        return self.run_test("Get Current User", "GET", "auth/me", 200, use_user=True)

    def test_get_courses(self):
        """Test getting courses list"""
        success, response = self.run_test("Get Courses", "GET", "courses", 200)
        if success and isinstance(response, list) and len(response) >= 5:
            self.test_course_id = response[0].get('id')
            print(f"   Found {len(response)} courses, using course: {self.test_course_id}")
            return True
        return False

    def test_get_course_detail(self):
        """Test getting course detail"""
        if not self.test_course_id:
            print("❌ No course ID available for testing")
            return False
        return self.run_test(f"Get Course Detail", "GET", f"courses/{self.test_course_id}", 200)

    def test_dashboard_stats(self):
        """Test dashboard stats"""
        success, response = self.run_test("Dashboard Stats", "GET", "dashboard/stats", 200, use_user=True)
        if success:
            expected_keys = ['total_lessons', 'total_courses', 'badges_earned', 'tasks_pending', 'tasks_done', 'xp', 'level']
            has_all_keys = all(key in response for key in expected_keys)
            if has_all_keys:
                print(f"   Stats: {response}")
                return True
            else:
                print(f"   Missing keys in response: {response}")
        return False

    def test_progress_update(self):
        """Test updating progress"""
        if not self.test_course_id:
            print("❌ No course ID available for testing")
            return False
        
        # First get course to find a lesson
        success, course_data = self.run_test("Get Course for Progress", "GET", f"courses/{self.test_course_id}", 200)
        if success and 'lessons' in course_data and len(course_data['lessons']) > 0:
            lesson_id = course_data['lessons'][0]['id']
            return self.run_test(
                "Update Progress",
                "POST",
                "progress",
                200,
                data={"course_id": self.test_course_id, "lesson_id": lesson_id, "score": 85},
                use_user=True
            )
        return False

    def test_get_progress(self):
        """Test getting user progress"""
        return self.run_test("Get Progress", "GET", "progress", 200, use_user=True)

    def test_badges(self):
        """Test getting badges"""
        return self.run_test("Get Badges", "GET", "badges", 200, use_user=True)

    def test_check_badges(self):
        """Test checking for new badges"""
        return self.run_test("Check Badges", "POST", "badges/check", 200, use_user=True)

    def test_planner_create(self):
        """Test creating planner entry"""
        success, response = self.run_test(
            "Create Planner Entry",
            "POST",
            "planner",
            200,
            data={
                "title": "Test Study Task",
                "description": "Test description",
                "scheduled_date": "2024-12-20",
                "priority": "medium"
            },
            use_user=True
        )
        if success and 'id' in response:
            self.test_planner_entry_id = response['id']
            print(f"   Created planner entry: {self.test_planner_entry_id}")
            return True
        return False

    def test_planner_get(self):
        """Test getting planner entries"""
        return self.run_test("Get Planner Entries", "GET", "planner", 200, use_user=True)

    def test_planner_update(self):
        """Test updating planner entry"""
        if not self.test_planner_entry_id:
            print("❌ No planner entry ID available for testing")
            return False
        return self.run_test(
            "Update Planner Entry",
            "PUT",
            f"planner/{self.test_planner_entry_id}",
            200,
            data={"status": "in-progress"},
            use_user=True
        )

    def test_planner_delete(self):
        """Test deleting planner entry"""
        if not self.test_planner_entry_id:
            print("❌ No planner entry ID available for testing")
            return False
        return self.run_test(
            "Delete Planner Entry",
            "DELETE",
            f"planner/{self.test_planner_entry_id}",
            200,
            use_user=True
        )

    def test_forum_create_thread(self):
        """Test creating forum thread"""
        success, response = self.run_test(
            "Create Forum Thread",
            "POST",
            "forum/threads",
            200,
            data={
                "title": "Test Question",
                "content": "This is a test question for the forum",
                "category": "general"
            },
            use_user=True
        )
        if success and 'id' in response:
            self.test_thread_id = response['id']
            print(f"   Created thread: {self.test_thread_id}")
            return True
        return False

    def test_forum_get_threads(self):
        """Test getting forum threads"""
        return self.run_test("Get Forum Threads", "GET", "forum/threads", 200)

    def test_forum_get_thread_detail(self):
        """Test getting thread detail"""
        if not self.test_thread_id:
            print("❌ No thread ID available for testing")
            return False
        return self.run_test("Get Thread Detail", "GET", f"forum/threads/{self.test_thread_id}", 200)

    def test_forum_reply(self):
        """Test replying to thread"""
        if not self.test_thread_id:
            print("❌ No thread ID available for testing")
            return False
        return self.run_test(
            "Reply to Thread",
            "POST",
            f"forum/threads/{self.test_thread_id}/reply",
            200,
            data={"content": "This is a test reply"},
            use_user=True
        )

    def test_sandbox_execute(self):
        """Test code sandbox execution"""
        return self.run_test(
            "Execute Python Code",
            "POST",
            "sandbox/execute",
            200,
            data={
                "code": "print('Hello from LearnHub sandbox!')\nresult = 2 + 2\nprint(f'2 + 2 = {result}')",
                "language": "python"
            },
            use_user=True
        )

    def test_ai_learning_path(self):
        """Test AI learning path recommendations"""
        success, response = self.run_test(
            "AI Learning Path",
            "POST",
            "ai/learning-path",
            200,
            use_user=True
        )
        if success:
            print(f"   AI Response: {response.get('recommendations', [])[:1]}")  # Show first recommendation
        return success

    def test_ai_chat(self):
        """Test AI chat"""
        return self.run_test(
            "AI Chat",
            "POST",
            "ai/chat",
            200,
            data={
                "messages": [
                    {"role": "user", "content": "What is Python?"}
                ]
            },
            use_user=True
        )

    def test_logout(self):
        """Test logout"""
        return self.run_test("Logout", "POST", "auth/logout", 200, use_user=True)

def main():
    print("🚀 Starting LearnHub API Testing...")
    tester = LearnHubAPITester()
    
    # Test sequence
    tests = [
        # Basic health check
        tester.test_health_check,
        
        # Authentication tests
        tester.test_admin_login,
        tester.test_user_registration,
        tester.test_auth_me,
        
        # Course and progress tests
        tester.test_get_courses,
        tester.test_get_course_detail,
        tester.test_progress_update,
        tester.test_get_progress,
        
        # Dashboard and badges
        tester.test_dashboard_stats,
        tester.test_badges,
        tester.test_check_badges,
        
        # Planner tests
        tester.test_planner_create,
        tester.test_planner_get,
        tester.test_planner_update,
        tester.test_planner_delete,
        
        # Forum tests
        tester.test_forum_create_thread,
        tester.test_forum_get_threads,
        tester.test_forum_get_thread_detail,
        tester.test_forum_reply,
        
        # Sandbox and AI tests
        tester.test_sandbox_execute,
        tester.test_ai_learning_path,
        tester.test_ai_chat,
        
        # Cleanup
        tester.test_logout,
    ]
    
    # Run all tests
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {e}")
    
    # Print results
    print(f"\n📊 Test Results:")
    print(f"   Tests run: {tester.tests_run}")
    print(f"   Tests passed: {tester.tests_passed}")
    print(f"   Success rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())