'use client';

import { useState, useEffect, useRef } from 'react';
import { FaPaperclip, FaMicrophone, FaSmile, FaPaperPlane, FaArrowLeft, FaEllipsisV, FaCheck } from 'react-icons/fa';
import { CHAT_STATIC } from './chatstatic';
import Link from 'next/link';

export default function SelectedChats({ chatId }) {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState(() => CHAT_STATIC.find(c => String(c.id) === String(chatId)) || CHAT_STATIC[0]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat.messages]);

    const sendMessage = () => {
        if (!message.trim()) return;

        const newMessage = {
            id: chat.messages.length + 1,
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        setChat(prev => ({
            ...prev,
            messages: [...prev.messages, newMessage],
            lastMessage: message,
            timestamp: newMessage.time
        }));

        setMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-red-900 flex flex-col'>
            <div className='bg-gray-800/70 backdrop-blur-lg border-b border-purple-500/30 p-4 flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                    <Link href="/" className='text-purple-300 hover:text-white transition-colors duration-300 p-2 md:hidden'>
                        <FaArrowLeft />
                    </Link>
                    <div className='flex items-center space-x-3'>
                        <div className='relative'>
                            <div className='w-10 h-10 bg-gradient-to-br from-purple-600 to-red-600 rounded-full flex items-center justify-center'>
                                <span className='text-white font-semibold'>{chat.name.split(' ').map(n => n[0]).join('')}</span>
                            </div>
                        </div>
                        <div>
                            <h2 className='text-white font-semibold'>{chat.name}</h2>
                            <p className='text-purple-300 text-sm'>{chat.isOnline ? 'online' : 'last seen recently'}</p>
                        </div>
                    </div>
                </div>
                <button className='text-purple-300 hover:text-white transition-colors duration-300 p-2'><FaEllipsisV /></button>
            </div>

            <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900/50'>
                {chat.messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`max-w-xs md:max-w-md rounded-2xl p-3 transition-all duration-300 ${msg.isMe ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white rounded-br-none' : 'bg-gray-700/80 text-white rounded-bl-none border border-purple-500/20'}`}>
                            <p className='text-sm'>{msg.text}</p>
                            <div className={`flex items-center justify-end space-x-1 mt-1 ${msg.isMe ? 'text-purple-200' : 'text-gray-400'}`}>
                                <span className='text-xs'>{msg.time}</span>
                                {msg.isMe && <FaCheck className='text-green-500 text-xs' />}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className='bg-gray-800/70 backdrop-blur-lg border-t border-purple-500/30 p-4'>
                <div className='flex items-center space-x-3'>
                    <button className='text-purple-300 hover:text-white transition-colors duration-300 p-2'><FaPaperclip /></button>
                    <button className='text-purple-300 hover:text-white transition-colors duration-300 p-2'><FaSmile /></button>
                    <div className='flex-1'>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder='type a message...'
                            rows='1'
                            className='w-full bg-gray-700/80 border border-purple-500/30 rounded-2xl px-4 py-3 text-white placeholder-purple-300 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300'
                        />
                    </div>
                    {message.trim() ? (
                        <button onClick={sendMessage} className='bg-gradient-to-r from-purple-600 to-red-600 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50'>
                            <FaPaperPlane className='text-sm' />
                        </button>
                    ) : (
                        <button className='text-purple-300 hover:text-white transition-colors duration-300 p-3'><FaMicrophone /></button>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
            `}</style>
        </div>
    );
}