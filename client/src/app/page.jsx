'use client'

import { useState, useEffect } from 'react'
import { FaUser, FaMusic, FaUsers, FaComment, FaGlobeAmericas, FaBell } from 'react-icons/fa'
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

export default function UserDashboard() {
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
            case 'chats':
                return user ? <ChatsSection /> : <WarnComponent />

            case 'profile':
                return <Profile />

            case 'music':
                return <MainMusic />

            case 'notification':
                return user ? <NotificationsSection /> : <WarnComponent />

            case 'users':
                return user ? <UsersList currUser={user} /> : <WarnComponent />

            case 'together':
                return (
                    <div className='space-y-6'>
                        <div className='bg-gradient-to-r from-purple-900 to-red-900 rounded-lg p-6 text-center'>
                            <FaUsers className='text-white text-4xl mx-auto mb-4' />
                            <h2 className='text-white text-xl font-bold mb-2'>Listen Together</h2>
                            <p className='text-purple-200'>Share music with friends in real-time</p>
                        </div>

                        <div className='bg-gray-8 rounded-lg p-6'>
                            <h3 className='text-white font-semibold mb-4'>Active Sessions</h3>
                            <div className='space-y-3'>
                                {['Weekend Vibes', 'Study Group', 'Car Pool'].map((session) => (
                                    <div key={session} className='flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200'>
                                        <div>
                                            <p className='text-white font-medium'>{session}</p>
                                            <p className='text-purple-300 text-sm'>3 people listening</p>
                                        </div>
                                        <button className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200'>
                                            Join
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    const navItems = [
        { id: 'chats', icon: FaComment, label: 'Chats' },
        { id: 'profile', icon: FaUser, label: 'Profile' },
        { id: 'music', icon: FaMusic, label: 'Music' },
        { id: 'users', icon: FaGlobeAmericas, label: 'Users' },
        { id: 'together', icon: FaUsers, label: 'Together' }
    ]

    return (
        <div className='min-h-screen text-white pb-20 bg-gradient-to-br from-purple-900 via-gray-900 to-red-900'>
            <div className='bg-gray-800 p-3 flex justify-between items-center'>
                <h1 className='text-xl font-bold bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent'>
                    closemiles
                </h1>
                <button className={`p-2 rounded-xl ${activeTab === 'notification' ? 'bg-gradient-to-b from-purple-600 to-red-600 text-white' : ''
                    }`}>
                    <FaBell onClick={() => setActiveTab('notification')} className='text-xl' />
                </button>
            </div>

            {renderContent()}

            <div className='fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700'>
                <div className='flex justify-around items-center p-3'>
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeTab === item.id
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-b from-purple-600 to-red-600 text-white transform -translate-y-1'
                                    : 'text-purple-300 hover:text-white hover:bg-gray-700'
                                    }`}
                            >
                                <Icon className='text-lg mb-1' />
                            </button>
                        )
                    })}
                </div>
            </div>

            {playingNow && ( <PlayerPopup music={playingNow} onMusicEnd={handleNextSong} handleNext={handleNextSong} handlePrev={handlePrevSong} /> )}
        </div>
    )
}