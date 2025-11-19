'use client';

import { useState } from 'react';
import { FaSearch, FaEllipsisV } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { CHAT_STATIC } from './chatstatic';

export default function MainChats() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredChats = CHAT_STATIC.filter(chat => chat.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const openChat = (chat) => {
        router.push(`/chatting?id=${chat.id}`);
    };

    return (
        <div className='flex'>
            <div className='w-full md:w-96 bg-gray-800/70 backdrop-blur-lg border-r border-purple-500/30 flex flex-col'>
                <div className='p-4 border-b border-purple-500/30'>
                    <div className='relative'>
                        <FaSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400' />
                        <input
                            type='text'
                            placeholder='search conversations...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='w-full bg-gray-700/80 border border-purple-500/30 rounded-xl pl-10 pr-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300'
                        />
                    </div>
                </div>
                <div className='flex-1 overflow-y-auto'>
                    {filteredChats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => openChat(chat)}
                            className='flex items-center space-x-3 p-4 border-b border-purple-500/10 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group'
                        >
                            <div className='relative'>
                                <div className='w-12 h-12 bg-gradient-to-br from-purple-600 to-red-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300'>
                                    <span className='text-white font-semibold'>{chat.name.split(' ').map(n => n[0]).join('')}</span>
                                </div>
                                {chat.isOnline && <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800'></div>}
                            </div>
                            <div className='flex-1 min-w-0'>
                                <div className='flex items-center justify-between'>
                                    <h3 className='text-white font-semibold truncate'>{chat.name}</h3>
                                    <span className='text-purple-300 text-xs whitespace-nowrap'>{chat.timestamp}</span>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <p className='text-purple-300 text-sm truncate'>{chat.lastMessage}</p>
                                    {chat.unread > 0 && (
                                        <span className='bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2'>{chat.unread}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className='hidden md:flex flex-1 items-center justify-center'>
                <div className='text-center space-y-4'>
                    <div className='w-24 h-24 bg-gradient-to-br from-purple-600 to-red-600 rounded-2xl flex items-center justify-center mx-auto'>
                        <FaEllipsisV className='text-white text-3xl' />
                    </div>
                    <h2 className='text-2xl font-bold text-white'>your messages</h2>
                    <p className='text-purple-300 max-w-md'>send private messages to friends and share your music moments</p>
                </div>
            </div>
        </div>
    );
}