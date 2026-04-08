import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "@/lib/api";
import { Plus, MessageSquare, X, ChevronRight } from "lucide-react";

const categories = ["general", "python", "web-dev", "data-science", "algorithms", "react"];

export default function Forum() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const navigate = useNavigate();

  useEffect(() => { API.get("/forum/threads").then(r => setThreads(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const createThread = async (e) => { e.preventDefault(); try { const { data } = await API.post("/forum/threads", { title, content, category }); navigate(`/forum/${data.id}`); } catch { } };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-[#60A5FA] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div data-testid="forum-page">
      <div className="flex items-start justify-between mb-8">
        <div className="animate-fade-in-up stagger-1">
          <p className="text-sm font-semibold text-[#1E3A8A] mb-1 font-['Outfit']">Q&A Forum</p>
          <h2 className="font-['Outfit'] text-3xl font-bold tracking-tight text-[#1E293B]">Community Questions</h2>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#1E3A8A] text-white px-4 py-2 text-xs font-semibold rounded-lg hover:bg-[#1E3A8A]/90 btn-press font-['Outfit'] flex items-center gap-2 animate-fade-in-up stagger-2"
          data-testid="new-thread-button">
          {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Ask Question</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createThread} className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-8 space-y-4 animate-scale-in" data-testid="new-thread-form">
          <div>
            <label className="text-xs font-medium text-[#64748B] font-mono mb-2 block">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-[#F9FAFB] border border-[#E2E8F0] px-4 py-2.5 text-sm font-mono text-[#1E293B] rounded-lg focus:outline-none focus:border-[#60A5FA]" placeholder="What's your question?" data-testid="thread-title-input" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#64748B] font-mono mb-2 block">Details</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} required rows={4} className="w-full bg-[#F9FAFB] border border-[#E2E8F0] px-4 py-2.5 text-sm font-mono text-[#1E293B] rounded-lg focus:outline-none focus:border-[#60A5FA] resize-none" placeholder="Describe in detail..." data-testid="thread-content-input" />
          </div>
          <div className="flex items-center gap-4">
            <select value={category} onChange={e => setCategory(e.target.value)} className="bg-[#F9FAFB] border border-[#E2E8F0] text-sm text-[#1E293B] font-mono px-3 py-2 rounded-lg focus:outline-none focus:border-[#60A5FA]" data-testid="thread-category-select">
              {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
            </select>
            <button type="submit" className="bg-[#34D399] text-[#1E293B] px-6 py-2 text-xs font-semibold rounded-lg hover:bg-[#34D399]/90 btn-press font-['Outfit']" data-testid="submit-thread-button">Post Question</button>
          </div>
        </form>
      )}

      <div className="space-y-3" data-testid="thread-list">
        {threads.length === 0 && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
            <MessageSquare size={32} className="text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-sm text-[#94A3B8] font-mono">No questions yet. Be the first to ask!</p>
          </div>
        )}
        {threads.map(thread => (
          <Link key={thread.id} to={`/forum/${thread.id}`}
            className="flex items-center justify-between p-5 bg-white rounded-xl border border-[#E2E8F0] card-hover group block"
            data-testid={`thread-${thread.id}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#60A5FA]/10 text-[#60A5FA]">{thread.category}</span>
                <span className="text-[10px] text-[#CBD5E1] font-mono">{new Date(thread.created_at).toLocaleDateString()}</span>
              </div>
              <h3 className="text-sm font-medium text-[#1E293B] group-hover:text-[#1E3A8A] transition-colors truncate">{thread.title}</h3>
              <p className="text-xs text-[#94A3B8] font-mono mt-1 truncate">{thread.content}</p>
            </div>
            <div className="flex items-center gap-3 ml-4 shrink-0">
              <div className="text-right">
                <p className="text-xs text-[#64748B] font-mono">{thread.replies_count} replies</p>
                <p className="text-[10px] text-[#CBD5E1] font-mono">by {thread.user_name}</p>
              </div>
              <ChevronRight size={16} className="text-[#CBD5E1] group-hover:text-[#1E3A8A]" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
