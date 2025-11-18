'use client';

import { useState } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import ListMusic from './list.music';
import UploadMusic from './upload.music';
import { useUserStore } from '@/store/useUserStore';

export default function MainMusic() {
    const { user } = useUserStore();
    const [activeTab, setActiveTab] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div>
            <div className="p-4 border-b border-purple-500/30">
                <div className="flex items-center justify-between">
                    <div className="flex-1 max-w-md mr-4">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                            <input
                                type="text"
                                placeholder="Search for songs, artists..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-700/80 border border-purple-500/30 rounded-xl pl-10 pr-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                    </div>
                    {
                        user && (<button
                            onClick={() => setActiveTab(!activeTab)}
                            className={` p-3 rounded-full transition-all duration-300 ${activeTab ? 'bg-purple-700' : 'bg-purple-900 hover:bg-purple-800'}`} >
                            <FaPlus className={` text-white transition-transform duration-300  ${activeTab ? 'rotate-0' : 'rotate-135'}`} />
                        </button>)
                    }
                </div>
            </div>
            <div className="p-6">
                <h1 className="text-2xl font-bold text-white mb-2">Welcome to Your Music</h1>
                <p className="text-purple-200">Discover and enjoy your favorite tracks</p>
            </div>
            {
                activeTab ? <ListMusic searchQuery={searchQuery} /> : <UploadMusic />
            }


            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { 
                    animation: fade-in 0.6s ease-out; 
                }
            `}</style>
        </div>
    );
}