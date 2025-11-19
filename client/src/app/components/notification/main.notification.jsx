'use client';

import { useState } from 'react';
import { FaBell, FaMusic } from 'react-icons/fa';
import { CoupleRequest } from '../users/request.users';

export default function NotificationsSection() {
    const [notifications, setNotifications] = useState({
        general: [
            {
                id: 1,
                type: 'general',
                title: 'New Feature Available',
                message: 'Check out the new music sharing feature!',
                time: '2 hours ago',
                read: false
            },
            {
                id: 2,
                type: 'general',
                title: 'Playlist Updated',
                message: 'Your "Chill Vibes" playlist has new recommendations',
                time: '1 day ago',
                read: true
            }
        ],
    });

    return (
        <div>
            <div className="max-w-2xl mx-auto">
                {/* Couple Requests */}
                <CoupleRequest/>
                
                {/* General Notifications */}
                <div>   
                    <div>
                        {notifications.general.map((notification) => (
                            <div 
                                key={notification.id}
                                className={`bg-gray-800/70 backdrop-blur-lg p-4 border ${
                                    notification.read ? 'border-gray-600' : 'border-purple-500/30'
                                } flex items-center space-x-4 animate-fade-in`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    notification.read ? 'bg-gray-700' : 'bg-gradient-to-br from-purple-600 to-red-600'
                                }`}>
                                    <FaMusic className="text-white text-sm" />
                                </div>
                                
                                <div className="flex-1">
                                    <h3 className="text-white font-medium">{notification.title}</h3>
                                    <p className="text-purple-300 text-sm">{notification.message}</p>
                                    <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
                                </div>
                                
                                {!notification.read && (
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {notifications.general.length === 0 && notifications.couple.length === 0 && (
                        <div className="text-center text-purple-300 py-12">
                            <FaBell className="text-4xl mx-auto mb-4 opacity-50" />
                            <p>No notifications yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}