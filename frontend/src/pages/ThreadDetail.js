import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "@/lib/api";
import { ArrowLeft, Send, Brain, Loader2, User } from "lucide-react";

export default function ThreadDetail() {
  const { threadId } = useParams();
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [sending, setSending] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    API.get(`/forum/threads/${threadId}`).then(r => {
      setThread(r.data.thread);
      setReplies(r.data.replies);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [threadId]);

  const postReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSending(true);
    try {
      const { data } = await API.post(`/forum/threads/${threadId}/reply`, { content: replyContent });
      setReplies([...replies, data]);
      setReplyContent("");
    } catch { }
    setSending(false);
  };

  const getAiAnswer = async () => {
    setAiLoading(true);
    try {
      const { data } = await API.post(`/forum/threads/${threadId}/ai-answer`);
      setReplies([...replies, data]);
    } catch { }
    setAiLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-[#FACC15] border-t-transparent animate-spin" /></div>;
  if (!thread) return <div className="text-center py-12"><p className="text-white/30 font-mono">Thread not found</p></div>;

  return (
    <div data-testid="thread-detail-page">
      <Link to="/forum" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white font-mono mb-6 transition-colors" data-testid="back-to-forum-link">
        <ArrowLeft size={16} /> BACK TO FORUM
      </Link>

      {/* Thread */}
      <div className="border border-white/15 p-6 mb-6" data-testid="thread-content">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 bg-white/10 text-white/50">{thread.category}</span>
          <span className="text-[10px] text-white/20 font-mono">{new Date(thread.created_at).toLocaleDateString()}</span>
        </div>
        <h2 className="font-['Outfit'] text-2xl font-bold tracking-tight mb-3">{thread.title}</h2>
        <p className="text-sm text-white/60 font-mono leading-relaxed">{thread.content}</p>
        <div className="mt-4 flex items-center gap-2">
          <div className="w-6 h-6 bg-white/15 flex items-center justify-center">
            <User size={12} className="text-white/40" />
          </div>
          <span className="text-xs text-white/30 font-mono">{thread.user_name}</span>
        </div>
      </div>

      {/* AI Answer button */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-[0.15em] text-white/40 font-mono">{replies.length} REPLIES</p>
        <button
          onClick={getAiAnswer}
          disabled={aiLoading}
          className="border border-[#FACC15] text-[#FACC15] px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#FACC15]/10 transition-colors font-['Outfit'] flex items-center gap-2 disabled:opacity-50"
          data-testid="get-ai-answer-button"
        >
          {aiLoading ? <><Loader2 size={14} className="animate-spin" /> THINKING...</> : <><Brain size={14} /> GET AI ANSWER</>}
        </button>
      </div>

      {/* Replies */}
      <div className="space-y-px mb-6" data-testid="replies-list">
        {replies.map(reply => (
          <div
            key={reply.id}
            className={`p-5 border ${reply.is_ai ? "border-[#FACC15]/30 border-l-2 border-l-[#FACC15]" : "border-white/10"}`}
            data-testid={`reply-${reply.id}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {reply.is_ai ? (
                <div className="w-6 h-6 bg-[#FACC15] flex items-center justify-center">
                  <Brain size={12} className="text-[#0A0A0A]" />
                </div>
              ) : (
                <div className="w-6 h-6 bg-white/15 flex items-center justify-center">
                  <User size={12} className="text-white/40" />
                </div>
              )}
              <span className={`text-xs font-mono ${reply.is_ai ? "text-[#FACC15]" : "text-white/40"}`}>{reply.user_name}</span>
              <span className="text-[10px] text-white/20 font-mono">{new Date(reply.created_at).toLocaleDateString()}</span>
              {reply.is_ai && <span className="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 bg-[#FACC15]/20 text-[#FACC15]">AI</span>}
            </div>
            <div className="text-sm text-white/70 font-mono leading-relaxed whitespace-pre-wrap pl-8">
              {reply.content}
            </div>
          </div>
        ))}
        {replies.length === 0 && (
          <div className="border border-white/15 p-8 text-center">
            <p className="text-sm text-white/20 font-mono">No replies yet. Be the first or ask the AI!</p>
          </div>
        )}
      </div>

      {/* Reply form */}
      <form onSubmit={postReply} className="border border-white/15 p-4" data-testid="reply-form">
        <textarea
          value={replyContent}
          onChange={e => setReplyContent(e.target.value)}
          rows={3}
          className="w-full bg-transparent border border-white/15 px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-[#FACC15] resize-none mb-3"
          placeholder="Write your reply..."
          required
          data-testid="reply-content-input"
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-[#FACC15] text-[#0A0A0A] px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#FACC15]/90 transition-colors font-['Outfit'] flex items-center gap-2 disabled:opacity-50"
          data-testid="submit-reply-button"
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} POST REPLY
        </button>
      </form>
    </div>
  );
}
