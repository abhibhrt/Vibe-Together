'use client';

import { useState } from 'react';
import api from '@/utils/api.js';
import { useUserStore } from '@/store/useUserStore.js';
import { FaSignOutAlt } from 'react-icons/fa';

export default function SignOutPage() {
    const [isLoading, setIsLoading] = useState(false);
    const { setUser } = useUserStore();

    const handleLogout = async (e) => {
        e.preventDefault();

        const confirmed = window.confirm('are you sure you want to log out?');
        if (!confirmed) return;

        setIsLoading(true);

        try {
            await api.post('/api/users/signout');
            setUser(null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            disabled={isLoading}
            onClick={handleLogout}
            className={`w-full text-left ${isLoading ? 'bg-gray-700/30 cursor-not-allowed' : ''}`}>
            <div className='flex items-center space-x-3'>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300
          bg-gradient-to-r from-purple-600 to-red-600
          ${isLoading ? '' : 'group-hover:rotate-12'}
        `}>
                    <FaSignOutAlt className='text-white text-sm' />
                </div>

                <div>
                    <div className='text-white font-medium'>
                        {isLoading ? 'Logging out...' : 'Logout'}
                    </div>
                </div>
            </div>
        </button>
    );
}