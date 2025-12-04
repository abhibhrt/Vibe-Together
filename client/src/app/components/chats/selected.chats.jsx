'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaPaperPlane, FaPaperclip, FaSmile, FaMicrophone, FaEllipsisV } from 'react-icons/fa';
import io from 'socket.io-client';
import api from '@/utils/api';
import { useUserStore } from '@/store/useUserStore';

let socket = null;

export default function SelectedChats({ friend }) {
    const { user } = useUserStore();

    if (!friend) {
        return (
            <div className='flex items-center justify-center min-h-screen text-white text-xl'>
                no chat selected
            </div>
        );
    }

    const chatUserId = friend.id;

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [roomId, setRoomId] = useState(null);

    const messagesEndRef = useRef(null);

    // VIDEO CALL STATES
    const [incomingCall, setIncomingCall] = useState(false);
    const [callerId, setCallerId] = useState(null);
    const [inCall, setInCall] = useState(false);

    const localVideo = useRef(null);
    const remoteVideo = useRef(null);

    const peerConnection = useRef(null);
    const localStream = useRef(null);

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // MAIN EFFECT – LOAD CHAT + CONNECT SOCKET
    useEffect(() => {
        if (!chatUserId) return;

        const init = async () => {
            // 1️⃣ Get or create room
            const resRoom = await api.post(`/api/friends/chat/${chatUserId}`);
            setRoomId(resRoom.data.roomId);

            // 2️⃣ Load old messages
            const resMsgs = await api.get(`/api/friends/chat/${chatUserId}`);
            const old = resMsgs.data || [];
            const fixed = old.map(m => ({
                ...m,
                senderId: String(m.sender?._id || m.sender)
            }));
            setMessages(fixed);

            // 3️⃣ Connect socket
            socket = io(process.env.NEXT_PUBLIC_API_URL, {
                withCredentials: true,
            });

            // 4️⃣ Join room
            socket.emit("joinRoom", resRoom.data.roomId);

            // --------------------------
            // MESSAGE LISTENER
            // --------------------------
            socket.off("serverMessage");
            socket.on("serverMessage", msg => {
                const fixed = { ...msg, senderId: String(msg.sender?._id || msg.sender) };
                setMessages(prev => [...prev, fixed]);
            });

            // --------------------------
            // VIDEO CALL SIGNALING
            // --------------------------

            // Incoming call FIXED (ignore if caller is ME)
            socket.off("incomingCall");
            socket.on("incomingCall", ({ callerId }) => {
                if (callerId === user.id) return;   // IMPORTANT FIX
                setIncomingCall(true);
                setCallerId(callerId);
            });

            socket.off("callAccepted");
            socket.on("callAccepted", () => {
                startWebRTC(true);
            });

            socket.off("callRejected");
            socket.on("callRejected", () => {
                alert("Call Rejected");
                resetCall();
            });

            socket.off("webrtcOffer");
            socket.on("webrtcOffer", async (offer) => {
                await startWebRTC(false);
                await peerConnection.current.setRemoteDescription(offer);

                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);

                socket.emit("webrtcAnswer", { roomId: resRoom.data.roomId, answer });
            });

            socket.off("webrtcAnswer");
            socket.on("webrtcAnswer", async (answer) => {
                await peerConnection.current.setRemoteDescription(answer);
            });

            socket.off("iceCandidate");
            socket.on("iceCandidate", async (candidate) => {
                if (peerConnection.current) {
                    await peerConnection.current.addIceCandidate(candidate);
                }
            });

            socket.off("callEnded");
            socket.on("callEnded", resetCall);
        };

        init();

        return () => socket?.disconnect();
    }, [chatUserId]);

    // ---------------------------------------------------------
    // SEND MESSAGE
    // ---------------------------------------------------------
    const sendMessage = async () => {
        if (!message.trim() || !roomId) return;

        const res = await api.post(`/api/friends/message/${roomId}`, { content: message });
        const saved = res.data;

        socket.emit("sendMessageServer", { roomId, message: saved });

        setMessage('');
    };

    const isMe = (msg) => msg.senderId === String(user.id);

    // ---------------------------------------------------------
    // CALL CONTROLS
    // ---------------------------------------------------------

    const startCall = () => {
        socket.emit("callRequest", {
            roomId,
            callerId: user.id
        });
    };

    const acceptCall = () => {
        setIncomingCall(false);
        socket.emit("callAccepted", { roomId });
    };

    const rejectCall = () => {
        socket.emit("callRejected", { roomId });
        setIncomingCall(false);
    };

    const endCall = () => {
        socket.emit("endCall", { roomId });
        resetCall();
    };

    // ---------------------------------------------------------
    // WEBRTC INITIALIZATION
    // ---------------------------------------------------------
    const startWebRTC = async (isCaller) => {
        setInCall(true);

        localStream.current = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        localVideo.current.srcObject = localStream.current;

        peerConnection.current = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        // Local → Peer
        localStream.current.getTracks().forEach(track => {
            peerConnection.current.addTrack(track, localStream.current);
        });

        // Remote → UI
        peerConnection.current.ontrack = (e) => {
            remoteVideo.current.srcObject = e.streams[0];
        };

        // ICE candidates
        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("iceCandidate", {
                    roomId,
                    candidate: event.candidate
                });
            }
        };

        // Caller sends OFFER
        if (isCaller) {
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);

            socket.emit("webrtcOffer", { roomId, offer });
        }
    };

    // ---------------------------------------------------------
    // RESET CALL
    // ---------------------------------------------------------
    const resetCall = () => {
        setInCall(false);
        setIncomingCall(false);

        if (localVideo.current) localVideo.current.srcObject = null;
        if (remoteVideo.current) remoteVideo.current.srcObject = null;

        if (peerConnection.current) peerConnection.current.close();
        peerConnection.current = null;

        if (localStream.current) {
            localStream.current.getTracks().forEach(t => t.stop());
        }
    };

    // ---------------------------------------------------------
    // UI STARTS
    // ---------------------------------------------------------
    return (
        <div className='min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-red-900 flex flex-col'>

            {/* HEADER */}
            <div className='bg-gray-800/70 border-b border-purple-500/30 p-4 flex items-center justify-between sticky top-0 z-50'>
                <div className='flex items-center space-x-4'>
                    <Link href="/" className='md:hidden text-purple-300'>
                        <FaArrowLeft />
                    </Link>

                    <div className='flex items-center space-x-3'>
                        <img src={friend.avatar} className='w-10 h-10 rounded-full' />
                        <div>
                            <h2 className='text-white font-semibold'>{friend.name}</h2>
                            <p className='text-purple-300 text-sm'>online</p>
                        </div>
                    </div>
                </div>

                {/* CALL BUTTON */}
                <button onClick={startCall} className='text-green-400 hover:text-white text-2xl px-3'>
                    📞
                </button>
            </div>

            {/* INCOMING CALL POPUP */}
            {incomingCall && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-gray-800 px-6 py-4 rounded-xl text-white flex items-center space-x-4 z-50 shadow-xl">
                    <span>{friend.name} is calling…</span>

                    <button onClick={acceptCall} className="bg-green-500 px-4 py-1 rounded-lg">
                        Accept
                    </button>

                    <button onClick={rejectCall} className="bg-red-500 px-4 py-1 rounded-lg">
                        Reject
                    </button>
                </div>
            )}

            {/* VIDEO CALL SCREEN */}
            {inCall && (
                <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
                    <video ref={remoteVideo} autoPlay playsInline className="w-3/4 rounded-lg border mb-4" />

                    <video ref={localVideo} autoPlay playsInline muted className="w-40 rounded-lg border absolute bottom-5 right-5" />

                    <button onClick={endCall} className="bg-red-600 px-6 py-3 rounded-full text-white mt-4">
                        End Call
                    </button>
                </div>
            )}

            {/* CHAT AREA */}
            <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900/50'>
                {messages.map((msg, index) => {
                    const mine = isMe(msg);

                    return (
                        <div key={index} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md rounded-2xl p-3 
                                ${mine ? 'bg-purple-600 text-white' : 'bg-gray-700 text-white'}`}>
                                <p>{msg.content}</p>
                                <div className='text-xs mt-1 opacity-70 text-right'>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className='bg-gray-800/70 border-t border-purple-500/30 p-4'>
                <div className='flex items-center space-x-3'>
                    <FaPaperclip className='text-purple-300' />
                    <FaSmile className='text-purple-300' />

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())
                        }
                        placeholder='type a message...'
                        className='flex-1 bg-gray-700 text-white p-3 rounded-xl'
                    />

                    {message.trim() ? (
                        <button onClick={sendMessage} className='bg-purple-600 p-3 rounded-full text-white'>
                            <FaPaperPlane />
                        </button>
                    ) : (
                        <FaMicrophone className='text-purple-300' />
                    )}
                </div>
            </div>
        </div>
    );
}
