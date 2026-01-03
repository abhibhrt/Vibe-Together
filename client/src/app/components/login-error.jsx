'use client';

import { motion } from 'framer-motion';
import { FiLock, FiShieldOff, FiAlertCircle, FiTerminal } from 'react-icons/fi';

export default function AccessRestriction() {
    return (
        <div className="flex items-center justify-center py-12 px-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md border border-slate-800 bg-slate-900/30 backdrop-blur-sm p-8 rounded-sm text-center relative overflow-hidden"
            >
                {/* TECHNICAL SPECIMEN HEADER */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                
                <div className="relative inline-flex items-center justify-center mb-6">
                    {/* SPECIMEN ICON CONTAINER */}
                    <div className="w-16 h-16 border border-slate-700 bg-[#020617] rounded-sm flex items-center justify-center group">
                        <FiShieldOff className="text-slate-500 group-hover:text-blue-500 transition-colors text-2xl" />
                        
                        {/* DECORATIVE CORNERS */}
                        <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-blue-500/50" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-blue-500/50" />
                    </div>
                </div>
                
                <header className="mb-6">
                    <h2 className="text-white text-sm font-black tracking-[0.4em] uppercase mb-3 flex items-center justify-center gap-2">
                        <FiAlertCircle className="text-blue-500" /> Unauthorized_Access
                    </h2>
                    <div className="flex justify-center gap-1 mb-4">
                        <span className="h-0.5 w-8 bg-slate-800" />
                        <span className="h-0.5 w-2 bg-blue-500" />
                        <span className="h-0.5 w-8 bg-slate-800" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed px-4">
                        Requested module is restricted to verified identities. <br />
                        Current session lacks valid <span className="text-slate-300 underline underline-offset-2">Auth_Token</span>.
                    </p>
                </header>

                <div className="space-y-4">
                    <div className="bg-[#020617] border border-slate-800 p-3 flex items-center justify-between">
                        <span className="text-[8px] font-black tracking-[0.2em] text-slate-600 uppercase">
                            Protocol: 0xAuth_Init
                        </span>
                        <FiLock className="text-slate-700 text-xs" />
                    </div>

                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.3em] animate-pulse">
                        Await_Provisioning...
                    </p>
                </div>

                {/* METADATA FOOTER */}
                <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3">
                        <FiTerminal className="text-slate-600 text-[10px]" />
                        <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">
                            Err_Code: 401_ACCESS_DENIED
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}