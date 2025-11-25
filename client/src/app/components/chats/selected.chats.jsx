'use client';

import { useState, useEffect, useRef } from 'react';
import { FaPaperclip, FaMicrophone, FaSmile, FaPaperPlane, FaArrowLeft, FaEllipsisV, FaCheck } from 'react-icons/fa';
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

    const chatId = friend.id; // friend _id from chat list

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [roomId, setRoomId] = useState(null);
    const messagesEndRef = useRef(null);

    // Auto scroll bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!chatId) return;

        const initChat = async () => {

            // 1) Create/get room
            const roomRes = await api.post(`/api/friends/chat/${chatId}`);
            const roomData = roomRes.data;
            setRoomId(roomData.roomId);

            // 2) Load old messages
            const msgRes = await api.get(`/api/friends/chat/${chatId}`);
            const oldMsgs = msgRes.data || [];

            const normalized = oldMsgs.map(msg => ({
                ...msg,
                senderId: String(msg.sender?._id || msg.sender)
            }));

            setMessages(normalized);

            // 3) Connect socket
            socket = io(process.env.NEXT_PUBLIC_API_URL, {
                withCredentials: true,
            });

            // 4) Join the chat room
            socket.emit('joinRoom', roomData.roomId);

            // 5) Real-time message receive (NO duplicate listeners)
            socket.off("serverMessage");

            socket.on("serverMessage", (msg) => {
                const fixed = {
                    ...msg,
                    senderId: String(msg.sender?._id || msg.sender)
                };
                setMessages(prev => [...prev, fixed]);
            });
        };

        initChat();
        return () => socket?.disconnect();
    }, [chatId]);

    // Determine if logged user is sender
    const isMe = (msg) => msg.senderId === String(user?.id);

    // Send message
    const sendMessage = async () => {
        if (!message.trim() || !roomId) return;

        // No local push; socket will deliver clean message
        await api.post(`/api/friends/message/${roomId}`, {
            content: message
        });

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
                        <img src={friend.avatar} className='w-10 h-10 rounded-full' />

                        <div>
                            <h2 className='text-white font-semibold'>{friend.name}</h2>
                            <p className='text-purple-300 text-sm'>online</p>
                        </div>
                    </div>
                </div>

                <button className='text-purple-300 hover:text-white p-2'>
                    <FaEllipsisV />
                </button>
            </div>

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

            {/* MESSAGE INPUT */}
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
