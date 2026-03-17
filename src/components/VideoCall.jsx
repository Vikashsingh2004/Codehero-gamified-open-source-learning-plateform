// src/components/VideoCall.jsx
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  Share2,
} from "lucide-react";

const SIGNALING_SERVER_URL = "http://localhost:5000";
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

export const VideoCall = ({ sessionId, isHost = false, onLeave }) => {
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({});
  const remoteStreamsRef = useRef(new Map());

  const [remoteStreams, setRemoteStreams] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  // ================== CHAT STATE ==================
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // ================== INIT ==================
  useEffect(() => {
    init();
    return cleanup;
    // eslint-disable-next-line
  }, []);

  const init = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      localVideoRef.current.srcObject = stream;

      socketRef.current = io(SIGNALING_SERVER_URL);

      socketRef.current.on("connect", () => {
        socketRef.current.emit("join-room", sessionId);
      });

      // WebRTC events
      socketRef.current.on("all-users", (users) => {
        users.forEach((id) => createPeerAndOffer(id));
      });

      socketRef.current.on("user-joined", (id) => {
        setParticipants((p) => [...new Set([...p, id])]);
        createPeerAndOffer(id);
      });

      socketRef.current.on("offer", async ({ caller, sdp }) => {
        await handleOffer(caller, sdp);
      });

      socketRef.current.on("answer", async ({ caller, sdp }) => {
        const pc = peersRef.current[caller];
        if (pc) await pc.setRemoteDescription(sdp);
      });

      socketRef.current.on("ice-candidate", async ({ from, candidate }) => {
        const pc = peersRef.current[from];
        if (pc && candidate) await pc.addIceCandidate(candidate);
      });

      socketRef.current.on("user-left", removePeer);

      // ================= CHAT EVENTS =================
      socketRef.current.on("chat-message", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    } catch (err) {
      alert("Camera & microphone permission required");
      console.error(err);
    }
  };

  // ================== WEBRTC ==================
  const createPeerAndOffer = async (targetId) => {
    if (peersRef.current[targetId]) return;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peersRef.current[targetId] = pc;

    localStreamRef.current.getTracks().forEach((track) =>
      pc.addTrack(track, localStreamRef.current)
    );

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit("ice-candidate", {
          target: targetId,
          candidate: e.candidate,
        });
      }
    };

    const remoteStream = new MediaStream();
    pc.ontrack = (e) => {
      e.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));
      remoteStreamsRef.current.set(targetId, remoteStream);
      syncRemoteStreams();
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socketRef.current.emit("offer", {
      target: targetId,
      caller: socketRef.current.id,
      sdp: offer,
    });
  };

  const handleOffer = async (caller, sdp) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peersRef.current[caller] = pc;

    localStreamRef.current.getTracks().forEach((track) =>
      pc.addTrack(track, localStreamRef.current)
    );

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit("ice-candidate", {
          target: caller,
          candidate: e.candidate,
        });
      }
    };

    const remoteStream = new MediaStream();
    pc.ontrack = (e) => {
      e.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));
      remoteStreamsRef.current.set(caller, remoteStream);
      syncRemoteStreams();
    };

    await pc.setRemoteDescription(sdp);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socketRef.current.emit("answer", {
      target: caller,
      caller: socketRef.current.id,
      sdp: answer,
    });
  };

  const removePeer = (id) => {
    peersRef.current[id]?.close();
    delete peersRef.current[id];
    remoteStreamsRef.current.delete(id);
    setParticipants((p) => p.filter((x) => x !== id));
    syncRemoteStreams();
  };

  const syncRemoteStreams = () => {
    setRemoteStreams(
      [...remoteStreamsRef.current.entries()].map(([id, stream]) => ({
        id,
        stream,
      }))
    );
  };

  // ================== CONTROLS ==================
  const toggleVideo = () => {
    const track = localStreamRef.current.getVideoTracks()[0];
    track.enabled = !track.enabled;
    setVideoOn(track.enabled);
  };

  const toggleAudio = () => {
    const track = localStreamRef.current.getAudioTracks()[0];
    track.enabled = !track.enabled;
    setAudioOn(track.enabled);
  };

  const shareScreen = async () => {
    if (screenSharing) return;

    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    const screenTrack = screenStream.getVideoTracks()[0];

    Object.values(peersRef.current).forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track.kind === "video");
      sender.replaceTrack(screenTrack);
    });

    localVideoRef.current.srcObject = screenStream;
    setScreenSharing(true);

    screenTrack.onended = async () => {
      const camTrack = localStreamRef.current.getVideoTracks()[0];
      Object.values(peersRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track.kind === "video");
        sender.replaceTrack(camTrack);
      });
      localVideoRef.current.srcObject = localStreamRef.current;
      setScreenSharing(false);
    };
  };

  const leave = () => {
    socketRef.current.emit("leave-room", sessionId);
    cleanup();
    onLeave?.();
  };

  const cleanup = () => {
    socketRef.current?.disconnect();
    Object.values(peersRef.current).forEach((pc) => pc.close());
    peersRef.current = {};
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    remoteStreamsRef.current.clear();
    setRemoteStreams([]);
    setParticipants([]);
    setMessages([]);
  };

  // ================== SEND CHAT ==================
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msgObj = {
      id: socketRef.current.id,
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString(),
    };
    socketRef.current.emit("chat-message", msgObj);
    setMessages((prev) => [...prev, msgObj]);
    setNewMessage("");
  };

  // ================== UI ==================
  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col">
      {/* HEADER */}
      <div className="p-4 bg-gray-900 flex justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} /> {participants.length + 1}
        </div>
        <button onClick={leave} className="bg-red-600 px-4 py-1 rounded">
          Leave
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* VIDEO SECTION */}
        <div className="flex-1 relative bg-gray-900">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
          />

          <div className="absolute top-4 right-4 space-y-2">
            {remoteStreams.map(({ id, stream }) => (
              <video
                key={id}
                autoPlay
                playsInline
                ref={(el) => el && (el.srcObject = stream)}
                className="w-48 h-32 rounded bg-black"
              />
            ))}
          </div>

          {/* CONTROLS */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 bg-gray-900 px-6 py-3 rounded-full">
            <button onClick={toggleVideo}>
              {videoOn ? <Video /> : <VideoOff />}
            </button>
            <button onClick={toggleAudio}>
              {audioOn ? <Mic /> : <MicOff />}
            </button>
            <button onClick={shareScreen}>
              <Share2 />
            </button>
            <button onClick={leave}>
              <PhoneOff />
            </button>
          </div>
        </div>

        {/* CHAT SECTION */}
        <div className="w-80 bg-gray-800 flex flex-col">
          <div className="p-2 border-b border-gray-700 font-bold">Chat / Doubts</div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded ${
                  msg.id === socketRef.current.id
                    ? "bg-blue-600 self-end"
                    : "bg-gray-700 self-start"
                }`}
              >
                <div className="text-xs text-gray-300">{msg.time}</div>
                <div>{msg.text}</div>
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-gray-700 flex gap-2">
            <input
              type="text"
              className="flex-1 p-2 rounded text-black"
              value={newMessage}
              placeholder="Type a question..."
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 px-4 rounded"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
