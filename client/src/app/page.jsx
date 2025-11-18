'use client';

import { useState } from 'react';
import { FaUser, FaMusic, FaList, FaUsers, FaComment, FaCog } from 'react-icons/fa';
import Profile from './components/profile/main.profile';
import Home from './components/home/main.home';
import MainMusic from './components/music/main.music';

export default function UserDashboard() {
    const [activeTab, setActiveTab] = useState('music');

    const renderContent = () => {
        switch (activeTab) {
            case 'chats':
                return <Home />;

            case 'profile':
                return <Profile />;

            case 'music':
                return <MainMusic />;

            case 'playlist':
                return (
                    <div className="space-y-6">
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h2 className="text-white text-xl font-bold mb-4">Your Playlists</h2>
                            <div className="space-y-3">
                                {['Workout Mix', 'Chill Vibes', 'Road Trip', 'Party Time'].map((playlist, index) => (
                                    <div key={playlist} className="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-red-600 rounded flex items-center justify-center">
                                            <FaList className="text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{playlist}</p>
                                            <p className="text-purple-300 text-sm">{index + 5} songs</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'together':
                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-purple-900 to-red-900 rounded-lg p-6 text-center">
                            <FaUsers className="text-white text-4xl mx-auto mb-4" />
                            <h2 className="text-white text-xl font-bold mb-2">Listen Together</h2>
                            <p className="text-purple-200">Share music with friends in real-time</p>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6">
                            <h3 className="text-white font-semibold mb-4">Active Sessions</h3>
                            <div className="space-y-3">
                                {['Weekend Vibes', 'Study Group', 'Car Pool'].map((session) => (
                                    <div key={session} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200">
                                        <div>
                                            <p className="text-white font-medium">{session}</p>
                                            <p className="text-purple-300 text-sm">3 people listening</p>
                                        </div>
                                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                                            Join
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const navItems = [
        { id: 'chats', icon: FaComment, label: 'Chats' },
        { id: 'profile', icon: FaUser, label: 'Profile' },
        { id: 'music', icon: FaMusic, label: 'Music' },
        { id: 'playlist', icon: FaList, label: 'Playlists' },
        { id: 'together', icon: FaUsers, label: 'Together' },
    ];

    return (
        <div className="min-h-screen text-white pb-20 bg-gradient-to-br from-purple-900 via-gray-900 to-red-900"> {/* Added padding for bottom nav */}
            {/* Header */}
            <div className="bg-gray-800 p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent">
                    CloseMiles
                </h1>
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                    <FaCog className="text-purple-400" />
                </button>
            </div>

            {renderContent()}

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
                <div className="flex justify-around items-center p-3">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-gradient-to-b from-purple-600 to-red-600 text-white transform -translate-y-1'
                                        : 'text-purple-300 hover:text-white hover:bg-gray-700'
                                    }`}
                            >
                                <Icon className="text-lg mb-1" />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}