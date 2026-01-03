'use client';

import api from '@/utils/api';
import { useEffect, useState } from 'react';
import { FiUserPlus, FiCheck, FiSearch, FiAlertCircle, FiActivity } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function PeerDirectory({ currUser }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [friends, setFriends] = useState([]);
    const [sending, setSending] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/api/users/getall');
                setUsers(res.data.users || []);
            } catch (error) {
                console.error('[DIRECTORY_ERROR]: Data fetch failed', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const addFriend = async (userId) => {
        setSending(prev => ({ ...prev, [userId]: 'sending' }));

        try {
            await api.post('/api/requests/create', { receiver: userId });
            setFriends(prev => [...prev, userId]);
        } catch (error) {
            console.error('[LINK_ERROR]: Handshake failed', error);
            setSending(prev => ({ ...prev, [userId]: 'error' }));
            setTimeout(() => {
                setSending(prev => ({ ...prev, [userId]: false }));
            }, 2000);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className='max-w-xl mx-auto space-y-4'>
            {/* NODE SEARCH HEADER */}
            <div className='bg-[#020617] border border-slate-800 p-4 relative overflow-hidden'>
                <div className='flex items-center justify-between mb-4 px-1'>
                    <span className='text-[8px] font-black tracking-[0.4em] text-blue-500 uppercase flex items-center gap-2'>
                        <FiActivity className="animate-pulse" /> Node_Discovery
                    </span>
                    <span className='text-[7px] font-mono text-slate-600 uppercase'>
                        Filter: {searchQuery || 'NULL'}
                    </span>
                </div>

                <div className='relative'>
                    <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs' />
                    <input
                        type='text'
                        placeholder='QUERY_BY_NAME...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='w-full bg-slate-950 border border-slate-800 p-3 pl-10 text-[10px] font-bold tracking-widest text-white uppercase placeholder-slate-700 focus:border-blue-500 outline-none transition-all'
                    />
                    <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-blue-500/50" />
                    <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-blue-500/50" />
                </div>
            </div>

            {/* DIRECTORY LIST */}
            <div className='bg-[#020617]/50 border border-slate-800 min-h-[400px]'>
                {loading ? (
                    <div className='flex flex-col items-center justify-center py-20 gap-4'>
                        <div className='w-6 h-6 border border-blue-500 border-t-transparent animate-spin' />
                        <span className='text-[8px] font-black tracking-widest text-slate-600 uppercase'>Indexing_Peers...</span>
                    </div>
                ) : (
                    <div className='divide-y divide-slate-800/50 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar'>
                        <AnimatePresence>
                            {filteredUsers.map((user) => (
                                <motion.div
                                    key={user._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className='p-4 flex items-center justify-between hover:bg-blue-500/5 transition-colors group'
                                >
                                    <div className='flex items-center space-x-4'>
                                        {/* SPECIMEN FRAME */}
                                        <div className='w-10 h-10 border border-slate-800 bg-slate-950 p-0.5 shrink-0 overflow-hidden relative'>
                                            {user.avatar?.url ? (
                                                <img
                                                    src={user.avatar.url}
                                                    alt={user.name}
                                                    className='w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:grayscale-0 transition-all'
                                                />
                                            ) : (
                                                <div className='w-full h-full flex items-center justify-center text-[10px] font-black text-slate-700'>
                                                    {user.name[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col">
                                            <span className='text-[10px] font-black tracking-widest text-white uppercase group-hover:text-blue-400 transition-colors'>
                                                {user.name}
                                            </span>
                                            <span className="text-[7px] font-mono text-slate-600 uppercase tracking-tighter">
                                                UID: {user._id.slice(-8)}
                                            </span>
                                        </div>
                                    </div>

                                    {user._id !== currUser.id && (
                                        <button
                                            onClick={() => addFriend(user._id)}
                                            disabled={friends.includes(user._id) || sending[user._id] === 'sending'}
                                            className='h-9 px-4 border border-slate-800 bg-[#020617] hover:border-blue-500/50 transition-all disabled:opacity-50'
                                        >
                                            {friends.includes(user._id) ? (
                                                <span className="flex items-center gap-2 text-emerald-500 text-[8px] font-black tracking-widest">
                                                    <FiCheck /> LINKED
                                                </span>
                                            ) : sending[user._id] === 'error' ? (
                                                <span className="flex items-center gap-2 text-red-500 text-[8px] font-black tracking-widest">
                                                    <FiAlertCircle /> FAIL
                                                </span>
                                            ) : sending[user._id] === 'sending' ? (
                                                <div className="w-3 h-3 border border-blue-500 border-t-transparent animate-spin mx-auto" />
                                            ) : (
                                                <span className="flex items-center gap-2 text-slate-400 group-hover:text-blue-400 text-[8px] font-black tracking-widest">
                                                    <FiUserPlus /> LINK_NODE
                                                </span>
                                            )}
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredUsers.length === 0 && (
                            <div className='text-center py-20 flex flex-col gap-2'>
                                <FiSearch className="mx-auto text-slate-800 text-xl" />
                                <span className='text-[8px] font-black tracking-[0.3em] text-slate-700 uppercase'>
                                    Error: No_Matches_Found
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}