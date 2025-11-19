'use client';

import api from '@/utils/api';
import { useEffect, useState } from 'react';
import { FaUserPlus, FaCheck, FaSearch } from 'react-icons/fa';

export default function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [friends, setFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const addFriend = (userId) => {
        setFriends(prev => [...prev, userId]);
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/api/user/users-all');
                setUsers(res.data.users || []);
            } catch (error) {
                console.log('fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className='max-w-full mx-auto'>
            {/* search bar */}
            <div className='flex-1 max-w-md p-4 border-b border-purple-500/30'>
                <div className='relative'>
                    <FaSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400' />
                    <input
                        type='text'
                        placeholder='search by name...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='w-full bg-gray-700/80 border border-purple-500/30 rounded-xl pl-10 pr-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300'
                    />
                </div>
            </div>

            {/* header */}
            <div className='p-6'>
                <h1 className='text-2xl font-bold text-white mb-2'>Welcome to Your Music</h1>
                <p className='text-purple-200'>Discover and enjoy your favorite tracks</p>
            </div>

            {/* loading */}
            {loading && (
                <div className='flex justify-center py-6'>
                    <div className='w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin' />
                </div>
            )}

            {/* user list */}
            {!loading && (
                <div className='max-h-[calc(100vh-200px)] overflow-y-auto'>
                    {filteredUsers.map((user) => (
                        <div
                            key={user._id}
                            className='bg-gray-800/70 backdrop-blur-lg p-4 border border-purple-500/30 flex items-center justify-between animate-fade-in'
                        >
                            <div className='flex items-center space-x-3'>
                                {/* avatar */}
                                <div className='w-12 h-12 bg-gradient-to-br from-purple-600 to-red-600 rounded-full flex items-center justify-center overflow-hidden'>
                                    {user.avatar?.url ? (
                                        <img
                                            src={user.avatar.url}
                                            alt={user.name}
                                            className='w-full h-full object-cover'
                                        />
                                    ) : (
                                        <span className='text-white font-semibold'>
                                            {user.name[0].toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* name */}
                                <span className='text-white font-medium'>{user.name}</span>
                            </div>

                            {/* add friend button */}
                            <button
                                onClick={() => addFriend(user._id)}
                                disabled={friends.includes(user._id)}
                                className={`p-2 rounded-lg transition-all duration-300 ${friends.includes(user._id)
                                    ? 'bg-green-500 text-white'
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                                    }`}
                            >
                                {friends.includes(user._id) ? <FaCheck /> : <FaUserPlus />}
                            </button>
                        </div>
                    ))}

                    {/* no results */}
                    {filteredUsers.length === 0 && (
                        <div className='text-center text-purple-300 py-8'>
                            no users found matching
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}