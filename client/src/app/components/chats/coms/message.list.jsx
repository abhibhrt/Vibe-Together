'use client';

import { useRef, useEffect } from 'react';
import { FiCheck, FiTerminal } from 'react-icons/fi';

export default function SignalHistory({ messages, user }) {
    const messagesEndRef = useRef(null);

    // Auto scroll to bottom sequence
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const isMe = (msg) => msg.senderId === String(user?.id);

    return (
        <div className='flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#020617]'>
            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed border-slate-900">
                    <FiTerminal className="text-slate-800 text-2xl" />
                    <span className="text-[8px] font-black tracking-[0.4em] text-slate-700 uppercase">
                        History_Buffer_Null // Awaiting_Signal
                    </span>
                </div>
            ) : (
                messages.map((msg, index) => {
                    const mine = isMe(msg);

                    return (
                        <div key={index} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[85%] md:max-w-[70%] p-3 border transition-all ${mine
                                        ? 'bg-blue-950/20 border-blue-900/50 text-slate-100'
                                        : 'bg-slate-900/40 border-slate-800 text-slate-300'
                                    }`}
                            >
                                {/* PACKET HEADER */}
                                <div className="flex items-center gap-2 mb-1.5 opacity-50">
                                    <span className="text-[7px] font-black tracking-widest uppercase">
                                        {mine ? 'LOCAL_NODE' : 'REMOTE_PEER'}
                                    </span>
                                    <div className="h-[1px] flex-1 bg-current opacity-20" />
                                </div>

                                <p className='text-[11px] leading-relaxed font-medium tracking-tight'>
                                    {msg.content}
                                </p>

                                {/* PACKET FOOTER */}
                                <div className='flex items-center justify-end space-x-2 mt-2 pt-1.5 border-t border-white/5'>
                                    <span className='text-[7px] font-mono text-slate-500 uppercase tracking-tighter'>
                                        TS: {new Date(msg.timestamp).toLocaleTimeString([], {
                                            hour12: false,
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })}
                                    </span>

                                    {mine && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-[6px] font-black text-emerald-500 tracking-tighter">[ACK]</span>
                                            <FiCheck className='text-emerald-500 text-[8px]' />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
            <div ref={messagesEndRef} className="h-4" />
        </div>
    );
}