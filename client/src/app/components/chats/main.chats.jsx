'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiMessageSquare, FiUsers, FiActivity, FiArrowRight } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useFriendsStore } from '../../../store/useFriendsStore';
import { useUserStore } from '../../../store/useUserStore';
import api from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommsIndex() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const { friends, setFriends } = useFriendsStore();
    const { user } = useUserStore();

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            const res = await api.get('/api/friends/getall');
            const data = res.data;
            const friendsData = data.friends || [];
            const valid = friendsData.filter(f => f.friend !== null);

            const list = valid.map(fr => ({
                id: fr.friend._id,
                name: fr.friend.name,
                email: fr.friend.email,
                avatar: fr.friend.avatar?.url || '',
                lastSignal: 'INIT_SIGNAL_SENT',
                timestamp: '00:00',
                isOnline: false,
                unread: 0
            }));

            setFriends(list);
        } catch (err) {
            console.error('[SIGNAL_ERROR]: Failed to index peers', err);
        }
    };

    const filteredChats = friends.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openChat = (chat) => {
        router.push(`/chatting?id=${chat.id}`);
    };

    return (
        <div className='flex h-screen bg-[#020617]'>
            {/* SIDEBAR MODULE */}
            <div className='w-full md:w-96 border-r border-slate-800 flex flex-col'>
                
                {/* SEARCH MODULE */}
                <div className='p-6 border-b border-slate-800/50'>
                    <div className='flex items-center justify-between mb-4'>
                        <span className='text-[8px] font-black tracking-[0.4em] text-blue-500 uppercase flex items-center gap-2'>
                            <FiActivity className="animate-pulse" /> Active_Signals
                        </span>
                        <span className='text-[7px] font-mono text-slate-700 uppercase'>Idx: {friends.length}</span>
                    </div>
                    <div className='relative'>
                        <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs' />
                        <input
                            type='text'
                            placeholder='FILTER_ACTIVE_LINKS...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='w-full bg-slate-950 border border-slate-800 p-3 pl-10 text-[10px] font-bold tracking-widest text-white uppercase placeholder-slate-800 focus:border-blue-500 outline-none transition-all'
                        />
                    </div>
                </div>

                {/* SIGNAL LIST */}
                <div className='flex-1 overflow-y-auto custom-scrollbar'>
                    <AnimatePresence>
                        {filteredChats.length === 0 ? (
                            <div className='p-12 text-center flex flex-col gap-4'>
                                <FiUsers className='mx-auto text-slate-800 text-3xl' />
                                <span className='text-[8px] font-black tracking-[0.3em] text-slate-700 uppercase'>
                                    {friends.length === 0 ? 'Buffer_Empty: No_Peers' : 'Query_Null: No_Matches'}
                                </span>
                            </div>
                        ) : (
                            filteredChats.map(chat => (
                                <motion.div
                                    key={chat.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => openChat(chat)}
                                    className='flex items-center space-x-4 p-4 border-b border-slate-900 hover:bg-blue-500/5 transition-all cursor-pointer group'
                                >
                                    {/* NODE FRAME */}
                                    <div className='relative shrink-0'>
                                        <div className='w-11 h-11 border border-slate-800 bg-slate-950 p-0.5 overflow-hidden transition-all group-hover:border-blue-500/50'>
                                            {chat.avatar ? (
                                                <img src={chat.avatar} className='w-full h-full object-cover opacity-60 group-hover:opacity-100' />
                                            ) : (
                                                <div className='w-full h-full flex items-center justify-center text-[10px] font-black text-slate-700'>
                                                    {chat.name[0]}
                                                </div>
                                            )}
                                        </div>
                                        {chat.isOnline && (
                                            <div className='absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 border-2 border-[#020617]'></div>
                                        )}
                                    </div>

                                    <div className='flex-1 min-w-0'>
                                        <div className='flex items-center justify-between'>
                                            <h3 className='text-[10px] font-black tracking-widest text-white uppercase truncate group-hover:text-blue-400'>
                                                {chat.name}
                                            </h3>
                                            <span className='text-[7px] font-mono text-slate-600 tracking-tighter'>{chat.timestamp}</span>
                                        </div>

                                        <div className='flex items-center justify-between mt-1'>
                                            <p className='text-[9px] font-bold text-slate-500 truncate uppercase tracking-tight'>{chat.lastSignal}</p>
                                            {chat.unread > 0 && (
                                                <span className='bg-blue-600 text-white text-[7px] font-black px-1.5 py-0.5'>
                                                    {chat.unread}_MSG
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* MAIN DISPLAY MODULE */}
            <div className='hidden md:flex flex-1 items-center justify-center bg-slate-950/50'>
                <div className='text-center space-y-6 max-w-sm px-8'>
                    <div className='relative w-20 h-20 mx-auto'>
                        <div className='absolute inset-0 border border-slate-800 animate-[spin_10s_linear_infinite]' />
                        <div className='absolute inset-2 border border-blue-500/20' />
                        <div className='w-full h-full flex items-center justify-center'>
                            <FiMessageSquare className='text-blue-500 text-2xl' />
                        </div>
                    </div>
                    <div>
                        <h2 className='text-xs font-black tracking-[0.5em] text-white uppercase'>Encrypted_Signal_Stream</h2>
                        <p className='text-[9px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest mt-4'>
                            Select a peer node to initiate data transfer. signal integrity: 100%
                        </p>
                    </div>
                    <div className="pt-4 flex justify-center gap-4">
                        <div className="h-[1px] w-8 bg-slate-800 self-center" />
                        <span className="text-[7px] font-mono text-slate-700 uppercase tracking-[0.3em]">Ready_For_Input</span>
                        <div className="h-[1px] w-8 bg-slate-800 self-center" />
                    </div>
                </div>
            </div>
        </div>
    );
}