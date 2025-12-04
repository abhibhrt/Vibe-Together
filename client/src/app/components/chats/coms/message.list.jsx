'use client';

import { useRef, useEffect } from 'react';
import { FaCheck } from 'react-icons/fa';

export default function MessageList({ messages, user }) {
    const messagesEndRef = useRef(null);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const isMe = (msg) => msg.senderId === String(user?.id);

    return (
        <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900/50'>
            {messages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                    <p>No messages yet. Start the conversation!</p>
                </div>
            ) : (
                messages.map((msg, index) => {
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
                })
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}