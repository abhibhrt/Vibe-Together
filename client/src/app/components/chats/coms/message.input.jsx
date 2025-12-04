'use client';

import { useState } from 'react';
import { FaPaperclip, FaMicrophone, FaSmile, FaPaperPlane } from 'react-icons/fa';

export default function MessageInput({ 
    message, 
    setMessage, 
    sendMessage, 
    isInCall = false 
}) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className={`bg-gray-800/70 border-t border-purple-500/30 p-4 ${isInCall ? 'opacity-30' : ''}`}>
            <div className='flex items-center space-x-3'>
                <button 
                    className='text-purple-300 hover:text-white p-2 transition-colors'
                    title="Attach file"
                >
                    <FaPaperclip />
                </button>
                <button 
                    className='text-purple-300 hover:text-white p-2 transition-colors'
                    title="Emoji"
                >
                    <FaSmile />
                </button>
                <div className='flex-1'>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder='Type a message...'
                        rows='1'
                        className='w-full bg-gray-700/80 border border-purple-500/30 rounded-2xl px-4 py-3 text-white resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-gray-400'
                        disabled={isInCall}
                    />
                </div>
                {message.trim() ? (
                    <button
                        onClick={sendMessage}
                        disabled={isInCall}
                        className='bg-gradient-to-r from-purple-600 to-red-600 text-white p-3 rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                        title="Send message"
                    >
                        <FaPaperPlane />
                    </button>
                ) : (
                    <button 
                        className='text-purple-300 hover:text-white p-3 transition-colors'
                        title="Voice message"
                    >
                        <FaMicrophone />
                    </button>
                )}
            </div>
        </div>
    );
}