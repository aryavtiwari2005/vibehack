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

  useEffect(() => {
    API.get("/forum/threads").then(r => setThreads(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const createThread = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/forum/threads", { title, content, category });
      navigate(`/forum/${data.id}`);
    } catch { }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-[#FACC15] border-t-transparent animate-spin" /></div>;

  return (
    <div data-testid="forum-page">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#FACC15] mb-2 font-mono">Q&A FORUM</p>
          <h2 className="font-['Outfit'] text-3xl font-bold tracking-tighter">Community Questions</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#FACC15] text-[#0A0A0A] px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#FACC15]/90 transition-colors font-['Outfit'] flex items-center gap-2"
          data-testid="new-thread-button"
        >
          {showForm ? <><X size={14} /> CANCEL</> : <><Plus size={14} /> ASK QUESTION</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createThread} className="border border-white/15 p-6 mb-8 space-y-4" data-testid="new-thread-form">
          <div>
            <label className="text-xs uppercase tracking-[0.15em] text-white/50 font-mono mb-2 block">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-transparent border border-white/15 px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#FACC15]" placeholder="What's your question?" data-testid="thread-title-input" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.15em] text-white/50 font-mono mb-2 block">Details</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} required rows={4} className="w-full bg-transparent border border-white/15 px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#FACC15] resize-none" placeholder="Describe your question in detail..." data-testid="thread-content-input" />
          </div>
          <div className="flex items-center gap-4">
            <select value={category} onChange={e => setCategory(e.target.value)} className="bg-transparent border border-white/15 text-sm text-white font-mono px-3 py-2 focus:outline-none focus:border-[#FACC15]" data-testid="thread-category-select">
              {categories.map(c => <option key={c} value={c} className="bg-[#0A0A0A]">{c.toUpperCase()}</option>)}
            </select>
            <button type="submit" className="bg-[#FACC15] text-[#0A0A0A] px-6 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#FACC15]/90 font-['Outfit']" data-testid="submit-thread-button">
              POST QUESTION
            </button>
          </div>
        </form>
      )}

      {/* Thread list */}
      <div className="space-y-px" data-testid="thread-list">
        {threads.length === 0 && (
          <div className="border border-white/15 p-12 text-center">
            <MessageSquare size={32} className="text-white/15 mx-auto mb-3" />
            <p className="text-sm text-white/30 font-mono">No questions yet. Be the first to ask!</p>
          </div>
        )}
        {threads.map(thread => (
          <Link
            key={thread.id}
            to={`/forum/${thread.id}`}
            className="flex items-center justify-between p-5 border border-white/15 hover:bg-[#121212] transition-colors group"
            data-testid={`thread-${thread.id}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 bg-white/10 text-white/50">{thread.category}</span>
                <span className="text-[10px] text-white/20 font-mono">{new Date(thread.created_at).toLocaleDateString()}</span>
              </div>
              <h3 className="text-sm font-medium group-hover:text-[#FACC15] transition-colors truncate">{thread.title}</h3>
              <p className="text-xs text-white/30 font-mono mt-1 truncate">{thread.content}</p>
            </div>
            <div className="flex items-center gap-3 ml-4 shrink-0">
              <div className="text-right">
                <p className="text-xs text-white/40 font-mono">{thread.replies_count} replies</p>
                <p className="text-[10px] text-white/20 font-mono">by {thread.user_name}</p>
              </div>
              <ChevronRight size={16} className="text-white/20 group-hover:text-[#FACC15]" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
