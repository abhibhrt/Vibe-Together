'use client';

import { useState, useEffect } from 'react';
import { FaArrowLeft, FaEllipsisV } from 'react-icons/fa';
import Link from 'next/link';
import io from 'socket.io-client';
import api from '@/utils/api';
import { useUserStore } from '@/store/useUserStore';

// Import components
import useWebRTC from '@/app/hooks/useWebRTC.js';
import CallInterface from './coms/call.interface.jsx';
import CallButtons from './coms/call.buttons.jsx';
import MessageList from './coms/message.list.jsx';
import MessageInput from './coms/message.input.jsx';

let socket = null;

export default function SelectedChats({ friend }) {
    const { user } = useUserStore();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [roomId, setRoomId] = useState(null);

    if (!friend) {
        return (
            <div className='flex items-center justify-center min-h-screen text-white text-xl'>
                No chat selected
            </div>
        );
    }

    // Initialize socket and load messages
    useEffect(() => {
        if (!friend.id) return;

        const initChat = async () => {
            try {
                // Get or create chat room
                const roomRes = await api.post(`/api/friends/chat/${friend.id}`);
                const roomData = roomRes.data;
                setRoomId(roomData.roomId);

                // Load existing messages
                const msgRes = await api.get(`/api/friends/chat/${friend.id}`);
                const oldMsgs = msgRes.data || [];

                const normalized = oldMsgs.map(msg => ({
                    ...msg,
                    senderId: String(msg.sender?._id || msg.sender)
                }));

                setMessages(normalized);

                // Initialize socket connection
                socket = io(process.env.NEXT_PUBLIC_API_URL, {
                    withCredentials: true,
                    transports: ['websocket', 'polling']
                });

                // Join the room
                socket.emit('joinRoom', roomData.roomId);

                // Listen for new messages
                socket.on("serverMessage", (msg) => {
                    const fixed = {
                        ...msg,
                        senderId: String(msg.sender?._id || msg.sender)
                    };
                    setMessages(prev => [...prev, fixed]);
                });

                console.log('Chat initialized successfully');

            } catch (error) {
                console.error('Error initializing chat:', error);
            }
        };

        initChat();

        // Cleanup
        return () => {
            if (socket) {
                socket.disconnect();
                socket = null;
            }
        };
    }, [friend.id]);

    // Initialize WebRTC hook
    const webrtc = useWebRTC(socket, roomId, user, friend);

    // Send message function
    const sendMessage = async () => {
        if (!message.trim() || !roomId || !socket) {
            console.log('Cannot send message:', { message: message.trim(), roomId, socket: !!socket });
            return;
        }

        try {
            // Save to database
            const res = await api.post(`/api/friends/message/${roomId}`, {
                content: message
            });
            const saved = res.data;

            // Emit to socket
            socket.emit("sendMessageServer", {
                roomId,
                message: saved
            });

            // Clear input
            setMessage('');

        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        }
    };

    // Handle Enter key for message sending
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-red-900 flex flex-col relative'>
            {/* Call Interface */}
            <CallInterface
                isInCall={webrtc.isInCall}
                isCalling={webrtc.isCalling}
                isReceivingCall={webrtc.isReceivingCall}
                callerName={webrtc.callerName}
                callType={webrtc.callType}
                friend={friend}
                isMuted={webrtc.isMuted}
                isVideoOff={webrtc.isVideoOff}
                localVideoRef={webrtc.localVideoRef}
                remoteVideoRef={webrtc.remoteVideoRef}
                startCall={webrtc.startCall}
                acceptCall={webrtc.acceptCall}
                rejectCall={webrtc.rejectCall}
                endCall={webrtc.endCall}
                toggleMute={webrtc.toggleMute}
                toggleVideo={webrtc.toggleVideo}
            />

            {/* Header */}
            <div className={`bg-gray-800/70 border-b border-purple-500/30 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl transition-all ${webrtc.isInCall ? 'opacity-50' : ''}`}>
                <div className='flex items-center space-x-1'>
                    <Link
                        href='/'
                        className='text-purple-300 hover:text-white md:hidden p-2 transition-colors hover:bg-purple-500/20 rounded-full'
                    >
                        <FaArrowLeft />
                    </Link>
                    <div className='flex items-center space-x-3'>
                        <img
                            src={friend.avatar}
                            alt={friend.name}
                            className='w-12 h-12 rounded-full border-2 border-purple-500/60 shadow-lg'
                        />
                        <div>
                            <h2 className='text-white font-bold text-lg'>{friend.name}</h2>
                            <p className='text-purple-300 text-sm'>
                                {webrtc.isInCall ? '📞 in a call' :
                                    webrtc.isCalling ? '📞 calling...' : 'online'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Call Buttons */}
                    <CallButtons
                        isCalling={webrtc.isCalling}
                        isInCall={webrtc.isInCall}
                        startCall={webrtc.startCall}
                        endCall={webrtc.endCall}
                    />

                    <button
                        className='text-purple-300 hover:text-white p-2 transition-colors hover:bg-purple-500/20 rounded-full'
                        title="More options"
                    >
                        <FaEllipsisV />
                    </button>
                </div>
            </div>

            {/* Message List */}
            <div className={`transition-all ${webrtc.isInCall ? 'opacity-30 blur-sm' : ''}`}>
                <MessageList messages={messages} user={user} />
            </div>

            {/* Message Input */}
            <div className={`transition-all ${webrtc.isInCall ? 'opacity-30 blur-sm' : ''}`}>
                <MessageInput
                    message={message}
                    setMessage={setMessage}
                    sendMessage={sendMessage}
                    handleKeyDown={handleKeyDown}
                    isInCall={webrtc.isInCall}
                />
            </div>
        </div>
    );
}