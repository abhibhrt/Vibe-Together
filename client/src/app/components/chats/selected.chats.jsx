'use client';

import { useState, useEffect } from 'react';
import { FaArrowLeft, FaEllipsisV } from 'react-icons/fa';
import Link from 'next/link';
import io from 'socket.io-client';
import api from '@/utils/api';
import { useUserStore } from '@/store/useUserStore';

// Import components
import CallManager from './coms/call.manager.jsx';
import MessageList from './coms/message.list.jsx';
import MessageInput from './coms/message.input.jsx';

let socket = null;

export default function SelectedChats({ friend }) {
    const { user } = useUserStore();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [roomId, setRoomId] = useState(null);
    const [isInCall, setIsInCall] = useState(false);

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
                    transports: ['websocket', 'polling'],
                    upgrade: true
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

                // Handle connection errors
                socket.on('connect_error', (error) => {
                    console.error('Socket connection error:', error);
                });

                socket.on('disconnect', (reason) => {
                    console.log('Socket disconnected:', reason);
                });

            } catch (error) {
                console.error('Error initializing chat:', error);
            }
        };

        initChat();

        return () => {
            if (socket) {
                socket.disconnect();
                socket = null;
            }
        };
    }, [friend.id]);

    // Initialize CallManager
    const callManager = CallManager({
        socket,
        roomId,
        user,
        friend,
        onCallStart: () => setIsInCall(true),
        onCallEnd: () => setIsInCall(false)
    });

    // Send message function
    const sendMessage = async () => {
        if (!message.trim() || !roomId || !socket) return;

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

    return (
        <div className='min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-red-900 flex flex-col relative'>
            {/* Render Call Interface */}
            <callManager.CallInterface />

            {/* Header */}
            <div className='bg-gray-800/70 border-b border-purple-500/30 p-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl'>
                <div className='flex items-center space-x-4'>
                    <Link href='/' className='text-purple-300 hover:text-white md:hidden p-2 transition-colors'>
                        <FaArrowLeft />
                    </Link>
                    <div className='flex items-center space-x-3'>
                        <img 
                            src={friend.avatar} 
                            alt={friend.name}
                            className='w-10 h-10 rounded-full border-2 border-purple-500/50'
                        />
                        <div>
                            <h2 className='text-white font-semibold'>{friend.name}</h2>
                            <p className='text-purple-300 text-sm'>
                                {isInCall ? 'In a call' : 'Online'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Call Buttons */}
                    <callManager.CallButtons />
                </div>
            </div>

            {/* Message List */}
            <MessageList messages={messages} user={user} />

            {/* Message Input */}
            <MessageInput 
                message={message}
                setMessage={setMessage}
                sendMessage={sendMessage}
                isInCall={isInCall}
            />
        </div>
    );
}