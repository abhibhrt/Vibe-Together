'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaPaperclip, FaMicrophone, FaSmile, FaPaperPlane, FaArrowLeft, FaEllipsisV, FaCheck, FaVideo, FaPhone, FaVideoSlash, FaPhoneSlash } from 'react-icons/fa';
import Link from 'next/link';
import io from 'socket.io-client';
import api from '@/utils/api';
import { useUserStore } from '@/store/useUserStore';

// Initialize the socket variable globally or outside the component for persistence
let socket = null;
const peerConnectionConfig = {
    'iceServers': [
        {'urls': 'stun:stun.l.google.com:19302'}, // Google's public STUN server
    ]
};

export default function SelectedChats({ friend }) {
    const { user } = useUserStore();

    if (!friend) {
        return (
            <div className='flex items-center justify-center min-h-screen text-white text-xl'>
                no chat selected
            </div>
        );
    }

    const chatId = friend.id;
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [roomId, setRoomId] = useState(null);
    const messagesEndRef = useRef(null);

    // --- WebRTC State & Refs ---
    const [isCalling, setIsCalling] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const [callType, setCallType] = useState(null); // 'video' or 'audio'
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);


    // Auto scroll for messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Cleanup function for disconnecting WebRTC and Socket
    const cleanup = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        socket?.off("webrtc-offer");
        socket?.off("webrtc-answer");
        socket?.off("webrtc-ice-candidate");
        socket?.off("webrtc-call-end");
        setIsCalling(false);
        setIsCallActive(false);
        setCallType(null);
    }, []);

    // --- WebRTC Core Functions ---

    // 1. Get Local Media Stream
    const getLocalStream = useCallback(async (type) => {
        try {
            const constraints = {
                video: type === 'video',
                audio: true,
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (error) {
            console.error('Error getting user media:', error);
            alert(`Could not access your ${type === 'video' ? 'camera and microphone' : 'microphone'}. Please check permissions.`);
            return null;
        }
    }, []);

    // 2. Set up RTCPeerConnection and Event Listeners
    const setupPeerConnection = useCallback((stream) => {
        cleanup(); // Ensure any previous connection is closed
        
        const pc = new RTCPeerConnection(peerConnectionConfig);

        // Add local tracks to the connection
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // Event for when the remote user's media stream arrives
        pc.ontrack = (event) => {
            if (remoteVideoRef.current && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
            setIsCallActive(true);
            setIsCalling(false); // Call is active, so not just 'calling' anymore
        };

        // Event for collecting ICE candidates (network information)
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("webrtc-ice-candidate", {
                    roomId,
                    candidate: event.candidate,
                });
            }
        };

        // Event for connection state changes (useful for debugging)
        pc.oniceconnectionstatechange = (event) => {
            console.log('ICE connection state:', pc.iceConnectionState);
            if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
                console.log('Call ended or failed.');
                cleanup();
            }
        };

        peerConnectionRef.current = pc;
        return pc;
    }, [roomId, cleanup]);

    // 3. Initiate a Call (Caller)
    const initiateCall = useCallback(async (type) => {
        if (!roomId) return;
        setCallType(type);
        setIsCalling(true);

        const stream = await getLocalStream(type);
        if (!stream) return setIsCalling(false);

        const pc = setupPeerConnection(stream);
        
        // Create Offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Send Offer via Socket.IO Signaling
        socket.emit("webrtc-offer", {
            roomId,
            offer: pc.localDescription,
        });
        
    }, [roomId, getLocalStream, setupPeerConnection]);
    
    // 4. Handle Received Offer (Callee)
    const handleOffer = useCallback(async (offer) => {
        // Determine call type from the offer (if video track exists)
        const type = offer.sdp.includes('m=video') ? 'video' : 'audio';
        setCallType(type);
        
        const stream = await getLocalStream(type);
        if (!stream) return; // Cannot proceed without stream

        const pc = setupPeerConnection(stream);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Create Answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Send Answer via Socket.IO Signaling
        socket.emit("webrtc-answer", {
            roomId,
            answer: pc.localDescription,
        });

    }, [roomId, getLocalStream, setupPeerConnection]);

    // 5. Handle Received Answer (Caller)
    const handleAnswer = useCallback(async (answer) => {
        if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            setIsCallActive(true);
            setIsCalling(false);
        }
    }, []);

    // 6. Handle Received ICE Candidate
    const handleIceCandidate = useCallback(async (candidate) => {
        if (peerConnectionRef.current) {
            try {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.error('Error adding received ICE candidate', e);
            }
        }
    }, []);
    
    // 7. End Call
    const endCall = useCallback(() => {
        if (socket && roomId) {
            socket.emit("webrtc-call-end", { roomId });
        }
        cleanup();
    }, [roomId, cleanup]);
    
    // 8. Handle Remote Call End
    const handleRemoteCallEnd = useCallback(() => {
        console.log("Remote user ended the call.");
        cleanup();
        alert('Call ended by the other user.');
    }, [cleanup]);

    // --- Main Initialisation Effect (Chat & Socket) ---
    useEffect(() => {
        if (!chatId) return;

        const initChat = async () => {
            // Get or create room (chatId is used as friendId)
            const roomRes = await api.post(`/api/friends/chat/${chatId}`);
            const roomData = roomRes.data;
            setRoomId(roomData.roomId);

            // Load old messages
            const msgRes = await api.get(`/api/friends/chat/${chatId}`);
            const oldMsgs = msgRes.data || [];

            const normalized = oldMsgs.map(msg => ({
                ...msg,
                senderId: String(msg.sender?._id || msg.sender)
            }));
            setMessages(normalized);

            // Connect socket
            socket = io(process.env.NEXT_PUBLIC_API_URL, {
                withCredentials: true,
            });

            // Join room
            socket.emit('joinRoom', roomData.roomId);

            // --- Set up message listeners ---
            socket.off("serverMessage");
            socket.on("serverMessage", (msg) => {
                const fixed = {
                    ...msg,
                    senderId: String(msg.sender?._id || msg.sender)
                };
                setMessages(prev => [...prev, fixed]);
            });

            // --- Set up WebRTC signaling listeners (NEW) ---
            socket.off("webrtc-offer");
            socket.on("webrtc-offer", handleOffer);

            socket.off("webrtc-answer");
            socket.on("webrtc-answer", handleAnswer);

            socket.off("webrtc-ice-candidate");
            socket.on("webrtc-ice-candidate", handleIceCandidate);
            
            socket.off("webrtc-call-end");
            socket.on("webrtc-call-end", handleRemoteCallEnd);
        };

        initChat();

        // Cleanup on unmount/chatId change
        return () => {
            endCall(); // Clean up WebRTC connection
            socket?.disconnect();
        };
    }, [chatId, handleOffer, handleAnswer, handleIceCandidate, handleRemoteCallEnd, endCall]);

    const isMe = (msg) => msg.senderId === String(user?.id);

    // SEND MESSAGE (NEW WORKING FLOW)
    const sendChatMessage = async () => {
        if (!message.trim() || !roomId) return;

        // Step 1: save to DB
        const res = await api.post(`/api/friends/message/${roomId}`, {
            content: message
        });
        const saved = res.data;

        // Step 2: tell server to broadcast to room
        socket.emit("sendMessageServer", {
            roomId,
            message: saved
        });

        // DO NOT PUSH IN UI LOCALLY → socket will handle it
        setMessage('');
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-red-900 flex flex-col'>

            {/* FIXED HEADER */}
            <div className='bg-gray-800/70 border-b border-purple-500/30 p-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl'>
                <div className='flex items-center space-x-4'>
                    <Link href='/' className='text-purple-300 hover:text-white md:hidden p-2'>
                        <FaArrowLeft />
                    </Link>

                    <div className='flex items-center space-x-3'>
                        <img src={friend.avatar} className='w-10 h-10 rounded-full' alt={`${friend.name}'s avatar`} />
                        <div>
                            <h2 className='text-white font-semibold'>{friend.name}</h2>
                            <p className='text-purple-300 text-sm'>{isCallActive ? 'In Call' : 'online'}</p>
                        </div>
                    </div>
                </div>
                
                {/* CALL BUTTONS (NEW) */}
                <div className='flex items-center space-x-2'>
                    {isCallActive ? (
                        <button
                            onClick={endCall}
                            className='bg-red-600 text-white p-3 rounded-full hover:scale-105 transition-transform'
                            title='End Call'
                        >
                            <FaPhoneSlash />
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => initiateCall('video')}
                                disabled={isCalling}
                                className='text-purple-300 hover:text-white p-2 disabled:opacity-50'
                                title='Start Video Call'
                            >
                                <FaVideo />
                            </button>
                            <button
                                onClick={() => initiateCall('audio')}
                                disabled={isCalling}
                                className='text-purple-300 hover:text-white p-2 disabled:opacity-50'
                                title='Start Voice Call'
                            >
                                <FaPhone />
                            </button>
                        </>
                    )}
                    <button className='text-purple-300 hover:text-white p-2'>
                        <FaEllipsisV />
                    </button>
                </div>
            </div>

            {/* CALL STATUS/VIDEO AREA (NEW) */}
            {(isCalling || isCallActive) && (
                <div className='relative w-full h-64 bg-black/80 flex items-center justify-center border-b border-purple-500/30'>
                    {isCalling && <p className='text-white text-xl animate-pulse'>Calling...</p>}
                    
                    {isCallActive && (
                        <>
                            {/* Remote Video Stream */}
                            <video 
                                ref={remoteVideoRef} 
                                autoPlay 
                                playsInline 
                                className={`w-full h-full object-cover ${callType === 'audio' ? 'hidden' : ''}`}
                            />
                            {/* Local Video Overlay (Mini view) */}
                            <video 
                                ref={localVideoRef} 
                                autoPlay 
                                muted 
                                playsInline 
                                className={`absolute bottom-4 right-4 w-24 h-24 object-cover rounded-lg border-2 border-purple-500 shadow-xl ${callType === 'audio' ? 'hidden' : ''}`}
                            />
                            {/* Audio-only indicator */}
                            {callType === 'audio' && (
                                <div className='flex flex-col items-center text-white'>
                                    <FaPhone className='text-5xl text-purple-400 mb-4 animate-pulse' />
                                    <p className='text-xl'>Voice Call with {friend.name}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}


            {/* CHAT AREA */}
            <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900/50'>
                {messages.map((msg, index) => {
                    const mine = isMe(msg);

                    return (
                        <div key={index} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-xs md:max-w-md rounded-2xl p-3
                                    ${mine
                                        ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white rounded-br-none'
                                        : 'bg-gray-700/80 text-white rounded-bl-none border border-purple-500/20'}
                                `}
                            >
                                <p className='text-sm'>{msg.content}</p>

                                <div className='flex items-center justify-end space-x-1 mt-1 text-xs'>
                                    <span>
                                        {new Date(msg.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>

                                    {mine && <FaCheck className='text-green-500 text-xs' />}
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
                    <button className='text-purple-300 hover:text-white p-2'>
                        <FaPaperclip />
                    </button>

                    <button className='text-purple-300 hover:text-white p-2'>
                        <FaSmile />
                    </button>

                    <div className='flex-1'>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendChatMessage())
                            }
                            placeholder='type a message...'
                            rows='1'
                            className='w-full bg-gray-700/80 border border-purple-500/30 rounded-2xl px-4 py-3 text-white resize-none focus:ring-2 focus:ring-purple-500'
                        />
                    </div>

                    {message.trim() ? (
                        <button
                            onClick={sendChatMessage}
                            className='bg-gradient-to-r from-purple-600 to-red-600 text-white p-3 rounded-full hover:scale-105'
                        >
                            <FaPaperPlane />
                        </button>
                    ) : (
                        <button className='text-purple-300 hover:text-white p-3'>
                            <FaMicrophone />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}