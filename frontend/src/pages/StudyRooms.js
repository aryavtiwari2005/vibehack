import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import API from "@/lib/api";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Plus, X, Users, MessageSquare, Send } from "lucide-react";

const ICE_CONFIG = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }] };

function RoomLobby({ rooms, onJoin, onCreate, loading }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const handleCreate = async (e) => { e.preventDefault(); await onCreate(name, topic); setName(""); setTopic(""); setShowForm(false); };

  return (
    <div data-testid="study-rooms-lobby">
      <div className="flex items-start justify-between mb-8">
        <div className="animate-fade-in-up stagger-1">
          <p className="text-sm font-semibold text-[#1E3A8A] mb-1 font-['Outfit']">Study Rooms</p>
          <h2 className="font-['Outfit'] text-3xl font-bold tracking-tight text-[#1E293B]">Join a Live Session</h2>
          <p className="text-sm text-[#94A3B8] font-mono mt-1">Video call with peers to study together in real time.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#1E3A8A] text-white px-4 py-2 text-xs font-semibold rounded-lg hover:bg-[#1E3A8A]/90 btn-press font-['Outfit'] flex items-center gap-2 animate-fade-in-up stagger-2"
          data-testid="create-room-button">
          {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Create Room</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-8 space-y-4 animate-scale-in" data-testid="create-room-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#64748B] font-mono mb-2 block">Room Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required className="w-full bg-[#F9FAFB] border border-[#E2E8F0] px-4 py-2.5 text-sm font-mono text-[#1E293B] rounded-lg focus:outline-none focus:border-[#60A5FA]" placeholder="e.g. Python Study Group" data-testid="room-name-input" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#64748B] font-mono mb-2 block">Topic</label>
              <input value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-[#F9FAFB] border border-[#E2E8F0] px-4 py-2.5 text-sm font-mono text-[#1E293B] rounded-lg focus:outline-none focus:border-[#60A5FA]" placeholder="e.g. Data Structures review" data-testid="room-topic-input" />
            </div>
          </div>
          <button type="submit" className="bg-[#34D399] text-[#1E293B] px-6 py-2 text-xs font-semibold rounded-lg hover:bg-[#34D399]/90 btn-press font-['Outfit']" data-testid="submit-room-button">Create Room</button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-[#60A5FA] border-t-transparent rounded-full animate-spin" /></div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center animate-fade-in">
          <Video size={36} className="text-[#CBD5E1] mx-auto mb-3" />
          <p className="text-sm text-[#94A3B8] font-mono mb-1">No active study rooms</p>
          <p className="text-xs text-[#CBD5E1] font-mono">Create one to get started! Rooms auto-delete after 10 min of inactivity.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room, i) => (
            <div key={room.id} className={`bg-white rounded-xl border border-[#E2E8F0] p-5 card-hover animate-fade-in-up stagger-${Math.min(i + 1, 6)}`} data-testid={`room-card-${room.id}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#60A5FA]/10 flex items-center justify-center"><Video size={16} className="text-[#60A5FA]" /></div>
                <div>
                  <h3 className="font-['Outfit'] font-semibold text-sm text-[#1E293B]">{room.name}</h3>
                  <p className="text-[10px] text-[#94A3B8] font-mono">by {room.creator_name}</p>
                </div>
              </div>
              {room.topic && <p className="text-xs text-[#64748B] font-mono mb-3">{room.topic}</p>}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#94A3B8] font-mono flex items-center gap-1"><Users size={12} /> {room.participants_count || 0}/{room.max_participants}</span>
                <button onClick={() => onJoin(room)}
                  className="bg-[#1E3A8A] text-white px-4 py-1.5 text-[10px] font-semibold rounded-lg hover:bg-[#1E3A8A]/90 btn-press font-['Outfit']"
                  data-testid={`join-room-${room.id}`}>Join</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoRoom({ room, user, onLeave }) {
  const [peers, setPeers] = useState({});
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const localVideoRef = useRef(null);
  const wsRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const localStreamRef = useRef(null);

  const userId = user._id;
  const userName = user.name || "Student";

  const createPeerConnection = useCallback((peerId, peerName) => {
    if (peerConnectionsRef.current[peerId]) return peerConnectionsRef.current[peerId];
    const pc = new RTCPeerConnection(ICE_CONFIG);
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));

    pc.ontrack = (event) => { setPeers(prev => ({ ...prev, [peerId]: { stream: event.streams[0], name: peerName || "Peer" } })); };
    pc.onicecandidate = (event) => { if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify({ type: "ice-candidate", target: peerId, candidate: event.candidate })); };
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "closed") {
        setPeers(prev => { const n = { ...prev }; delete n[peerId]; return n; });
        delete peerConnectionsRef.current[peerId];
      }
    };
    peerConnectionsRef.current[peerId] = pc;
    return pc;
  }, [userId]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // CRITICAL: Use /api/ prefix for WebSocket so Kubernetes ingress routes to backend
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsHost = process.env.REACT_APP_BACKEND_URL?.replace(/^https?:\/\//, "") || window.location.host;
        const ws = new WebSocket(`${wsProtocol}//${wsHost}/api/ws/room/${room.id}/${userId}/${encodeURIComponent(userName)}`);
        wsRef.current = ws;

        ws.onmessage = async (event) => {
          const data = JSON.parse(event.data);
          if (data.type === "existing-participants") {
            // New user receives list of existing participants - initiate offers to each
            for (const pid of data.participants) {
              const pc = createPeerConnection(pid, "Peer");
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              ws.send(JSON.stringify({ type: "offer", target: pid, offer }));
            }
          } else if (data.type === "user-joined") {
            // Existing user receives notification - wait for incoming offer
          } else if (data.type === "offer") {
            const pc = createPeerConnection(data.from, data.fromName);
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({ type: "answer", target: data.from, answer }));
          } else if (data.type === "answer") {
            const pc = peerConnectionsRef.current[data.from];
            if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          } else if (data.type === "ice-candidate") {
            const pc = peerConnectionsRef.current[data.from];
            if (pc) await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } else if (data.type === "user-left") {
            setPeers(prev => { const n = { ...prev }; delete n[data.userId]; return n; });
            const pc = peerConnectionsRef.current[data.userId];
            if (pc) { pc.close(); delete peerConnectionsRef.current[data.userId]; }
          } else if (data.type === "chat-message") {
            setChatMessages(prev => [...prev, { from: data.fromName, message: data.message, timestamp: data.timestamp }]);
          }
        };
      } catch (err) { console.error("Media access error:", err); }
    };
    init();
    return () => { mounted = false; if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop()); Object.values(peerConnectionsRef.current).forEach(pc => pc.close()); if (wsRef.current) wsRef.current.close(); };
  }, [room.id, userId, userName, createPeerConnection]);

  const toggleVideo = () => { if (localStreamRef.current) { const t = localStreamRef.current.getVideoTracks()[0]; if (t) { t.enabled = !t.enabled; setVideoEnabled(t.enabled); } } };
  const toggleAudio = () => { if (localStreamRef.current) { const t = localStreamRef.current.getAudioTracks()[0]; if (t) { t.enabled = !t.enabled; setAudioEnabled(t.enabled); } } };
  const leaveRoom = () => { if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop()); Object.values(peerConnectionsRef.current).forEach(pc => pc.close()); if (wsRef.current) wsRef.current.close(); onLeave(); };
  const sendChat = (e) => { e.preventDefault(); if (!chatInput.trim() || !wsRef.current) return; wsRef.current.send(JSON.stringify({ type: "chat-message", message: chatInput })); setChatMessages(prev => [...prev, { from: userName, message: chatInput, timestamp: new Date().toISOString(), isSelf: true }]); setChatInput(""); };

  const peerEntries = Object.entries(peers);
  const total = 1 + peerEntries.length;
  const gridClass = total <= 1 ? "grid-cols-1" : total <= 4 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div data-testid="video-room" className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-['Outfit'] text-lg font-semibold text-[#1E293B]">{room.name}</p>
          <p className="text-xs text-[#94A3B8] font-mono">{room.topic || "Study session"} &middot; {total} participant{total !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-[#34D399] rounded-full animate-pulse" /><span className="text-xs text-[#34D399] font-mono font-semibold">LIVE</span></div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className={`grid ${gridClass} gap-3`}>
            <div className="bg-[#1E293B] rounded-xl relative aspect-video overflow-hidden" data-testid="local-video">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              {!videoEnabled && <div className="absolute inset-0 bg-[#1E293B] flex items-center justify-center"><VideoOff size={32} className="text-[#64748B]" /></div>}
              <div className="absolute bottom-2 left-2 bg-black/50 rounded px-2 py-0.5"><span className="text-[10px] font-mono text-white">{userName} (You)</span></div>
            </div>
            {peerEntries.map(([peerId, { stream, name }]) => <PeerVideo key={peerId} stream={stream} name={name} peerId={peerId} />)}
            {peerEntries.length === 0 && (
              <div className="bg-[#1E293B] rounded-xl aspect-video flex flex-col items-center justify-center">
                <Users size={32} className="text-[#475569] mb-2" /><p className="text-xs text-[#64748B] font-mono">Waiting for others...</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 mt-4 bg-white rounded-xl border border-[#E2E8F0] p-3">
            <button onClick={toggleVideo} className={`p-3 rounded-lg border transition-all btn-press ${videoEnabled ? "border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#1E293B]" : "bg-red-50 border-red-200 text-red-500"}`} data-testid="toggle-video-button">
              {videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
            </button>
            <button onClick={toggleAudio} className={`p-3 rounded-lg border transition-all btn-press ${audioEnabled ? "border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#1E293B]" : "bg-red-50 border-red-200 text-red-500"}`} data-testid="toggle-audio-button">
              {audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <button onClick={() => setShowChat(!showChat)} className={`p-3 rounded-lg border transition-all btn-press ${showChat ? "border-[#60A5FA] text-[#60A5FA] bg-[#60A5FA]/5" : "border-[#E2E8F0] text-[#1E293B] hover:bg-[#F1F5F9]"}`} data-testid="toggle-chat-button">
              <MessageSquare size={18} />
            </button>
            <button onClick={leaveRoom} className="p-3 rounded-lg bg-red-500 text-white hover:bg-red-600 btn-press" data-testid="leave-room-button"><PhoneOff size={18} /></button>
          </div>
        </div>

        {showChat && (
          <div className="w-72 bg-white rounded-xl border border-[#E2E8F0] flex flex-col animate-slide-right" data-testid="room-chat">
            <div className="p-3 border-b border-[#E2E8F0]"><span className="text-xs font-semibold text-[#64748B] font-mono">Room Chat</span></div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[400px]">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`text-xs ${msg.isSelf ? "text-right" : ""}`}>
                  <span className={`font-mono font-semibold ${msg.isSelf ? "text-[#1E3A8A]" : "text-[#64748B]"}`}>{msg.from}</span>
                  <p className="text-[#1E293B] font-mono mt-0.5">{msg.message}</p>
                </div>
              ))}
              {chatMessages.length === 0 && <p className="text-xs text-[#CBD5E1] font-mono text-center py-4">No messages yet</p>}
            </div>
            <form onSubmit={sendChat} className="p-2 border-t border-[#E2E8F0] flex gap-2">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                className="flex-1 bg-[#F9FAFB] border border-[#E2E8F0] px-3 py-1.5 text-xs font-mono text-[#1E293B] rounded-lg focus:outline-none focus:border-[#60A5FA]"
                placeholder="Type a message..." data-testid="chat-input" />
              <button type="submit" className="bg-[#1E3A8A] text-white px-2.5 py-1.5 rounded-lg btn-press" data-testid="send-chat-button"><Send size={14} /></button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function PeerVideo({ stream, name, peerId }) {
  const videoRef = useRef(null);
  useEffect(() => { if (videoRef.current && stream) videoRef.current.srcObject = stream; }, [stream]);
  return (
    <div className="bg-[#1E293B] rounded-xl relative aspect-video overflow-hidden" data-testid={`peer-video-${peerId}`}>
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      <div className="absolute bottom-2 left-2 bg-black/50 rounded px-2 py-0.5"><span className="text-[10px] font-mono text-white">{name}</span></div>
    </div>
  );
}

export default function StudyRooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);

  useEffect(() => { API.get("/rooms").then(r => setRooms(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const createRoom = async (name, topic) => { const { data } = await API.post("/rooms", { name, topic }); setRooms([data, ...rooms]); setActiveRoom(data); };
  const joinRoom = (room) => setActiveRoom(room);
  const leaveRoom = () => { setActiveRoom(null); API.get("/rooms").then(r => setRooms(r.data)).catch(() => {}); };

  if (activeRoom) return <VideoRoom room={activeRoom} user={user} onLeave={leaveRoom} />;
  return <RoomLobby rooms={rooms} onJoin={joinRoom} onCreate={createRoom} loading={loading} />;
}
