'use client';

import { useState, useEffect, useRef } from 'react';
import { 
    FaPaperclip, FaMicrophone, FaSmile, FaPaperPlane, 
    FaArrowLeft, FaEllipsisV, FaCheck, FaVideo, 
    FaPhone, FaVideoSlash, FaMicrophoneSlash,
    FaTimes, FaPhoneSlash
} from 'react-icons/fa';
import Link from 'next/link';
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

    const chatId = friend.id;
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [roomId, setRoomId] = useState(null);
    const [isCalling, setIsCalling] = useState(false);
    const [isReceivingCall, setIsReceivingCall] = useState(false);
    const [callFrom, setCallFrom] = useState('');
    const [callerName, setCallerName] = useState('');
    const [callType, setCallType] = useState('video'); // 'video' or 'voice'
    const [callSignal, setCallSignal] = useState(null);
    const [isInCall, setIsInCall] = useState(false);
    const [callRoomId, setCallRoomId] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    // Refs for WebRTC
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const localStream = useRef(null);
    const messagesEndRef = useRef(null);

    const servers = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
        ]
    };

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize chat and socket
    useEffect(() => {
        if (!chatId) return;

        const initChat = async () => {
            const roomRes = await api.post(`/api/friends/chat/${chatId}`);
            const roomData = roomRes.data;
            setRoomId(roomData.roomId);

            const msgRes = await api.get(`/api/friends/chat/${chatId}`);
            const oldMsgs = msgRes.data || [];

            const normalized = oldMsgs.map(msg => ({
                ...msg,
                senderId: String(msg.sender?._id || msg.sender)
            }));

            setMessages(normalized);

            socket = io(process.env.NEXT_PUBLIC_API_URL, {
                withCredentials: true,
            });

            socket.emit('joinRoom', roomData.roomId);

            socket.off("serverMessage");
            socket.on("serverMessage", (msg) => {
                const fixed = {
                    ...msg,
                    senderId: String(msg.sender?._id || msg.sender)
                };
                setMessages(prev => [...prev, fixed]);
            });

            // Call signaling handlers
            socket.on('incomingCall', ({ signal, from, name, type, roomId: incomingRoomId }) => {
                setCallSignal(signal);
                setCallFrom(from);
                setCallerName(name);
                setCallType(type);
                setCallRoomId(incomingRoomId);
                setIsReceivingCall(true);
            });

            socket.on('callAccepted', (signal) => {
                peerConnection.current.setRemoteDescription(
                    new RTCSessionDescription(signal)
                );
                setIsInCall(true);
                setIsCalling(false);
            });

            socket.on('callEnded', () => {
                endCall();
            });

            socket.on('callRejected', () => {
                alert('Call rejected');
                setIsCalling(false);
            });

            socket.on('callerICE', (candidate) => {
                if (peerConnection.current) {
                    peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
            });

            socket.on('calleeICE', (candidate) => {
                if (peerConnection.current) {
                    peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
            });
        };

        initChat();

        return () => {
            socket?.disconnect();
            endCall();
        };
    }, [chatId]);

    const isMe = (msg) => msg.senderId === String(user?.id);

    // Send message
    const sendMessage = async () => {
        if (!message.trim() || !roomId) return;

        const res = await api.post(`/api/friends/message/${roomId}`, {
            content: message
        });
        const saved = res.data;

        socket.emit("sendMessageServer", {
            roomId,
            message: saved
        });

        setMessage('');
    };

    // Initialize WebRTC
    const createPeerConnection = async () => {
        peerConnection.current = new RTCPeerConnection(servers);

        // Add local stream to connection
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => {
                peerConnection.current.addTrack(track, localStream.current);
            });
        }

        // Handle remote stream
        peerConnection.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // ICE candidate handling
        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate && roomId) {
                if (isCalling) {
                    socket.emit('callerICE', { roomId, candidate: event.candidate });
                } else {
                    socket.emit('calleeICE', { roomId, candidate: event.candidate });
                }
            }
        };
    };

    // Start a call (caller)
    const startCall = async (type) => {
        try {
            setIsCalling(true);
            setCallType(type);

            // Get local media
            const constraints = {
                audio: true,
                video: type === 'video'
            };

            localStream.current = await navigator.mediaDevices.getUserMedia(constraints);
            
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStream.current;
            }

            // Create peer connection
            await createPeerConnection();

            // Create offer
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);

            // Send call signal
            socket.emit('callUser', {
                roomId,
                signalData: offer,
                from: user.id,
                name: user.name || 'User',
                type
            });
        } catch (error) {
            console.error('Error starting call:', error);
            setIsCalling(false);
            alert('Failed to start call. Please check your camera/microphone permissions.');
        }
    };

    // Accept call (callee)
    const acceptCall = async () => {
        try {
            setIsReceivingCall(false);
            setIsInCall(true);

            // Get local media
            const constraints = {
                audio: true,
                video: callType === 'video'
            };

            localStream.current = await navigator.mediaDevices.getUserMedia(constraints);
            
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStream.current;
            }

            // Create peer connection
            await createPeerConnection();

            // Set remote description
            await peerConnection.current.setRemoteDescription(
                new RTCSessionDescription(callSignal)
            );

            // Create answer
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);

            // Send acceptance
            socket.emit('acceptCall', {
                signal: answer,
                to: callFrom,
                roomId: callRoomId
            });
        } catch (error) {
            console.error('Error accepting call:', error);
            endCall();
        }
    };

    // Reject call
    const rejectCall = () => {
        socket.emit('rejectCall', { roomId: callRoomId });
        setIsReceivingCall(false);
        setCallSignal(null);
    };

    // End call
    const endCall = () => {
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
            localStream.current = null;
        }

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        if (isInCall || isCalling || isReceivingCall) {
            socket.emit('endCall', { roomId: callRoomId || roomId, userId: user.id });
        }

        setIsInCall(false);
        setIsCalling(false);
        setIsReceivingCall(false);
        setCallSignal(null);
        setIsMuted(false);
        setIsVideoOff(false);
    };

    // Toggle mute
    const toggleMute = () => {
        if (localStream.current) {
            const audioTracks = localStream.current.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    // Toggle video
    const toggleVideo = () => {
        if (localStream.current) {
            const videoTracks = localStream.current.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-red-900 flex flex-col relative'>

            {/* Call Modal */}
            {isReceivingCall && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md">
                    <div className="bg-gray-800/90 p-8 rounded-2xl border border-purple-500/30 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-red-600 flex items-center justify-center">
                                <FaVideo className="text-white text-3xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Incoming {callType === 'video' ? 'Video' : 'Voice'} Call
                            </h2>
                            <p className="text-purple-300 mb-6">From: {callerName}</p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={rejectCall}
                                    className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full"
                                >
                                    <FaPhoneSlash size={24} />
                                </button>
                                <button
                                    onClick={acceptCall}
                                    className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full"
                                >
                                    <FaPhone size={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Call Interface */}
            {isInCall && (
                <div className="fixed inset-0 bg-black z-40">
                    <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
                        <div className="bg-black/50 p-3 rounded-xl">
                            <p className="text-white font-semibold">
                                {callType === 'video' ? 'Video' : 'Voice'} Call with {friend.name}
                            </p>
                        </div>
                        <button
                            onClick={endCall}
                            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full"
                        >
                            <FaPhoneSlash size={20} />
                        </button>
                    </div>

                    {/* Remote Video */}
                    <div className="w-full h-full">
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Local Video (Picture-in-picture) */}
                    {callType === 'video' && (
                        <div className="absolute bottom-4 right-4 w-48 h-64">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full rounded-xl border-2 border-purple-500 object-cover"
                            />
                        </div>
                    )}

                    {/* Call Controls */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                        <button
                            onClick={toggleMute}
                            className={`p-4 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-800/70'} hover:bg-gray-700`}
                        >
                            {isMuted ? (
                                <FaMicrophoneSlash className="text-white" size={20} />
                            ) : (
                                <FaMicrophone className="text-white" size={20} />
                            )}
                        </button>
                        {callType === 'video' && (
                            <button
                                onClick={toggleVideo}
                                className={`p-4 rounded-full ${isVideoOff ? 'bg-red-600' : 'bg-gray-800/70'} hover:bg-gray-700`}
                            >
                                {isVideoOff ? (
                                    <FaVideoSlash className="text-white" size={20} />
                                ) : (
                                    <FaVideo className="text-white" size={20} />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* FIXED HEADER */}
            <div className='bg-gray-800/70 border-b border-purple-500/30 p-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl'>
                <div className='flex items-center space-x-4'>
                    <Link href='/' className='text-purple-300 hover:text-white md:hidden p-2'>
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

                <div className="flex items-center space-x-2">
                    {/* Call Buttons */}
                    {!isCalling && !isInCall && (
                        <>
                            <button
                                onClick={() => startCall('voice')}
                                className="text-green-400 hover:text-green-300 p-2 bg-gray-700/50 rounded-full hover:bg-gray-700"
                                title="Voice Call"
                            >
                                <FaPhone size={18} />
                            </button>
                            <button
                                onClick={() => startCall('video')}
                                className="text-blue-400 hover:text-blue-300 p-2 bg-gray-700/50 rounded-full hover:bg-gray-700"
                                title="Video Call"
                            >
                                <FaVideo size={18} />
                            </button>
                        </>
                    )}
                    
                    {isCalling && (
                        <div className="flex items-center space-x-2">
                            <span className="text-yellow-400 text-sm">Calling...</span>
                            <button
                                onClick={endCall}
                                className="text-red-400 hover:text-red-300 p-2 bg-gray-700/50 rounded-full hover:bg-gray-700"
                                title="Cancel Call"
                            >
                                <FaTimes size={18} />
                            </button>
                        </div>
                    )}

                    <button className='text-purple-300 hover:text-white p-2'>
                        <FaEllipsisV />
                    </button>
                </div>
            </div>

            {/* CHAT AREA */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900/50 ${isInCall ? 'opacity-30' : ''}`}>
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
            <div className={`bg-gray-800/70 border-t border-purple-500/30 p-4 ${isInCall ? 'opacity-30' : ''}`}>
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
                                e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())
                            }
                            placeholder='type a message...'
                            rows='1'
                            className='w-full bg-gray-700/80 border border-purple-500/30 rounded-2xl px-4 py-3 text-white resize-none focus:ring-2 focus:ring-purple-500'
                        />
                    </div>

                    {message.trim() ? (
                        <button
                            onClick={sendMessage}
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