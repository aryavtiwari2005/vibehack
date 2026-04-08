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

  useEffect(() => { API.get(`/forum/threads/${threadId}`).then(r => { setThread(r.data.thread); setReplies(r.data.replies); }).catch(() => {}).finally(() => setLoading(false)); }, [threadId]);

  const postReply = async (e) => { e.preventDefault(); if (!replyContent.trim()) return; setSending(true); try { const { data } = await API.post(`/forum/threads/${threadId}/reply`, { content: replyContent }); setReplies([...replies, data]); setReplyContent(""); } catch { } setSending(false); };
  const getAiAnswer = async () => { setAiLoading(true); try { const { data } = await API.post(`/forum/threads/${threadId}/ai-answer`); setReplies([...replies, data]); } catch { } setAiLoading(false); };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-[#60A5FA] border-t-transparent rounded-full animate-spin" /></div>;
  if (!thread) return <div className="text-center py-12"><p className="text-[#94A3B8] font-mono">Thread not found</p></div>;

  return (
    <div data-testid="thread-detail-page">
      <Link to="/forum" className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#1E3A8A] font-mono mb-6 transition-colors" data-testid="back-to-forum-link">
        <ArrowLeft size={16} /> Back to Forum
      </Link>

      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6" data-testid="thread-content">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#60A5FA]/10 text-[#60A5FA]">{thread.category}</span>
          <span className="text-[10px] text-[#CBD5E1] font-mono">{new Date(thread.created_at).toLocaleDateString()}</span>
        </div>
        <h2 className="font-['Outfit'] text-2xl font-bold tracking-tight mb-3 text-[#1E293B]">{thread.title}</h2>
        <p className="text-sm text-[#64748B] font-mono leading-relaxed">{thread.content}</p>
        <div className="mt-4 flex items-center gap-2">
          <div className="w-6 h-6 bg-[#1E3A8A] rounded-lg flex items-center justify-center"><User size={12} className="text-white" /></div>
          <span className="text-xs text-[#94A3B8] font-mono">{thread.user_name}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[#64748B] font-['Outfit']">{replies.length} Replies</p>
        <button onClick={getAiAnswer} disabled={aiLoading}
          className="border border-[#1E3A8A] text-[#1E3A8A] px-4 py-2 text-xs font-semibold rounded-lg hover:bg-[#1E3A8A]/5 btn-press font-['Outfit'] flex items-center gap-2 disabled:opacity-50"
          data-testid="get-ai-answer-button">
          {aiLoading ? <><Loader2 size={14} className="animate-spin" /> Thinking...</> : <><Brain size={14} /> Get AI Answer</>}
        </button>
      </div>

      <div className="space-y-3 mb-6" data-testid="replies-list">
        {replies.map(reply => (
          <div key={reply.id} className={`p-5 rounded-xl ${reply.is_ai ? "bg-[#1E3A8A]/5 border border-[#1E3A8A]/20" : "bg-white border border-[#E2E8F0]"}`} data-testid={`reply-${reply.id}`}>
            <div className="flex items-center gap-2 mb-2">
              {reply.is_ai ? (
                <div className="w-6 h-6 bg-[#1E3A8A] rounded-lg flex items-center justify-center"><Brain size={12} className="text-white" /></div>
              ) : (
                <div className="w-6 h-6 bg-[#60A5FA] rounded-lg flex items-center justify-center"><User size={12} className="text-white" /></div>
              )}
              <span className={`text-xs font-mono font-semibold ${reply.is_ai ? "text-[#1E3A8A]" : "text-[#64748B]"}`}>{reply.user_name}</span>
              <span className="text-[10px] text-[#CBD5E1] font-mono">{new Date(reply.created_at).toLocaleDateString()}</span>
              {reply.is_ai && <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#1E3A8A]/10 text-[#1E3A8A]">AI</span>}
            </div>
            <div className="text-sm text-[#1E293B] font-mono leading-relaxed whitespace-pre-wrap pl-8">{reply.content}</div>
          </div>
        ))}
        {replies.length === 0 && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
            <p className="text-sm text-[#CBD5E1] font-mono">No replies yet. Be the first or ask the AI!</p>
          </div>
        )}
      </div>

      <form onSubmit={postReply} className="bg-white rounded-xl border border-[#E2E8F0] p-4" data-testid="reply-form">
        <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} rows={3}
          className="w-full bg-[#F9FAFB] border border-[#E2E8F0] px-4 py-3 text-sm font-mono text-[#1E293B] rounded-lg focus:outline-none focus:border-[#60A5FA] resize-none mb-3"
          placeholder="Write your reply..." required data-testid="reply-content-input" />
        <button type="submit" disabled={sending}
          className="bg-[#1E3A8A] text-white px-5 py-2 text-xs font-semibold rounded-lg hover:bg-[#1E3A8A]/90 btn-press font-['Outfit'] flex items-center gap-2 disabled:opacity-50"
          data-testid="submit-reply-button">
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Post Reply
        </button>
      </form>
    </div>
  );
}
