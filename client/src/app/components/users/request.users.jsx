'use client';

import api from '@/utils/api';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiActivity, FiUser, FiClock } from 'react-icons/fi';

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
            setNotifications({ couple: res.data.requests || [] });
        } catch (error) {
            console.error('[CORE_ERROR]: Handshake fetch failed', error);
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
            console.error('[CORE_ERROR]: Validation failed', error);
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
            console.error('[CORE_ERROR]: Termination failed', error);
        } finally {
            setActionLoading(prev => ({ ...prev, [requestId]: null }));
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase() +
            ' // ' +
            date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    if (loading || notifications.couple.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[8px] font-black tracking-[0.4em] text-blue-500 uppercase flex items-center gap-2">
                    <FiActivity className="animate-pulse" /> Pending_Handshakes
                </span>
                <span className="text-[8px] font-mono text-slate-600 uppercase">
                    Queue_Size: {notifications.couple.length}
                </span>
            </div>

            <AnimatePresence>
                {notifications.couple.map((request) => (
                    <motion.div
                        key={request._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-slate-900/40 border border-slate-800 p-5 rounded-sm relative group overflow-hidden"
                    >
                        {/* DECORATIVE BACKGROUND TEXT */}
                        <span className="absolute -right-2 -bottom-2 text-[40px] font-black text-slate-800/20 select-none pointer-events-none">
                            LINK_REQ
                        </span>

                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center space-x-5">
                                {/* SPECIMEN FRAME */}
                                <div className="w-14 h-14 border border-slate-700 bg-[#020617] p-1 shrink-0 relative">
                                    {request.sender.avatar?.url ? (
                                        <img
                                            src={request.sender.avatar.url}
                                            alt={request.sender.name}
                                            className="w-full h-full object-cover opacity-80 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                            <FiUser className="text-slate-600 text-xl" />
                                        </div>
                                    )}
                                    <div className="absolute -top-[1px] -left-[1px] w-1.5 h-1.5 border-t border-l border-blue-500" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="text-white text-xs font-black tracking-widest uppercase truncate">
                                        {request.sender.name || 'UNKNOWN_NODE'}
                                    </h3>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                        Identity verification requested
                                    </p>
                                    <div className="flex items-center gap-2 text-slate-600 mt-2">
                                        <FiClock className="text-[10px]" />
                                        <span className="text-[8px] font-mono uppercase tracking-tighter">
                                            {formatTime(request.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 shrink-0">
                                <button
                                    onClick={() => handleAcceptCouple(request._id)}
                                    disabled={!!actionLoading[request._id]}
                                    className="w-12 h-12 border border-slate-800 bg-[#020617] text-slate-400 hover:text-emerald-500 hover:border-emerald-500/50 flex items-center justify-center transition-all disabled:opacity-30"
                                >
                                    {actionLoading[request._id] === 'accept' ? (
                                        <div className="w-4 h-4 border border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <FiCheck className="text-lg" />
                                    )}
                                </button>

                                <button
                                    onClick={() => handleRejectCouple(request._id)}
                                    disabled={!!actionLoading[request._id]}
                                    className="w-12 h-12 border border-slate-800 bg-[#020617] text-slate-400 hover:text-red-500 hover:border-red-500/50 flex items-center justify-center transition-all disabled:opacity-30"
                                >
                                    {actionLoading[request._id] === 'reject' ? (
                                        <div className="w-4 h-4 border border-red-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <FiX className="text-lg" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* STATUS SUB-FOOTER */}
                        {actionLoading[request._id] && (
                            <div className="mt-4 pt-3 border-t border-slate-800/50">
                                <span className="text-[7px] font-black text-blue-500 tracking-[0.3em] uppercase animate-pulse">
                                    {actionLoading[request._id] === 'accept' ? 'Executing_Validation_Protocol...' : 'Executing_Termination_Sequence...'}
                                </span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};