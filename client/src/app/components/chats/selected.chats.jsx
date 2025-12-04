'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaPaperPlane, FaPaperclip, FaSmile, FaMicrophone, FaEllipsisV, FaCheck } from 'react-icons/fa';
import io from 'socket.io-client';
import api from '@/utils/api';
import { useUserStore } from '@/store/useUserStore';

let socket = null;

export default function SelectedChats({ friend }) {
    const { user } = useUserStore();

    if (!friend) {
        return <div className='flex items-center justify-center min-h-screen text-white text-xl'>no chat selected</div>;
    }

    const chatId = friend.id;
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [roomId, setRoomId] = useState(null);

    // VIDEO CALL STATES
    const [inCall, setInCall] = useState(false);
    const [incomingCall, setIncomingCall] = useState(false);
    const [callerId, setCallerId] = useState(null);

    const localVideo = useRef(null);
    const remoteVideo = useRef(null);
    const peerConnection = useRef(null);
    const localStream = useRef(null);

    const messagesEndRef = useRef(null);

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // INIT CHAT + SOCKET
    useEffect(() => {
        if (!chatId) return;

        const initChat = async () => {
            // Get or create room
            const roomRes = await api.post(`/api/friends/chat/${chatId}`);
            const roomData = roomRes.data;
            setRoomId(roomData.roomId);

            // Load history
            const msgRes = await api.get(`/api/friends/chat/${chatId}`);
            const oldMsgs = msgRes.data || [];
            const formatted = oldMsgs.map(msg => ({
                ...msg,
                senderId: String(msg.sender?._id || msg.sender)
            }));
            setMessages(formatted);

            // Connect socket
            socket = io(process.env.NEXT_PUBLIC_API_URL, { withCredentials: true });
            socket.emit("joinRoom", roomData.roomId);

            // LISTENERS
            socket.off("serverMessage");
            socket.on("serverMessage", (msg) => {
                const fixed = { ...msg, senderId: String(msg.sender?._id || msg.sender) };
                setMessages(prev => [...prev, fixed]);
            });

            // CALL EVENTS
            socket.on("incomingCall", ({ callerId }) => {
                setIncomingCall(true);
                setCallerId(callerId);
            });

            socket.on("callAccepted", () => {
                beginWebRTC(true);
            });

            socket.on("callRejected", () => {
                alert("Call Rejected");
                resetCall();
            });

            socket.on("webrtcOffer", async (offer) => {
                await beginWebRTC(false);
                await peerConnection.current.setRemoteDescription(offer);

                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);

                socket.emit("webrtcAnswer", { roomId, answer });
            });

            socket.on("webrtcAnswer", async (answer) => {
                await peerConnection.current.setRemoteDescription(answer);
            });

            socket.on("iceCandidate", async (candidate) => {
                if (peerConnection.current) {
                    await peerConnection.current.addIceCandidate(candidate);
                }
            });

            socket.on("callEnded", resetCall);
        };

        initChat();
        return () => socket?.disconnect();
    }, [chatId]);

    // SEND MESSAGE
    const sendMessage = async () => {
        if (!message.trim() || !roomId) return;

        const res = await api.post(`/api/friends/message/${roomId}`, { content: message });
        const saved = res.data;

        socket.emit("sendMessageServer", { roomId, message: saved });

        setMessage('');
    };

    const isMe = (msg) => msg.senderId === String(user?.id);

    // CALL: START CALL
    const startCall = () => {
        socket.emit("callRequest", { roomId, callerId: user.id });
    };

    // CALL: ACCEPT
    const acceptCall = () => {
        setIncomingCall(false);
        socket.emit("callAccepted", { roomId });
        beginWebRTC(true);
    };

    // CALL: REJECT
    const rejectCall = () => {
        socket.emit("callRejected", { roomId });
        setIncomingCall(false);
    };

    // CALL: END
    const endCall = () => {
        socket.emit("endCall", { roomId });
        resetCall();
    };

    // RESET CALL
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

    // WEBRTC SETUP
    const beginWebRTC = async (isCaller) => {
        setInCall(true);

        localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.current.srcObject = localStream.current;

        peerConnection.current = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }
            ]
        });

        localStream.current.getTracks().forEach(track =>
            peerConnection.current.addTrack(track, localStream.current)
        );

        peerConnection.current.ontrack = (event) => {
            remoteVideo.current.srcObject = event.streams[0];
        };

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("iceCandidate", { roomId, candidate: event.candidate });
            }
        };

        if (isCaller) {
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);

            socket.emit("webrtcOffer", { roomId, offer });
        }
    };

    // UI
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

                {/* VIDEO CALL BUTTON */}
                <div className="flex items-center space-x-4">
                    <button onClick={startCall} className='text-green-400 hover:text-white p-2 text-xl'>
                        📞
                    </button>
                    <FaEllipsisV className='text-purple-300' />
                </div>
            </div>

            {/* INCOMING CALL POPUP */}
            {incomingCall && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-gray-800 p-4 rounded-xl text-white space-x-4 flex items-center">
                    <span>{friend.name} is calling...</span>
                    <button onClick={acceptCall} className="bg-green-500 px-3 py-1 rounded-lg">Accept</button>
                    <button onClick={rejectCall} className="bg-red-500 px-3 py-1 rounded-lg">Reject</button>
                </div>
            )}

            {/* VIDEO CALL UI */}
            {inCall && (
                <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
                    <video ref={remoteVideo} autoPlay playsInline className="w-3/4 rounded-lg border mb-4" />
                    <video ref={localVideo} autoPlay playsInline muted className="w-40 rounded-lg border absolute bottom-5 right-5" />
                    <button onClick={endCall} className="bg-red-600 text-white px-6 py-3 rounded-full mt-4">
                        End Call
                    </button>
                </div>
            )}

            {/* CHAT AREA */}
            <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900/50'>
                {messages.map((msg, i) => {
                    const mine = isMe(msg);
                    return (
                        <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md p-3 rounded-xl ${mine ? 'bg-purple-600 text-white' : 'bg-gray-700 text-white'}`}>
                                <p>{msg.content}</p>
                                <div className='text-xs text-right mt-1 opacity-70'>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className='bg-gray-800 p-4 flex items-center space-x-3'>
                <FaPaperclip className='text-purple-300' />
                <FaSmile className='text-purple-300' />

                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) =>
                        e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())
                    }
                    placeholder="type a message..."
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
    );
}
