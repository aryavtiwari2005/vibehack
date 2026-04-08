import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import API from "@/lib/api";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Plus, X, Users, MessageSquare, Send } from "lucide-react";

const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

function RoomLobby({ rooms, onJoin, onCreate, loading }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    await onCreate(name, topic);
    setName(""); setTopic(""); setShowForm(false);
  };

  return (
    <div data-testid="study-rooms-lobby">
      <div className="flex items-start justify-between mb-8">
        <div className="animate-fade-in-up stagger-1">
          <p className="text-xs uppercase tracking-[0.2em] text-[#FACC15] mb-2 font-mono">STUDY ROOMS</p>
          <h2 className="font-['Outfit'] text-3xl font-bold tracking-tighter">Join a Live Session</h2>
          <p className="text-sm text-white/40 font-mono mt-2">Video call with peers to study together in real time.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#FACC15] text-[#0A0A0A] px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#FACC15]/90 transition-all btn-press font-['Outfit'] flex items-center gap-2 animate-fade-in-up stagger-2"
          data-testid="create-room-button"
        >
          {showForm ? <><X size={14} /> CANCEL</> : <><Plus size={14} /> CREATE ROOM</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="border border-white/15 p-6 mb-8 space-y-4 animate-scale-in" data-testid="create-room-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-white/50 font-mono mb-2 block">Room Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required className="w-full bg-transparent border border-white/15 px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#FACC15] transition-colors" placeholder="e.g. Python Study Group" data-testid="room-name-input" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-white/50 font-mono mb-2 block">Topic</label>
              <input value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-transparent border border-white/15 px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#FACC15] transition-colors" placeholder="e.g. Data Structures review" data-testid="room-topic-input" />
            </div>
          </div>
          <button type="submit" className="bg-[#FACC15] text-[#0A0A0A] px-6 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#FACC15]/90 btn-press font-['Outfit']" data-testid="submit-room-button">
            CREATE ROOM
          </button>
        </form>
      )}

      {/* Room list */}
      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-[#FACC15] border-t-transparent animate-spin" /></div>
      ) : rooms.length === 0 ? (
        <div className="border border-white/15 p-12 text-center animate-fade-in">
          <Video size={32} className="text-white/15 mx-auto mb-3" />
          <p className="text-sm text-white/30 font-mono">No active study rooms. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/15">
          {rooms.map((room, i) => (
            <div key={room.id} className={`bg-[#0A0A0A] p-6 card-hover animate-fade-in-up stagger-${Math.min(i + 1, 6)}`} data-testid={`room-card-${room.id}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#FACC15]/10 flex items-center justify-center">
                  <Video size={16} className="text-[#FACC15]" />
                </div>
                <div>
                  <h3 className="font-['Outfit'] font-semibold text-sm">{room.name}</h3>
                  <p className="text-[10px] text-white/30 font-mono">by {room.creator_name}</p>
                </div>
              </div>
              {room.topic && <p className="text-xs text-white/40 font-mono mb-3">{room.topic}</p>}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/30 font-mono flex items-center gap-1">
                  <Users size={12} /> {room.participants_count || 0}/{room.max_participants}
                </span>
                <button
                  onClick={() => onJoin(room)}
                  className="bg-[#FACC15] text-[#0A0A0A] px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-[#FACC15]/90 btn-press font-['Outfit']"
                  data-testid={`join-room-${room.id}`}
                >
                  JOIN
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoRoom({ room, user, onLeave }) {
  const [localStream, setLocalStream] = useState(null);
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

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    }

    pc.ontrack = (event) => {
      setPeers(prev => ({ ...prev, [peerId]: { stream: event.streams[0], name: peerName || "Peer" } }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ice-candidate", target: peerId, candidate: event.candidate }));
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "closed") {
        setPeers(prev => { const n = { ...prev }; delete n[peerId]; return n; });
        delete peerConnectionsRef.current[peerId];
      }
    };

    peerConnectionsRef.current[peerId] = pc;
    return pc;
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        localStreamRef.current = stream;
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsHost = process.env.REACT_APP_BACKEND_URL?.replace(/^https?:\/\//, "") || window.location.host;
        const ws = new WebSocket(`${wsProtocol}//${wsHost}/ws/room/${room.id}/${userId}/${encodeURIComponent(userName)}`);
        wsRef.current = ws;

        ws.onmessage = async (event) => {
          const data = JSON.parse(event.data);
          if (data.type === "user-joined") {
            const pc = createPeerConnection(data.userId, data.userName);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            ws.send(JSON.stringify({ type: "offer", target: data.userId, offer }));
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
      } catch (err) {
        console.error("Failed to access media devices:", err);
      }
    };
    init();

    return () => {
      mounted = false;
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
      if (wsRef.current) wsRef.current.close();
    };
  }, [room.id, userId, userName, createPeerConnection]);

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getVideoTracks()[0];
      if (track) { track.enabled = !track.enabled; setVideoEnabled(track.enabled); }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0];
      if (track) { track.enabled = !track.enabled; setAudioEnabled(track.enabled); }
    }
  };

  const leaveRoom = () => {
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    if (wsRef.current) wsRef.current.close();
    onLeave();
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({ type: "chat-message", message: chatInput }));
    setChatMessages(prev => [...prev, { from: userName, message: chatInput, timestamp: new Date().toISOString(), isSelf: true }]);
    setChatInput("");
  };

  const peerEntries = Object.entries(peers);
  const totalParticipants = 1 + peerEntries.length;
  const gridClass = totalParticipants <= 1 ? "grid-cols-1" : totalParticipants <= 4 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div data-testid="video-room" className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#FACC15] font-mono">{room.name}</p>
          <p className="text-[10px] text-white/30 font-mono">{room.topic || "Study session"} &middot; {totalParticipants} participant{totalParticipants !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-[10px] text-green-400 font-mono">LIVE</span>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Video grid */}
        <div className="flex-1">
          <div className={`grid ${gridClass} gap-px bg-white/15 border border-white/15`}>
            {/* Local video */}
            <div className="bg-[#0A0A0A] relative aspect-video" data-testid="local-video">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              {!videoEnabled && <div className="absolute inset-0 bg-[#121212] flex items-center justify-center"><VideoOff size={32} className="text-white/20" /></div>}
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5">
                <span className="text-[10px] font-mono text-[#FACC15]">{userName} (You)</span>
              </div>
            </div>

            {/* Remote videos */}
            {peerEntries.map(([peerId, { stream, name }]) => (
              <PeerVideo key={peerId} stream={stream} name={name} peerId={peerId} />
            ))}

            {peerEntries.length === 0 && (
              <div className="bg-[#0A0A0A] aspect-video flex flex-col items-center justify-center">
                <Users size={32} className="text-white/10 mb-2" />
                <p className="text-xs text-white/20 font-mono">Waiting for others to join...</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 mt-4 p-3 border border-white/15">
            <button
              onClick={toggleVideo}
              className={`p-3 border transition-all btn-press ${videoEnabled ? "border-white/15 hover:bg-white/5" : "bg-red-500/20 border-red-500/30 text-red-400"}`}
              data-testid="toggle-video-button"
            >
              {videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
            </button>
            <button
              onClick={toggleAudio}
              className={`p-3 border transition-all btn-press ${audioEnabled ? "border-white/15 hover:bg-white/5" : "bg-red-500/20 border-red-500/30 text-red-400"}`}
              data-testid="toggle-audio-button"
            >
              {audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-3 border transition-all btn-press ${showChat ? "border-[#FACC15]/30 text-[#FACC15]" : "border-white/15 hover:bg-white/5"}`}
              data-testid="toggle-chat-button"
            >
              <MessageSquare size={18} />
            </button>
            <button
              onClick={leaveRoom}
              className="p-3 bg-red-500 text-white hover:bg-red-600 transition-all btn-press"
              data-testid="leave-room-button"
            >
              <PhoneOff size={18} />
            </button>
          </div>
        </div>

        {/* Chat panel */}
        {showChat && (
          <div className="w-72 border border-white/15 flex flex-col animate-slide-right" data-testid="room-chat">
            <div className="p-3 border-b border-white/15">
              <span className="text-xs uppercase tracking-wider text-white/40 font-mono">ROOM CHAT</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[400px]">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`text-xs ${msg.isSelf ? "text-right" : ""}`}>
                  <span className={`font-mono ${msg.isSelf ? "text-[#FACC15]" : "text-white/50"}`}>{msg.from}</span>
                  <p className="text-white/70 font-mono mt-0.5">{msg.message}</p>
                </div>
              ))}
              {chatMessages.length === 0 && <p className="text-xs text-white/15 font-mono text-center py-4">No messages yet</p>}
            </div>
            <form onSubmit={sendChat} className="p-2 border-t border-white/15 flex gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="flex-1 bg-transparent border border-white/15 px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#FACC15]"
                placeholder="Type a message..."
                data-testid="chat-input"
              />
              <button type="submit" className="bg-[#FACC15] text-[#0A0A0A] px-2 py-1.5 btn-press" data-testid="send-chat-button">
                <Send size={14} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function PeerVideo({ stream, name, peerId }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="bg-[#0A0A0A] relative aspect-video" data-testid={`peer-video-${peerId}`}>
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5">
        <span className="text-[10px] font-mono text-white/60">{name}</span>
      </div>
    </div>
  );
}

export default function StudyRooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);

  useEffect(() => {
    API.get("/rooms").then(r => setRooms(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const createRoom = async (name, topic) => {
    const { data } = await API.post("/rooms", { name, topic });
    setRooms([data, ...rooms]);
    setActiveRoom(data);
  };

  const joinRoom = (room) => setActiveRoom(room);
  const leaveRoom = () => {
    setActiveRoom(null);
    API.get("/rooms").then(r => setRooms(r.data)).catch(() => {});
  };

  if (activeRoom) return <VideoRoom room={activeRoom} user={user} onLeave={leaveRoom} />;
  return <RoomLobby rooms={rooms} onJoin={joinRoom} onCreate={createRoom} loading={loading} />;
}
