'use client';

import { FaLock, FaSignInAlt } from 'react-icons/fa';

export default function WarnComponent() {
    return (
        <div>
            <div className="p-8 text-center max-w-md animate-fade-in">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaLock className="text-white text-2xl" />
                </div>
                
                <h2 className="text-white text-xl font-bold mb-2">Login Required</h2>
                <p className="text-purple-300 mb-6">
                    Please log in to access this feature and enjoy the full experience.
                </p>
            </div>
        </div>
    );
}