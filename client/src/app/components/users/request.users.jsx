'use client';

import api from '@/utils/api';
import { useEffect, useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

export const CoupleRequest = () => {
    const [notifications, setNotifications] = useState({ couple: [] });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        fetchCoupleRequests();
    }, []);

    const fetchCoupleRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/requests/read');
            setNotifications({ couple: res.data.couple || [] });
        } catch (error) {
            console.error('Error fetching couple requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptCouple = async (requestId) => {
        setActionLoading(prev => ({ ...prev, [requestId]: 'accept' }));
        try {
            await api.put(`/api/requests/update/${requestId}`);
            await fetchCoupleRequests();
        } catch (error) {
            console.error('Error accepting couple request:', error);
        } finally {
            setActionLoading(prev => ({ ...prev, [requestId]: null }));
        }
    };

    const handleRejectCouple = async (requestId) => {
        setActionLoading(prev => ({ ...prev, [requestId]: 'reject' }));
        try {
            await api.delete(`/api/requests/remove/${requestId}`);
            await fetchCoupleRequests();
        } catch (error) {
            console.error('Error rejecting couple request:', error);
        } finally {
            setActionLoading(prev => ({ ...prev, [requestId]: null }));
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading || notifications.couple.length === 0) {
        return <></>;
    }

    return (
        <div>
            {notifications.couple.map((request) => (
                <div
                    key={request._id}
                    className="bg-gray-800/70 backdrop-blur-lg p-6 animate-fade-in"
                >
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-red-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                            {request.sender.avatar?.url ? (
                                <img
                                    src={request.sender.avatar.url}
                                    alt={request.sender.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white text-xl font-bold">
                                    {request.sender.name?.[0]?.toUpperCase() || '?'}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold truncate">
                                {request.sender.name || 'Unknown'}
                            </h3>
                            <p className="text-purple-300 text-sm">Wants to connect with you</p>
                            <p className="text-gray-400 text-xs mt-1">
                                {formatTime(request.createdAt)}
                            </p>
                        </div>

                        <div className="flex space-x-1">
                            <button
                                onClick={() => handleAcceptCouple(request._id)}
                                disabled={!!actionLoading[request._id]}
                                className="flex-1 p-3 rounded-xl bg-gradient-to-r from-purple-600 to-red-600 text-white font-semibold flex items-center justify-center space-x-2 transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-70"
                            >
                                {actionLoading[request._id] === 'accept' ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <FaCheck className="text-xl" />
                                )}
                            </button>

                            <button
                                onClick={() => handleRejectCouple(request._id)}
                                disabled={!!actionLoading[request._id]}
                                className="flex-1 p-3 rounded-xl bg-gray-700 text-white font-semibold border border-gray-600 flex items-center justify-center space-x-2 transition-all hover:scale-105 hover:bg-gray-600 disabled:opacity-70"
                            >
                                {actionLoading[request._id] === 'reject' ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <FaTimes className="text-xl" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};