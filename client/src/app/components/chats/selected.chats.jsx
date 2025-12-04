'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaPaperPlane, FaPaperclip, FaSmile, FaMicrophone } from 'react-icons/fa';
import io from 'socket.io-client';
import api from '@/utils/api';
import { useUserStore } from '@/store/useUserStore';

let socket = null;

// STUN server configuration for NAT traversal
const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];

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
    const [inCall, setInCall] = useState(false);
    const [isCallInitiator, setIsCallInitiator] = useState(false); // New state to track if current user started the call

    const localVideo = useRef(null);
    const remoteVideo = useRef(null);

    const peerConnection = useRef(null);
    const localStream = useRef(null);

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ---------------------------------------------------------
    // RESET CALL
    // ---------------------------------------------------------
    const resetCall = () => {
        setInCall(false);
        setIncomingCall(false);
        setIsCallInitiator(false); // Reset initiator state

        if (localVideo.current) localVideo.current.srcObject = null;
        if (remoteVideo.current) remoteVideo.current.srcObject = null;

        if (peerConnection.current) {
            peerConnection.current.ontrack = null;
            peerConnection.current.onicecandidate = null;
            peerConnection.current.close();
        }
        peerConnection.current = null;

        if (localStream.current) {
            localStream.current.getTracks().forEach(t => t.stop());
            localStream.current = null;
        }
    };


    // ---------------------------------------------------------
    // WEBRTC INITIALIZATION AND OFFER/ANSWER EXCHANGE
    // ---------------------------------------------------------
    const startWebRTC = async (isCaller) => {
        setInCall(true);
        setIsCallInitiator(isCaller); // Set initiator state

        try {
            // 1. Get Local Media Stream
            localStream.current = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            if (localVideo.current) {
                localVideo.current.srcObject = localStream.current;
            }

            // 2. Create RTCPeerConnection
            peerConnection.current = new RTCPeerConnection({ iceServers });

            // 3. Handle Local ICE Candidates
            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("iceCandidate", {
                        roomId,
                        candidate: event.candidate
                    });
                }
            };

            // 4. Handle Remote Track (Receiving Stream)
            peerConnection.current.ontrack = (e) => {
                if (remoteVideo.current && e.streams && e.streams[0]) {
                    remoteVideo.current.srcObject = e.streams[0];
                }
            };
            
            // 5. Add Local Tracks to PeerConnection
            localStream.current.getTracks().forEach(track => {
                peerConnection.current.addTrack(track, localStream.current);
            });

            // 6. Caller sends OFFER
            if (isCaller) {
                const offer = await peerConnection.current.createOffer();
                await peerConnection.current.setLocalDescription(offer);
                socket.emit("webrtcOffer", { roomId, offer });
            }
        } catch (error) {
            console.error("Error setting up WebRTC:", error);
            alert("Could not start video call. Check your camera/mic permissions.");
            resetCall();
        }
    };


    // MAIN EFFECT – LOAD CHAT + CONNECT SOCKET
    useEffect(() => {
        if (!chatUserId || !user) return; // Ensure user is available

        const init = async () => {
            // 1️⃣ Get or create room
            const resRoom = await api.post(`/api/friends/chat/${chatUserId}`);
            setRoomId(resRoom.data.roomId);

            // 2️⃣ Load old messages
            const resMsgs = await api.get(`/api/friends/chat/${chatUserId}`);
            const old = resMsgs.data || [];
            const fixed = old.map(m => ({
                ...m,
                // Ensure senderId is a string for comparison
                senderId: String(m.sender?._id || m.sender) 
            }));
            setMessages(fixed);

            // 3️⃣ Connect socket
            if (socket && socket.connected) {
                socket.disconnect(); // Clean up existing connection if component re-renders
            }
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
                const fixedMsg = { ...msg, senderId: String(msg.sender?._id || msg.sender) };
                setMessages(prev => [...prev, fixedMsg]);
            });

            // --------------------------
            // VIDEO CALL SIGNALING LISTENERS
            // --------------------------

            // Incoming call
            socket.off("incomingCall");
            socket.on("incomingCall", ({ callerId }) => {
                // FIXED: Check if the current user is the caller. If so, ignore the 'incomingCall' notification.
                if (String(callerId) === String(user.id)) return; 
                setIncomingCall(true);
            });

            // Call Accepted
            socket.off("callAccepted");
            socket.on("callAccepted", async () => {
                // The Caller starts WebRTC with isCaller=true
                await startWebRTC(true); 
            });

            // Call Rejected
            socket.off("callRejected");
            socket.on("callRejected", () => {
                alert(`${friend.name} rejected the call.`);
                resetCall();
            });

            // WebRTC Offer received (from Caller)
            socket.off("webrtcOffer");
            socket.on("webrtcOffer", async (offer) => {
                // The Receiver starts WebRTC with isCaller=false and processes the Offer
                await startWebRTC(false);
                await peerConnection.current.setRemoteDescription(offer);

                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);

                socket.emit("webrtcAnswer", { roomId: resRoom.data.roomId, answer });
            });

            // WebRTC Answer received (from Receiver)
            socket.off("webrtcAnswer");
            socket.on("webrtcAnswer", async (answer) => {
                if (peerConnection.current && peerConnection.current.remoteDescription.type !== 'answer') {
                     await peerConnection.current.setRemoteDescription(answer);
                }
            });

            // ICE Candidate received
            socket.off("iceCandidate");
            socket.on("iceCandidate", async (candidate) => {
                if (peerConnection.current && candidate) {
                    try {
                        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (e) {
                        console.error('Error adding received ice candidate:', e);
                    }
                }
            });

            // Call Ended
            socket.off("callEnded");
            socket.on("callEnded", resetCall);
        };

        init();

        return () => {
            // Clean up socket connection on unmount/re-render
            if (socket) {
                socket.off("serverMessage");
                socket.off("incomingCall");
                socket.off("callAccepted");
                socket.off("callRejected");
                socket.off("webrtcOffer");
                socket.off("webrtcAnswer");
                socket.off("iceCandidate");
                socket.off("callEnded");
                socket.disconnect();
                socket = null;
            }
            resetCall(); // Also ensure local call state is cleaned up
        };
    }, [chatUserId, user.id]); // Added user.id to dependencies

    // ---------------------------------------------------------
    // SEND MESSAGE
    // ---------------------------------------------------------
    const sendMessage = async () => {
        if (!message.trim() || !roomId) return;

        try {
            const res = await api.post(`/api/friends/message/${roomId}`, { content: message });
            const saved = res.data;

            socket.emit("sendMessageServer", { roomId, message: saved });

            setMessage('');
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const isMe = (msg) => String(msg.senderId) === String(user.id);

    // ---------------------------------------------------------
    // CALL CONTROLS
    // ---------------------------------------------------------

    const startCall = () => {
        if (!roomId || inCall) return;
        
        // Notify the friend of the call request
        socket.emit("callRequest", {
            roomId,
            callerId: user.id
        });
        
        // Set state for the calling user (caller) while waiting for acceptance
        setInCall(true); 
        setIsCallInitiator(true);
        alert(`Calling ${friend.name}... Waiting for acceptance.`);
    };

    const acceptCall = async () => {
        setIncomingCall(false);
        
        // The Receiver sends acceptance, then waits for the Offer from the Caller
        socket.emit("callAccepted", { roomId }); 
        
        // The receiver will set up WebRTC and process the offer in the 'webrtcOffer' listener.
    };

    const rejectCall = () => {
        socket.emit("callRejected", { roomId });
        setIncomingCall(false);
        resetCall();
    };

    const endCall = () => {
        socket.emit("endCall", { roomId });
        resetCall();
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
                        {/* FALLBACK: friend.avatar is assumed to be an image source */}
                        <img src={friend.avatar || '/default-avatar.png'} alt={friend.name} className='w-10 h-10 rounded-full' />
                        <div>
                            <h2 className='text-white font-semibold'>{friend.name}</h2>
                            {/* Assuming 'online' status for simplicity */}
                            <p className='text-purple-300 text-sm'>online</p>
                        </div>
                    </div>
                </div>

                {/* CALL BUTTON */}
                <button onClick={startCall} className={`text-2xl px-3 transition-colors ${inCall ? 'text-gray-500 cursor-not-allowed' : 'text-green-400 hover:text-white'}`} disabled={inCall}>
                    📞
                </button>
            </div>

            {/* INCOMING CALL POPUP */}
            {incomingCall && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-gray-800 px-6 py-4 rounded-xl text-white flex items-center space-x-4 z-50 shadow-xl">
                    <span>**{friend.name}** is calling…</span>

                    <button onClick={acceptCall} className="bg-green-500 px-4 py-1 rounded-lg hover:bg-green-600 transition-colors">
                        Accept
                    </button>

                    <button onClick={rejectCall} className="bg-red-500 px-4 py-1 rounded-lg hover:bg-red-600 transition-colors">
                        Reject
                    </button>
                </div>
            )}
            
            {/* CALL STATUS/WAITING MESSAGE FOR CALLER */}
            {inCall && isCallInitiator && !remoteVideo.current?.srcObject && !incomingCall && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-4 rounded-xl text-white z-50 text-center">
                    <p>Waiting for **{friend.name}** to accept the call...</p>
                    <button onClick={endCall} className="bg-red-600 px-4 py-1 rounded-full text-white mt-2 hover:bg-red-700">
                        Cancel Call
                    </button>
                </div>
            )}


            {/* VIDEO CALL SCREEN */}
            {inCall && (
                <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
                    {/* Remote Video (Friend) */}
                    <video ref={remoteVideo} autoPlay playsInline className="w-full h-full object-cover" />

                    {/* Local Video (Self) */}
                    <video ref={localVideo} autoPlay playsInline muted className="w-40 h-auto rounded-lg border-2 border-white absolute top-5 right-5 shadow-lg" />

                    <button onClick={endCall} className="bg-red-600 px-6 py-3 rounded-full text-white mt-4 absolute bottom-5">
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
                    <FaPaperclip className='text-purple-300 cursor-pointer' />
                    <FaSmile className='text-purple-300 cursor-pointer' />

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())
                        }
                        placeholder='type a message...'
                        className='flex-1 bg-gray-700 text-white p-3 rounded-xl resize-none'
                        rows={1}
                    />

                    {message.trim() ? (
                        <button onClick={sendMessage} className='bg-purple-600 p-3 rounded-full text-white hover:bg-purple-700 transition-colors'>
                            <FaPaperPlane />
                        </button>
                    ) : (
                        <FaMicrophone className='text-purple-300 cursor-pointer' />
                    )}
                </div>
            </div>
        </div>
    );
}