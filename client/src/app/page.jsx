'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    FiUser, FiMusic, FiUsers, FiMessageSquare, 
    FiGlobe, FiBell, FiCpu, FiActivity, FiLayers 
} from 'react-icons/fi'
import Profile from './components/profile/main.profile'
import MainMusic from './components/music/main.music'
import PlayerPopup from './components/music/play.music'
import ChatsSection from './components/chats/main.chats'
import WarnComponent from './components/login-error'

import { usePlaybackStore, usePlaylistStore } from '../store/useSongStore'
import { fetchUserUtil } from '@/utils/fetchuser.util.js'
import { useUserStore } from '../store/useUserStore'
import UsersList from './components/users/main.users'
import NotificationsSection from './components/notification/main.notification'

export default function TerminalDashboard() {
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem('active-tab') || 'music'
        }
        return 'music'
    })
    
    const { playingNow, setPlayingNow } = usePlaybackStore();
    const { allSongs } = usePlaylistStore();
    const { user } = useUserStore();

    const handleNextSong = () => {
        setPlayingNow(null);
        setTimeout(() => {
            setPlayingNow(allSongs[(allSongs.findIndex(song => song._id === playingNow._id) + 1) % allSongs.length]);
        }, 1);
    }

    const handlePrevSong = () => {
        setPlayingNow(null);
        setTimeout(() => {
            setPlayingNow(allSongs[(allSongs.findIndex(song => song._id === playingNow._id) - 1 + allSongs.length) % allSongs.length]);
        }, 1);
    }

    fetchUserUtil()

    useEffect(() => {
        sessionStorage.setItem('active-tab', activeTab)
    }, [activeTab])

    const renderContent = () => {
        switch (activeTab) {
            case 'chats': return user ? <ChatsSection /> : <WarnComponent />
            case 'profile': return <Profile />
            case 'music': return <MainMusic />
            case 'notification': return user ? <NotificationsSection /> : <WarnComponent />
            case 'users': return user ? <UsersList currUser={user} /> : <WarnComponent />
            case 'together': return <SynchronizedPlayback />
            default: return null
        }
    }

    const navItems = [
        { id: 'music', icon: FiMusic, label: 'INDEX' },
        { id: 'chats', icon: FiMessageSquare, label: 'COMMS' },
        { id: 'users', icon: FiGlobe, label: 'NODES' },
        { id: 'together', icon: FiLayers, label: 'SYNC' },
        { id: 'profile', icon: FiUser, label: 'AUTH' },
    ]

    return (
        <div className='min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-blue-500/30'>
            {/* INSTITUTIONAL HEADER */}
            <header className='bg-[#020617] border-b border-slate-800 p-4 sticky top-0 z-50 flex justify-between items-center'>
                <div className='flex items-center gap-4'>
                    <FiCpu className='text-blue-500 animate-pulse' />
                    <div>
                        <h1 className='text-xs font-black tracking-[0.5em] text-white uppercase'>
                            CLOSEMILES_CORE
                        </h1>
                        <p className='text-[8px] font-bold text-slate-500 tracking-widest uppercase'>
                            System_Rev: 4.0.2 // Terminal_Active
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={() => setActiveTab('notification')}
                    className={`relative p-2 border transition-all ${
                        activeTab === 'notification' 
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400' 
                        : 'border-slate-800 text-slate-500'
                    }`}
                >
                    <FiBell className='text-sm' />
                    {user && <span className='absolute top-0 right-0 h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping' />}
                </button>
            </header>

            {/* MAIN VIEWPORT */}
            <main className='max-w-5xl mx-auto p-4 md:p-8 mb-24'>
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* HIGH-PRECISION NAVIGATION */}
            <nav className='fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 z-50'>
                <div className='max-w-xl mx-auto flex justify-around items-center h-16'>
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeTab === item.id
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex flex-col items-center gap-1 transition-all px-4 py-2 ${
                                    isActive ? 'text-blue-500' : 'text-slate-600 hover:text-slate-400'
                                }`}
                            >
                                <Icon className='text-lg' />
                                <span className='text-[8px] font-black tracking-[0.2em] uppercase'>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="nav_active" 
                                        className="h-0.5 w-4 bg-blue-500 rounded-full" 
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            </nav>

            {playingNow && (
                <PlayerPopup
                    music={playingNow}
                    handleNext={handleNextSong}
                    handlePrev={handlePrevSong}
                />
            )}
        </div>
    )
}

function SynchronizedPlayback() {
    return (
        <div className='space-y-6'>
            <div className='border border-slate-800 bg-slate-900/40 p-8 rounded-sm text-center relative overflow-hidden'>
                <div className='absolute top-0 left-0 w-full h-[2px] bg-blue-500/20' />
                <FiActivity className='text-blue-500 text-3xl mx-auto mb-4' />
                <h2 className='text-white text-sm font-black tracking-[0.3em] uppercase mb-2'>
                    Synchronized Playback
                </h2>
                <p className='text-[10px] text-slate-500 font-bold tracking-widest uppercase'>
                    Real-time network audio distribution enabled.
                </p>
            </div>

            <div className='border border-slate-800 bg-[#020617]'>
                <div className='px-4 py-3 border-b border-slate-800 flex justify-between items-center'>
                    <h3 className='text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase'>
                        Active Node Sessions
                    </h3>
                    <span className='text-[8px] font-mono text-blue-500'>SCANNING...</span>
                </div>
                <div className='divide-y divide-slate-800'>
                    {['X-ALPHA', 'STUDY_GRID', 'COMMUTER_HUB'].map((session) => (
                        <div key={session} className='flex items-center justify-between p-4 hover:bg-slate-900 transition-colors'>
                            <div className='flex items-center gap-4'>
                                <div className='h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' />
                                <div>
                                    <p className='text-xs font-bold text-white tracking-wider'>{session}</p>
                                    <p className='text-[8px] font-black text-slate-600 uppercase tracking-widest mt-0.5'>
                                        3 Peers Connected // 128kbps
                                    </p>
                                </div>
                            </div>
                            <button className='border border-slate-700 hover:border-blue-500 hover:text-blue-500 text-slate-500 text-[9px] font-black tracking-widest uppercase px-4 py-2 transition-all'>
                                Join_Node
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}