'use client';

import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import api from '@/utils/api';
import { useUserStore } from '@/store/useUserStore';

import {
  FaPaperclip,
  FaMicrophone,
  FaSmile,
  FaPaperPlane,
  FaArrowLeft,
  FaEllipsisV,
  FaCheck,
  FaVideo,
  FaPhoneSlash,
  FaVideoSlash,
  FaVolumeMute
} from 'react-icons/fa';

let socket = null;

export default function SelectedChats({ friend }) {
  const { user } = useUserStore();

  if (!friend) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white text-xl">
        no chat selected
      </div>
    );
  }

  const chatId = friend.id;
  const [roomId, setRoomId] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);

  // ----- WEBRTC STATES -----
  const [incomingCall, setIncomingCall] = useState(false);
  const [inCall, setInCall] = useState(false);

  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const pcRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ===============================
  // INITIAL CHAT SETUP + SOCKET
  // ===============================
  useEffect(() => {
    if (!chatId) return;

    const init = async () => {
      // 1) Create or get room
      const roomRes = await api.post(`/api/friends/chat/${chatId}`);
      setRoomId(roomRes.data.roomId);

      // 2) Fetch old messages
      const msgRes = await api.get(`/api/friends/chat/${chatId}`);
      const oldMsgs = msgRes.data.map((m) => ({
        ...m,
        senderId: String(m.sender?._id || m.sender)
      }));
      setMessages(oldMsgs);

      // 3) Init socket
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
        withCredentials: true,
      });

      socket.emit('joinRoom', roomRes.data.roomId);

      // ==== MESSAGE LISTENER ====
      socket.off('serverMessage');
      socket.on('serverMessage', (msg) => {
        const fixed = {
          ...msg,
          senderId: String(msg.sender?._id || msg.sender)
        };
        setMessages((prev) => [...prev, fixed]);
      });

      // ==== WEBRTC LISTENERS ====

      // When someone sends us an offer → show incoming call UI
      socket.on("webrtc-offer", async (offer) => {
        setIncomingCall(true);
        // Save offer for later
        pcRef.current = await createPeerConnection();
        localStreamRef.current = await getMedia();
        localStreamRef.current.getTracks().forEach(track =>
          pcRef.current.addTrack(track, localStreamRef.current)
        );
        localVideoRef.current.srcObject = localStreamRef.current;

        await pcRef.current.setRemoteDescription(offer);
      });

      socket.on("webrtc-answer", async (answer) => {
        await pcRef.current.setRemoteDescription(answer);
        setInCall(true);
      });

      socket.on("webrtc-ice-candidate", async (candidate) => {
        if (candidate && pcRef.current) {
          await pcRef.current.addIceCandidate(candidate);
        }
      });

      socket.on("webrtc-call-end", () => {
        endCall();
      });
    };

    init();

    return () => {
      socket?.disconnect();
    };
  }, [chatId]);

  const isMe = (msg) => msg.senderId === String(user.id);

  // ================================
  // MESSAGE SENDER
  // ================================
  const sendMessage = async () => {
    if (!message.trim() || !roomId) return;

    const res = await api.post(`/api/friends/message/${roomId}`, { content: message });
    socket.emit("sendMessageServer", { roomId, message: res.data });
    setMessage('');
  };

  // ===============================
  // WEBRTC FUNCTIONS
  // ===============================
  const getMedia = async () => {
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
  };

  const createPeerConnection = async () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    pc.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("webrtc-ice-candidate", {
          roomId,
          candidate: e.candidate
        });
      }
    };

    return pc;
  };

  // ------------------------------
  // CALL INITIATOR
  // ------------------------------
  const startCall = async () => {
    pcRef.current = await createPeerConnection();
    localStreamRef.current = await getMedia();

    localStreamRef.current.getTracks().forEach(track =>
      pcRef.current.addTrack(track, localStreamRef.current)
    );

    localVideoRef.current.srcObject = localStreamRef.current;

    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);

    socket.emit("webrtc-offer", { roomId, offer });

    setInCall(true);
  };

  // ------------------------------
  // ACCEPT CALL
  // ------------------------------
  const acceptCall = async () => {
    setIncomingCall(false);
    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    socket.emit("webrtc-answer", { roomId, answer });
    setInCall(true);
  };

  const rejectCall = () => {
    setIncomingCall(false);
    socket.emit("webrtc-call-end", { roomId });
    endCall();
  };

  // ------------------------------
  // END CALL
  // ------------------------------
  const endCall = () => {
    try {
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch (e) {}

    pcRef.current = null;
    localStreamRef.current = null;

    setInCall(false);
    setIncomingCall(false);

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  // ------------------------------
  // MUTE / CAMERA
  // ------------------------------
  const toggleMute = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => t.enabled = !t.enabled);
    setMuted((v) => !v);
  };

  const toggleCamera = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((t) => t.enabled = !t.enabled);
    setCameraOff((v) => !v);
  };

  // ===============================
  // RENDER UI
  // ===============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-red-900 flex flex-col">

      {/* HEADER */}
      <div className="bg-gray-800/70 border-b border-purple-500/30 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <a href="/" className="text-purple-300 hover:text-white md:hidden p-2">
            <FaArrowLeft />
          </a>

          <div className="flex items-center space-x-3">
            <img src={friend.avatar} className="w-10 h-10 rounded-full" />
            <div>
              <h2 className="text-white font-semibold">{friend.name}</h2>
              <p className="text-purple-300 text-sm">online</p>
            </div>
          </div>
        </div>

        {/* Call Button */}
        {!inCall && (
          <button
            onClick={startCall}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:scale-105"
          >
            <FaVideo className="inline-block mr-2" /> Video Call
          </button>
        )}

        {inCall && (
          <button
            onClick={endCall}
            className="bg-red-600 text-white px-4 py-2 rounded-md"
          >
            <FaPhoneSlash />
          </button>
        )}
      </div>

      {/* ===== VIDEO CALL UI ===== */}
      {inCall && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-gray-300 text-sm mb-2">You</p>
            <video ref={localVideoRef} autoPlay playsInline muted className="rounded-lg w-full" />
          </div>

          <div>
            <p className="text-gray-300 text-sm mb-2">Remote</p>
            <video ref={remoteVideoRef} autoPlay playsInline className="rounded-lg w-full" />
          </div>

          <div className="col-span-full flex justify-center gap-4 mt-3">
            <button className="bg-gray-700 text-white px-4 py-2 rounded" onClick={toggleMute}>
              {muted ? <FaVolumeMute /> : <FaMicrophone />} 
            </button>

            <button className="bg-gray-700 text-white px-4 py-2 rounded" onClick={toggleCamera}>
              {cameraOff ? <FaVideoSlash /> : <FaVideo />}
            </button>
          </div>
        </div>
      )}

      {/* ===== INCOMING CALL POPUP ===== */}
      {incomingCall && !inCall && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl text-white w-[300px] text-center">
            <h2 className="text-lg font-semibold">Incoming Call</h2>

            <div className="flex justify-center mt-4 gap-4">
              <button
                onClick={acceptCall}
                className="bg-green-600 px-4 py-2 rounded"
              >
                Accept
              </button>
              <button
                onClick={rejectCall}
                className="bg-red-600 px-4 py-2 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900/30">
        {messages.map((msg, index) => {
          const mine = isMe(msg);
          return (
            <div key={index} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs md:max-w-md rounded-2xl p-3 ${
                  mine
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-gray-700 text-white rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.content}</p>

                <div className="flex justify-end text-xs mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {mine && <FaCheck className="text-green-400 ml-1" />}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="bg-gray-800/70 border-t border-purple-500/30 p-4">
        <div className="flex items-center space-x-3">
          <button className="text-purple-300 hover:text-white">
            <FaPaperclip />
          </button>

          <button className="text-purple-300 hover:text-white">
            <FaSmile />
          </button>

          <textarea
            value={message}
            rows="1"
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              !e.shiftKey &&
              (e.preventDefault(), sendMessage())
            }
            className="flex-1 bg-gray-700/80 rounded-xl p-3 text-white"
            placeholder="type a message..."
          />

          <button
            onClick={sendMessage}
            className="bg-purple-600 text-white p-3 rounded-full"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}