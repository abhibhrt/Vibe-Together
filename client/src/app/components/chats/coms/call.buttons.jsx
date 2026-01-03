'use client';

import { FiVideo, FiPhone, FiX, FiActivity } from 'react-icons/fi';

export default function SignalInitiator({
    isCalling,
    isInCall,
    startCall,
    endCall
}) {
    return (
        <div className="flex items-center gap-2">
            {!isCalling && !isInCall && (
                <div className="flex items-center gap-2">
                    {/* AUDIO_LINK_TRIGGER */}
                    <button
                        onClick={() => startCall('voice')}
                        className="w-9 h-9 flex items-center justify-center border border-slate-800 text-slate-400 hover:border-blue-500 hover:text-blue-400 hover:bg-blue-500/5 transition-all group"
                        title="INIT_AUDIO_LINK"
                    >
                        <FiPhone size={14} className="group-hover:rotate-12 transition-transform" />
                    </button>
                    
                    {/* VIDEO_LINK_TRIGGER */}
                    <button
                        onClick={() => startCall('video')}
                        className="w-9 h-9 flex items-center justify-center border border-slate-800 text-slate-400 hover:border-blue-500 hover:text-blue-400 hover:bg-blue-500/5 transition-all group"
                        title="INIT_VIDEO_LINK"
                    >
                        <FiVideo size={14} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            )}

            {isCalling && (
                <div className="flex items-center gap-4 px-3 py-1 border border-blue-900/30 bg-blue-950/10">
                    <div className="flex items-center gap-2">
                        <FiActivity className="text-blue-500 text-[10px] animate-pulse" />
                        <span className="text-[8px] font-black tracking-[0.3em] text-blue-500 uppercase">
                            SIG_PENDING
                        </span>
                    </div>
                    
                    <div className="w-[1px] h-4 bg-slate-800" />
                    
                    <button
                        onClick={endCall}
                        className="text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1 group"
                        title="ABORT_SIGNAL"
                    >
                        <span className="text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">ABORT</span>
                        <FiX size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}