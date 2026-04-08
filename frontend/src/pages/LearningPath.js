import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Brain, ChevronRight, Loader2, BookOpen, CheckCircle } from "lucide-react";

export default function LearningPath() {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [progressSummary, setProgressSummary] = useState("");
  const [loadingRec, setLoadingRec] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get("/courses"), API.get("/progress")]).then(([c, p]) => { setCourses(c.data); setProgress(p.data); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getRecommendations = async () => {
    setLoadingRec(true);
    try { const { data } = await API.post("/ai/learning-path"); setRecommendations(data.recommendations || []); setProgressSummary(data.progress_summary || ""); } catch { }
    setLoadingRec(false);
  };

  const completeLesson = async (courseId, lessonId) => {
    try { await API.post("/progress", { course_id: courseId, lesson_id: lessonId, score: 85 }); await API.post("/badges/check"); const { data } = await API.get("/progress"); setProgress(data); } catch { }
  };

  const isCompleted = (courseId, lessonId) => progress.some(p => p.course_id === courseId && p.lesson_id === lessonId);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-[#60A5FA] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div data-testid="learning-path-page">
      <div className="mb-8 animate-fade-in-up stagger-1">
        <p className="text-sm font-semibold text-[#1E3A8A] mb-1 font-['Outfit']">AI Learning Path</p>
        <h2 className="font-['Outfit'] text-3xl font-bold tracking-tight text-[#1E293B]">Your Personalized Curriculum</h2>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] mb-8 p-6 animate-fade-in-up stagger-2 shimmer-bg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1E3A8A]/10 flex items-center justify-center"><Brain size={18} className="text-[#1E3A8A]" /></div>
            <h3 className="font-['Outfit'] text-lg font-semibold text-[#1E293B]">AI Recommendations</h3>
          </div>
          <button onClick={getRecommendations} disabled={loadingRec}
            className="bg-[#1E3A8A] text-white px-4 py-2 text-xs font-semibold rounded-lg hover:bg-[#1E3A8A]/90 transition-all btn-press font-['Outfit'] disabled:opacity-50 flex items-center gap-2"
            data-testid="get-recommendations-button">
            {loadingRec ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</> : "Get Recommendations"}
          </button>
        </div>
        {progressSummary && <p className="text-xs text-[#64748B] font-mono mb-4">{progressSummary}</p>}
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="rounded-lg border border-[#E2E8F0] p-4 hover:bg-[#F9FAFB] transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-['Outfit'] font-semibold text-sm text-[#1E293B]">{rec.title}</h4>
                    <p className="text-xs text-[#64748B] font-mono mt-1">{rec.reason}</p>
                  </div>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-1 rounded ${rec.priority === "high" ? "bg-[#1E3A8A]/10 text-[#1E3A8A]" : "bg-[#F1F5F9] text-[#64748B]"}`}>{rec.priority}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#94A3B8] font-mono">Click the button above to get AI-powered learning recommendations.</p>
        )}
      </div>

      {/* Courses */}
      <p className="text-sm font-semibold text-[#1E3A8A] mb-3 font-['Outfit']">Available Courses</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {courses.map((course) => {
          const completed = course.lessons?.filter(l => isCompleted(course.id, l.id)).length || 0;
          const total = course.lessons?.length || 0;
          return (
            <button key={course.id} onClick={() => setSelectedCourse(selectedCourse?.id === course.id ? null : course)}
              className={`bg-white rounded-xl border border-[#E2E8F0] p-5 text-left card-hover ${selectedCourse?.id === course.id ? "ring-2 ring-[#60A5FA]" : ""}`}
              data-testid={`course-card-${course.id}`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-[#60A5FA]">{course.category} &middot; {course.difficulty}</span>
                  <h3 className="font-['Outfit'] text-base font-semibold mt-1 text-[#1E293B]">{course.title}</h3>
                  <p className="text-xs text-[#64748B] font-mono mt-1">{course.description}</p>
                </div>
                <ChevronRight size={18} className={`text-[#94A3B8] transition-transform ${selectedCourse?.id === course.id ? "rotate-90 text-[#60A5FA]" : ""}`} />
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono mb-1">
                  <span>{completed}/{total} lessons</span>
                  <span>{total > 0 ? Math.round((completed / total) * 100) : 0}%</span>
                </div>
                <div className="h-1.5 bg-[#F1F5F9] rounded-full w-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#1E3A8A] to-[#60A5FA] rounded-full transition-all" style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Lessons */}
      {selectedCourse && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 animate-scale-in" data-testid="course-lessons">
          <h3 className="font-['Outfit'] text-xl font-semibold mb-4 text-[#1E293B]">{selectedCourse.title} — Lessons</h3>
          <div className="space-y-2">
            {selectedCourse.lessons?.map((lesson) => {
              const done = isCompleted(selectedCourse.id, lesson.id);
              return (
                <div key={lesson.id} className={`flex items-center justify-between p-4 rounded-lg border ${done ? "border-[#34D399]/30 bg-[#34D399]/5" : "border-[#E2E8F0] hover:bg-[#F9FAFB]"} transition-colors`}>
                  <div className="flex items-center gap-3">
                    {done ? <CheckCircle size={18} className="text-[#34D399]" /> : <BookOpen size={18} className="text-[#94A3B8]" />}
                    <div>
                      <p className="text-sm font-medium text-[#1E293B]">{lesson.title}</p>
                      <p className="text-xs text-[#64748B] font-mono">{lesson.content}</p>
                    </div>
                  </div>
                  {!done && (
                    <button onClick={() => completeLesson(selectedCourse.id, lesson.id)}
                      className="text-xs bg-[#34D399] text-[#1E293B] px-3 py-1.5 font-semibold rounded-lg hover:bg-[#34D399]/90 btn-press font-['Outfit']"
                      data-testid={`complete-lesson-${lesson.id}`}>Complete</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
