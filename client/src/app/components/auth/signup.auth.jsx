'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiActivity, FiShield, FiCpu, FiHash } from 'react-icons/fi';
import api from '@/utils/api';
import { useUserStore } from '@/store/useUserStore.js';

export default function IdentityProvisioning({ handleBackUser }) {
    const [isLoading, setIsLoading] = useState(false);
    const { setUser } = useUserStore();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await api.post('/api/users/signup', form);
            setUser(res?.data?.user);
            setForm({ name: '', email: '', password: '' });
        } catch (error) {
            console.error("[SYSTEM_ERROR]: Provisioning failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans text-slate-300">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md border border-slate-800 bg-slate-900/50 backdrop-blur-md rounded-sm overflow-hidden"
            >
                {/* STATUS BAR */}
                <div className="border-b border-slate-800 px-6 py-3 flex justify-between items-center bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        <span className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase">
                            System Status: Active
                        </span>
                    </div>
                    <FiCpu className="text-slate-600 text-xs" />
                </div>

                <div className="p-8">
                    <header className="mb-10">
                        <h1 className="text-xl font-bold tracking-[0.2em] text-white uppercase mb-1">
                            Identity Provisioning
                        </h1>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            Establishing New Directory Entry // Unit_001
                        </p>
                    </header>

                    {/* DATA INGESTION TERMINAL */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black tracking-[0.3em] text-slate-500 uppercase flex items-center gap-2">
                                <FiUser className="text-blue-500" /> System Alias
                            </label>
                            <input
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleInputChange}
                                placeholder="INPUT_NAME_STRING"
                                className="w-full bg-[#020617] border border-slate-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-700 text-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black tracking-[0.3em] text-slate-500 uppercase flex items-center gap-2">
                                <FiMail className="text-blue-500" /> Comms Protocol (Email)
                            </label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleInputChange}
                                placeholder="USER@NETWORK.INT"
                                className="w-full bg-[#020617] border border-slate-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-700 text-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black tracking-[0.3em] text-slate-500 uppercase flex items-center gap-2">
                                <FiLock className="text-blue-500" /> Encryption Key
                            </label>
                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleInputChange}
                                placeholder="••••••••••••"
                                className="w-full bg-[#020617] border border-slate-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-700 text-slate-200"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full relative group overflow-hidden bg-blue-600 py-4 text-[10px] font-black tracking-[0.5em] text-white uppercase transition-all hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50"
                        >
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <FiActivity className="animate-spin" />
                                        <span>Executing_Provisioning...</span>
                                    </motion.div>
                                ) : (
                                    <span key="idle">Initialize Registry</span>
                                )}
                            </AnimatePresence>
                        </button>
                    </form>

                    {/* SYSTEM SPECS / METADATA */}
                    <div className="mt-10 grid grid-cols-2 gap-[1px] bg-slate-800 border border-slate-800">
                        {[
                            { icon: FiActivity, label: 'Real-time sync' },
                            { icon: FiShield, label: 'AES-256 Enc' },
                            { icon: FiHash, label: 'Index Matrix' },
                            { icon: FiUser, label: 'Single Node' }
                        ].map((spec, i) => (
                            <div key={i} className="bg-[#020617] p-3 flex flex-col items-center justify-center gap-2 hover:bg-slate-900 transition-colors group">
                                <spec.icon className="text-slate-600 group-hover:text-blue-500 transition-colors text-xs" />
                                <span className="text-[8px] font-black tracking-widest text-slate-500 uppercase text-center">
                                    {spec.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800 flex justify-center">
                        <button
                            onClick={handleBackUser}
                            className="text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase hover:text-blue-400 transition-colors flex items-center gap-2"
                        >
                            Existing Identity? <span className="text-blue-500">Log_In</span>
                        </button>
                    </div>
                </div>

                {/* FOOTER METRICS */}
                <div className="bg-slate-900/80 px-6 py-2 border-t border-slate-800 flex justify-between">
                    <span className="text-[8px] font-mono text-slate-600">LATENCY: 14ms</span>
                    <span className="text-[8px] font-mono text-slate-600">VER: 4.0.2-INSTITUTIONAL</span>
                </div>
            </motion.div>
        </div>
    );
}