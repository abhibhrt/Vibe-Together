'use client';

import { useState } from 'react';
import api from '@/utils/api.js';
import { useUserStore } from '@/store/useUserStore.js';
import { FiLogOut, FiPower, FiAlertTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function TerminateSession() {
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const { setUser } = useUserStore();

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await api.post('/api/users/signout');
            setUser(null);
        } catch (error) {
            console.error('[AUTH_ERROR]: Termination sequence failed', error);
            setIsConfirming(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            {!isConfirming ? (
                <button
                    onClick={() => setIsConfirming(true)}
                    className="w-full group flex items-center justify-between p-3 border border-transparent hover:border-red-900/50 hover:bg-red-950/10 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 border border-slate-800 bg-[#020617] flex items-center justify-center group-hover:border-red-500/50 transition-colors">
                            <FiLogOut className="text-slate-500 group-hover:text-red-500 text-xs" />
                        </div>
                        <div className="text-left">
                            <div className="text-[9px] font-black tracking-widest text-slate-400 uppercase group-hover:text-red-400 transition-colors">
                                Terminate_Session
                            </div>
                            <div className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">
                                Close_All_Buffers
                            </div>
                        </div>
                    </div>
                </button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full bg-red-950/20 border border-red-900/50 p-4 rounded-sm"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <FiAlertTriangle className="text-red-500 text-sm animate-pulse" />
                        <span className="text-[8px] font-black tracking-[0.3em] text-red-500 uppercase">
                            Confirm_Termination?
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            disabled={isLoading}
                            onClick={handleLogout}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white text-[9px] font-black tracking-widest uppercase py-2 transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'PURGING...' : 'TERMINATE'}
                        </button>
                        <button
                            disabled={isLoading}
                            onClick={() => setIsConfirming(false)}
                            className="flex-1 border border-slate-700 text-slate-400 text-[9px] font-black tracking-widest uppercase py-2 hover:bg-slate-800 transition-all"
                        >
                            ABORT
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}