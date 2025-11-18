'use client'

import { useState } from "react";
import { FaMusic } from "react-icons/fa";

export default function Home() {
    const [isPlaying, setIsPlaying] = useState(false);

    const recentPlays = [
        { id: 1, title: 'Night Changes', artist: 'One Direction', duration: '3:45' },
        { id: 2, title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20' },
        { id: 3, title: 'Shape of You', artist: 'Ed Sheeran', duration: '3:53' },
    ];


    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-900 to-red-900 rounded-lg p-6">
                <h1 className="text-2xl font-bold text-white mb-2">Welcome Back, Alex!</h1>
                <p className="text-purple-200">Continue where you left off</p>
            </div>

            {/* Now Playing */}
            <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-red-600 rounded-lg flex items-center justify-center">
                        <FaMusic className="text-white text-xl" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-semibold">Currently Playing</h3>
                        <p className="text-purple-300">Starboy - The Weeknd</p>
                    </div>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-all duration-200 transform hover:scale-105"
                    >
                        {isPlaying ? '❚❚' : '▶'}
                    </button>
                </div>
            </div>

            {/* Recent Plays */}
            <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-white text-lg font-semibold mb-4">Recently Played</h2>
                <div className="space-y-3">
                    {recentPlays.map((song) => (
                        <div key={song.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200">
                            <div>
                                <p className="text-white font-medium">{song.title}</p>
                                <p className="text-purple-300 text-sm">{song.artist}</p>
                            </div>
                            <span className="text-gray-400 text-sm">{song.duration}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}