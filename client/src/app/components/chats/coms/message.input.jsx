'use client';

import { FaPaperclip, FaMicrophone, FaSmile, FaPaperPlane } from 'react-icons/fa';

export default function MessageInput({
    message,
    setMessage,
    sendMessage,
    handleKeyDown,
    isInCall = false
}) {
    return (
        <div className={`bg-gray-800/70 border-t border-purple-500/30 p-4 transition-all ${isInCall ? 'opacity-50' : ''}`}>
            <div className='flex items-center space-x-3'>
                <button
                    className='text-purple-300 hover:text-white p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    title="Attach file"
                    disabled={isInCall}
                >
                    <FaPaperclip />
                </button>
                <button
                    className='text-purple-300 hover:text-white p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    title="Emoji"
                    disabled={isInCall}
                >
                    <FaSmile />
                </button>
                <div className='flex-1'>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isInCall ? 'In a call...' : 'Type a message...'}
                        rows='1'
                        className='w-full bg-gray-700/80 border border-purple-500/30 rounded-2xl px-4 py-3 text-white resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
                        disabled={isInCall}
                    />
                </div>
                {message.trim() ? (
                    <button
                        onClick={sendMessage}
                        disabled={isInCall}
                        className='bg-gradient-to-r from-purple-600 to-red-600 text-white p-3 rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg'
                        title="Send message"
                    >
                        <FaPaperPlane />
                    </button>
                ) : (
                    <button
                        className='text-purple-300 hover:text-white p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        title="Voice message"
                        disabled={isInCall}
                    >
                        <FaMicrophone />
                    </button>
                )}
            </div>
        </div>
    );
}