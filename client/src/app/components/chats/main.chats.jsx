'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaEllipsisV, FaUserFriends } from 'react-icons/fa'; // Added FaUserFriends for the empty state
import { useRouter } from 'next/navigation';
import { useFriendsStore } from '../../../store/useFriendsStore';
import { useUserStore } from '../../../store/useUserStore';
import api from '@/utils/api';

export default function MainChats() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const { friends, setFriends } = useFriendsStore();
    const { user } = useUserStore();

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            const res = await api.get('/api/requests/friends');
            const data = await res.data;
            const friends = data.friends || [];

            const list = friends.map(c => {
                const isSender = c.sender._id === user._id;
                const friend = isSender ? c.receiver : c.sender;

                return {
                    id: friend._id,
                    name: friend.name,
                    email: friend.email,
                    avatar: friend.avatar?.url || '',
                    lastMessage: 'say hi to your new friend!',
                    timestamp: '',
                    isOnline: false,
                    unread: 0
                };
            });

            setFriends(list);
        } catch (err) {
            console.log(err);
        }
    };

    const filteredChats = friends.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openChat = (chat) => {
        router.push(`/chatting?id=${chat.id}`);
    };

    return (
        <div className='flex'>
            <div className='w-full md:w-96 backdrop-blur-lg border-r border-purple-500/30 flex flex-col'>

                {/* search bar */}
                <div className='p-4 border-b border-purple-500/30'>
                    <div className='flex items-center justify-between'>
                        <div className='flex-1 max-w-md mr-4'>
                            <div className='relative'>
                                <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-purple-400' />
                                <input
                                    type='text'
                                    placeholder='search conversations'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className='w-full bg-gray-700/80 border border-purple-500/30 rounded-xl pl-10 pr-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300'
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* chats list / empty state */}
                <div className='flex-1 overflow-y-auto'>
                    {filteredChats.length === 0 ? (
                        <div className='p-4 text-center text-purple-400'>
                            {friends.length === 0 ? (
                                <>
                                    <FaUserFriends className='mx-auto text-4xl mb-3' />
                                    <p className='text-lg font-semibold'>No friends found</p>
                                    <p className='text-sm text-purple-300'>Add new friends to start chatting!</p>
                                </>
                            ) : (
                                <>
                                    <FaSearch className='mx-auto text-4xl mb-3' />
                                    <p className='text-lg font-semibold'>No results for "{searchQuery}"</p>
                                    <p className='text-sm text-purple-300'>Try a different search term.</p>
                                </>
                            )}
                        </div>
                    ) : (
                        filteredChats.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => openChat(chat)}
                                className='flex bg-gray-800/70 items-center space-x-3 p-4 border-b border-purple-500/10 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group animate-[fadeIn_0.3s_ease]'
                            >
                                <div className='relative'>
                                    <div className='w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-red-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300'>
                                        {chat.avatar ? (
                                            <img src={chat.avatar} className='w-full h-full object-cover' />
                                        ) : (
                                            <span className='text-white font-semibold'>
                                                {chat.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        )}
                                    </div>
                                    {chat.isOnline && (
                                        <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800'></div>
                                    )}
                                </div>

                                <div className='flex-1 min-w-0'>
                                    <div className='flex items-center justify-between'>
                                        <h3 className='text-white font-semibold truncate'>{chat.name}</h3>
                                        <span className='text-purple-300 text-xs whitespace-nowrap'>
                                            {chat.timestamp}
                                        </span>
                                    </div>

                                    <div className='flex items-center justify-between'>
                                        <p className='text-purple-300 text-sm truncate'>
                                            {chat.lastMessage}
                                        </p>
                                        {chat.unread > 0 && (
                                            <span className='bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2'>
                                                {chat.unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* empty state for main content area */}
            <div className='hidden md:flex flex-1 items-center justify-center'>
                <div className='text-center space-y-4'>
                    <div className='w-24 h-24 bg-gradient-to-br from-purple-600 to-red-600 rounded-2xl flex items-center justify-center mx-auto'>
                        <FaEllipsisV className='text-white text-3xl' />
                    </div>
                    <h2 className='text-2xl font-bold text-white'>your messages</h2>
                    <p className='text-purple-300 max-w-md'>
                        send private messages to friends and share your music moments
                    </p>
                </div>
            </div>
        </div>
    );
}