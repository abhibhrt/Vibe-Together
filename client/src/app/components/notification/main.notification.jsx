'use client';

import { useState } from 'react';
import { FiBell, FiMusic, FiDatabase, FiLayers, FiInfo } from 'react-icons/fi';
import { CoupleRequest } from '../users/request.users';
import { motion } from 'framer-motion';

export default function LogFeed() {
    const [notifications] = useState({
        general: [
            {
                id: 1,
                type: 'general',
                title: 'CORE_EXTENSION_DEPLOYED',
                message: 'Audio packet sharing protocol is now operational.',
                time: '02H_AGO',
                read: false
            },
            {
                id: 2,
                type: 'general',
                title: 'REGISTRY_UPDATE',
                message: 'Neural recommendations synced with "Chill_Vibes" index.',
                time: '24H_AGO',
                read: true
            }
        ],
    });

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* CONNECTION HANDSHAKES (Prioritized) */}
            <div className="space-y-2">
                <CoupleRequest />
            </div>

            {/* SYSTEM LOGS */}
            <div className="space-y-2">
                <div className="flex items-center justify-between px-2 mb-4">
                    <span className="text-[8px] font-black tracking-[0.4em] text-slate-500 uppercase flex items-center gap-2">
                        <FiDatabase className="text-blue-500" /> General_Log_Stream
                    </span>
                    <span className="text-[7px] font-mono text-slate-700 uppercase">
                        Feed_Active // Auto_Archive: ON
                    </span>
                </div>

                <div className="space-y-[1px] bg-slate-800/30">
                    {notifications.general.map((log) => (
                        <motion.div 
                            key={log.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`relative bg-slate-900/40 p-4 border-l-2 transition-all group ${
                                log.read ? 'border-slate-800' : 'border-blue-500 bg-blue-500/5'
                            } flex items-center space-x-4`}
                        >
                            {/* SPECIMEN ICON */}
                            <div className={`w-10 h-10 border flex items-center justify-center shrink-0 transition-colors ${
                                log.read ? 'border-slate-800 bg-slate-900 text-slate-600' : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                            }`}>
                                {log.title.includes('CORE') ? <FiLayers /> : <FiInfo />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h3 className={`text-[10px] font-black tracking-widest uppercase transition-colors ${
                                    log.read ? 'text-slate-400' : 'text-white'
                                }`}>
                                    {log.title}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-500 leading-tight mt-0.5">
                                    {log.message}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[7px] font-mono text-slate-600 tracking-tighter uppercase">
                                        TS: {log.time}
                                    </span>
                                    {!log.read && (
                                        <span className="text-[6px] font-black text-blue-500 uppercase px-1 border border-blue-500/30">
                                            New_Entry
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* EMPTY STATE PROTOCOL */}
                {notifications.general.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-slate-800">
                        <FiBell className="text-2xl mx-auto mb-3 text-slate-800" />
                        <p className="text-[8px] font-black tracking-[0.3em] text-slate-700 uppercase">
                            Buffer_Empty // No_Active_Logs
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}