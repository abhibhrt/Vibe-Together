'use client';

import { FaVideo, FaPhone, FaTimes } from 'react-icons/fa';

export default function CallButtons({
    isCalling,
    isInCall,
    startCall,
    endCall
}) {
    return (
        <div className="flex items-center space-x-3">
            {!isCalling && !isInCall && (
                <>
                    <button
                        onClick={() => startCall('voice')}
                        className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-green-500/30"
                        title="Voice Call"
                    >
                        <FaPhone size={18} />
                    </button>
                    <button
                        onClick={() => startCall('video')}
                        className="bg-gradient-to-r from-blue-600 to-purple-800 hover:from-blue-700 hover:to-purple-900 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-purple-500/30"
                        title="Video Call"
                    >
                        <FaVideo size={18} />
                    </button>
                </>
            )}

            {isCalling && (
                <div className="flex items-center space-x-4">
                    <span className="text-yellow-400 text-sm font-semibold animate-pulse">
                        Calling...
                    </span>
                    <button
                        onClick={endCall}
                        className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
                        title="Cancel Call"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}