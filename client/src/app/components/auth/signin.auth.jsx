'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiActivity, FiKey, FiTerminal, FiChevronRight } from 'react-icons/fi';
import api from '@/utils/api.js';
import { useUserStore } from '@/store/useUserStore.js';

export default function AccessRecovery({ handleBackUser }) {
    const [isLoading, setIsLoading] = useState(false);
    const { setUser } = useUserStore();
    const [form, setForm] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await api.post('/api/users/signin', form);
            setUser(res?.data?.user);
            setForm({ email: '', password: '' });
        } catch (error) {
            console.error("[ACCESS_DENIED]: Credential mismatch", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md border border-slate-800 bg-slate-950 rounded-sm shadow-2xl"
            >
                {/* TERMINAL HEADER */}
                <div className="border-b border-slate-800 px-5 py-3 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <FiTerminal className="text-blue-500 text-xs" />
                        <span className="text-[9px] font-black tracking-[0.4em] text-slate-400 uppercase">
                            Auth_Node: 0x882
                        </span>
                    </div>
                    <div className="flex gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                    </div>
                </div>

                <div className="p-8">
                    <div className="mb-10">
                        <h1 className="text-lg font-bold tracking-[0.25em] text-white uppercase flex items-center gap-2">
                            Access Recovery
                        </h1>
                        <div className="mt-2 h-[1px] w-12 bg-blue-500" />
                        <p className="mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                            Resuming encrypted session context. <br />
                            Enter credentials to authorize decryption.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* INPUT: EMAIL */}
                        <div className="group space-y-2">
                            <label className="text-[8px] font-black tracking-[0.3em] text-slate-500 uppercase flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <FiMail className="group-focus-within:text-blue-500 transition-colors" />
                                    Identity Descriptor
                                </span>
                                <span className="text-slate-700 font-mono">TYPE: STRING</span>
                            </label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleInputChange}
                                placeholder="USER_UID@SYSTEM.LOCAL"
                                className="w-full bg-slate-900 border border-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-800 text-slate-200"
                                required
                            />
                        </div>

                        {/* INPUT: PASSWORD */}
                        <div className="group space-y-2">
                            <label className="text-[8px] font-black tracking-[0.3em] text-slate-500 uppercase flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <FiLock className="group-focus-within:text-blue-500 transition-colors" />
                                    Passphrase
                                </span>
                                <span className="text-slate-700 font-mono">ENCR: AES</span>
                            </label>
                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleInputChange}
                                placeholder="••••••••••••"
                                className="w-full bg-slate-900 border border-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-800 text-slate-200"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-100 hover:bg-white text-[#020617] py-4 text-[10px] font-black tracking-[0.5em] uppercase transition-all flex items-center justify-center gap-2 group disabled:opacity-30"
                        >
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div
                                        key="exec"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center gap-2"
                                    >
                                        <FiActivity className="animate-spin" /> VERIFYING_CHALLENGE
                                    </motion.div>
                                ) : (
                                    <div key="idle" className="flex items-center gap-2">
                                        Authorize Access <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </AnimatePresence>
                        </button>
                    </form>

                    <div className="mt-6 flex flex-col items-center gap-4">
                        <button className="text-[9px] font-black tracking-[0.2em] text-slate-600 uppercase hover:text-blue-500 transition-colors flex items-center gap-2">
                            <FiKey className="text-[10px]" /> Key_Reset_Protocol
                        </button>

                        <div className="w-full flex items-center gap-4 py-4">
                            <div className="h-[1px] flex-1 bg-slate-800" />
                            <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">End_of_Terminal</span>
                            <div className="h-[1px] flex-1 bg-slate-800" />
                        </div>

                        <button
                            onClick={handleBackUser}
                            className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase hover:text-emerald-500 transition-colors"
                        >
                            Request New Provisioning // <span className="underline underline-offset-4">Register</span>
                        </button>
                    </div>
                </div>

                {/* HEARTBEAT FOOTER */}
                <div className="bg-slate-900 px-6 py-2 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[8px] font-mono text-slate-500">SECURE_LINK_ESTABLISHED</span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-600 uppercase">Localhost:8080</span>
                </div>
            </motion.div>
        </div>
    );
}