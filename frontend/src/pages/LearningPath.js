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
    Promise.all([
      API.get("/courses"),
      API.get("/progress")
    ]).then(([c, p]) => {
      setCourses(c.data);
      setProgress(p.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getRecommendations = async () => {
    setLoadingRec(true);
    try {
      const { data } = await API.post("/ai/learning-path");
      setRecommendations(data.recommendations || []);
      setProgressSummary(data.progress_summary || "");
    } catch { }
    setLoadingRec(false);
  };

  const completeLesson = async (courseId, lessonId) => {
    try {
      await API.post("/progress", { course_id: courseId, lesson_id: lessonId, score: 85 });
      await API.post("/badges/check");
      const { data } = await API.get("/progress");
      setProgress(data);
    } catch { }
  };

  const isCompleted = (courseId, lessonId) => {
    return progress.some(p => p.course_id === courseId && p.lesson_id === lessonId);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-[#FACC15] border-t-transparent animate-spin" /></div>;

  return (
    <div data-testid="learning-path-page">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#FACC15] mb-2 font-mono">AI LEARNING PATH</p>
        <h2 className="font-['Outfit'] text-3xl font-bold tracking-tighter">Your Personalized Curriculum</h2>
      </div>

      {/* AI Recommendations */}
      <div className="border border-white/15 mb-8 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain size={20} className="text-[#FACC15]" />
            <h3 className="font-['Outfit'] text-lg font-semibold">AI Recommendations</h3>
          </div>
          <button
            onClick={getRecommendations}
            disabled={loadingRec}
            className="bg-[#FACC15] text-[#0A0A0A] px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#FACC15]/90 transition-colors font-['Outfit'] disabled:opacity-50 flex items-center gap-2"
            data-testid="get-recommendations-button"
          >
            {loadingRec ? <><Loader2 size={14} className="animate-spin" /> ANALYZING...</> : "GET RECOMMENDATIONS"}
          </button>
        </div>
        {progressSummary && <p className="text-xs text-white/40 font-mono mb-4">{progressSummary}</p>}
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="border border-white/10 p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-['Outfit'] font-semibold text-sm">{rec.title}</h4>
                    <p className="text-xs text-white/50 font-mono mt-1">{rec.reason}</p>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-mono px-2 py-1 ${rec.priority === "high" ? "bg-[#FACC15]/20 text-[#FACC15]" : "bg-white/10 text-white/50"}`}>
                    {rec.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/30 font-mono">Click the button above to get AI-powered learning recommendations.</p>
        )}
      </div>

      {/* Courses */}
      <p className="text-xs uppercase tracking-[0.2em] text-[#FACC15] mb-4 font-mono">AVAILABLE COURSES</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/15 mb-6">
        {courses.map((course) => {
          const completed = course.lessons?.filter(l => isCompleted(course.id, l.id)).length || 0;
          const total = course.lessons?.length || 0;
          return (
            <button
              key={course.id}
              onClick={() => setSelectedCourse(selectedCourse?.id === course.id ? null : course)}
              className={`bg-[#0A0A0A] p-6 text-left hover:bg-[#121212] transition-colors ${selectedCourse?.id === course.id ? "bg-[#121212]" : ""}`}
              data-testid={`course-card-${course.id}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#FACC15] font-mono">{course.category} &middot; {course.difficulty}</span>
                  <h3 className="font-['Outfit'] text-lg font-semibold mt-1">{course.title}</h3>
                  <p className="text-xs text-white/40 font-mono mt-1">{course.description}</p>
                </div>
                <ChevronRight size={18} className={`text-white/30 transition-transform ${selectedCourse?.id === course.id ? "rotate-90" : ""}`} />
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-white/40 font-mono mb-1">
                  <span>{completed}/{total} LESSONS</span>
                  <span>{total > 0 ? Math.round((completed / total) * 100) : 0}%</span>
                </div>
                <div className="h-1 bg-white/10 w-full">
                  <div className="h-full bg-[#FACC15] transition-all" style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Lessons */}
      {selectedCourse && (
        <div className="border border-white/15 p-6" data-testid="course-lessons">
          <h3 className="font-['Outfit'] text-xl font-semibold mb-4">{selectedCourse.title} — Lessons</h3>
          <div className="space-y-2">
            {selectedCourse.lessons?.map((lesson) => {
              const done = isCompleted(selectedCourse.id, lesson.id);
              return (
                <div key={lesson.id} className={`flex items-center justify-between p-4 border border-white/10 ${done ? "bg-[#FACC15]/5" : "hover:bg-white/5"} transition-colors`}>
                  <div className="flex items-center gap-3">
                    {done ? <CheckCircle size={18} className="text-[#FACC15]" /> : <BookOpen size={18} className="text-white/30" />}
                    <div>
                      <p className="text-sm font-medium">{lesson.title}</p>
                      <p className="text-xs text-white/40 font-mono">{lesson.content}</p>
                    </div>
                  </div>
                  {!done && (
                    <button
                      onClick={() => completeLesson(selectedCourse.id, lesson.id)}
                      className="text-xs bg-[#FACC15] text-[#0A0A0A] px-3 py-1.5 font-bold uppercase tracking-wider hover:bg-[#FACC15]/90 font-['Outfit']"
                      data-testid={`complete-lesson-${lesson.id}`}
                    >
                      COMPLETE
                    </button>
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
