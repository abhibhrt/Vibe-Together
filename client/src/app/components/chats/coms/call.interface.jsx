'use client';

import { 
    FiVideo, FiPhone, FiVideoOff, FiMicOff, 
    FiX, FiPhoneOff, FiMic, FiAlertTriangle, FiMonitor 
} from 'react-icons/fi';

export default function SignalOverride({
    isInCall,
    isCalling,
    isReceivingCall,
    callerName,
    callType,
    friend,
    isMuted,
    isVideoOff,
    localVideoRef,
    remoteVideoRef,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo
}) {
    return (
        <>
            {/* ALERT: INCOMING_SIGNAL */}
            {isReceivingCall && (
                <div className="fixed inset-0 bg-[#020617]/95 flex items-center justify-center z-[100] backdrop-blur-sm">
                    <div className="w-full max-w-sm border border-blue-500/30 bg-slate-950 p-1">
                        <div className="border border-blue-500/10 p-8 text-center relative overflow-hidden">
                            {/* SCANLINE EFFECT */}
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent h-1/2 animate-pulse pointer-events-none" />
                            
                            <div className="relative z-10">
                                <div className="flex justify-center mb-6">
                                    <div className="w-16 h-16 border border-blue-500 flex items-center justify-center animate-[ping_2s_infinite]">
                                        <FiAlertTriangle className="text-blue-500 text-2xl" />
                                    </div>
                                </div>
                                
                                <h2 className="text-[10px] font-black tracking-[0.5em] text-blue-500 uppercase mb-2">
                                    Incoming_{callType}_Signal
                                </h2>
                                <p className="text-white text-xl font-bold tracking-tighter uppercase mb-8">
                                    {callerName}
                                </p>
                                
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={rejectCall}
                                        className="flex-1 bg-red-950/20 border border-red-900 text-red-500 py-3 text-[10px] font-black tracking-widest hover:bg-red-900 hover:text-white transition-all"
                                    >
                                        TERMINATE
                                    </button>
                                    <button
                                        onClick={acceptCall}
                                        className="flex-1 bg-blue-950/20 border border-blue-900 text-blue-400 py-3 text-[10px] font-black tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                                    >
                                        ESTABLISH
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* INTERFACE: ACTIVE_OVERRIDE */}
            {isInCall && (
                <div className="fixed inset-0 bg-[#020617] z-[90] flex flex-col">
                    {/* SYSTEM_HEADER */}
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-[100] bg-gradient-to-b from-black/80 to-transparent">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 animate-pulse" />
                            <span className="text-[9px] font-black tracking-[0.3em] text-white uppercase">
                                SECURE_CHANNEL // {callType}_STREAM // PEER: {friend.name}
                            </span>
                        </div>
                        <button
                            onClick={endCall}
                            className="bg-red-600 text-white px-4 py-1.5 text-[10px] font-black tracking-widest hover:bg-red-700 transition-all"
                        >
                            DISCONNECT
                        </button>
                    </div>

                    {/* REMOTE_STREAM_BUFFER */}
                    <div className="flex-1 relative bg-slate-900 overflow-hidden">
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover opacity-80"
                        />
                        
                        {/* FALLBACK: NO_SIGNAL */}
                        {(!remoteVideoRef.current?.srcObject) && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950">
                                <FiMonitor className="text-slate-800 text-5xl mb-4 animate-pulse" />
                                <span className="text-[8px] font-mono text-slate-600 tracking-[0.5em] uppercase">
                                    Awaiting_Remote_Packet_Stream...
                                </span>
                            </div>
                        )}

                        {/* LOCAL_MONITOR_NODE (PIP) */}
                        {callType === 'video' && (
                            <div className="absolute bottom-24 right-6 w-40 h-56 border border-blue-500/40 bg-black shadow-2xl z-[110]">
                                <div className="absolute top-0 left-0 bg-blue-600 px-2 py-0.5 z-10">
                                    <span className="text-[7px] font-black text-white uppercase">Local_Node</span>
                                </div>
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={`w-full h-full object-cover grayscale ${isVideoOff ? 'hidden' : 'block'}`}
                                />
                                {isVideoOff && (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                        <FiVideoOff className="text-slate-700" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* COMMAND_CONSOLE */}
                    <div className="h-20 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-8 relative z-[100]">
                        <button
                            onClick={toggleMute}
                            className={`flex flex-col items-center gap-1 group transition-all ${isMuted ? 'text-red-500' : 'text-slate-400 hover:text-white'}`}
                        >
                            <div className={`w-10 h-10 border flex items-center justify-center transition-all ${isMuted ? 'border-red-500 bg-red-500/10' : 'border-slate-800 group-hover:border-blue-500'}`}>
                                {isMuted ? <FiMicOff size={16} /> : <FiMic size={16} />}
                            </div>
                            <span className="text-[7px] font-black uppercase tracking-widest">{isMuted ? 'MUTED' : 'MIC_ON'}</span>
                        </button>

                        {callType === 'video' && (
                            <button
                                onClick={toggleVideo}
                                className={`flex flex-col items-center gap-1 group transition-all ${isVideoOff ? 'text-red-500' : 'text-slate-400 hover:text-white'}`}
                            >
                                <div className={`w-10 h-10 border flex items-center justify-center transition-all ${isVideoOff ? 'border-red-500 bg-red-500/10' : 'border-slate-800 group-hover:border-blue-500'}`}>
                                    {isVideoOff ? <FiVideoOff size={16} /> : <FiVideo size={16} />}
                                </div>
                                <span className="text-[7px] font-black uppercase tracking-widest">{isVideoOff ? 'VIDEO_OFF' : 'CAM_ON'}</span>
                            </button>
                        )}
                        
                        <div className="absolute right-8 hidden md:block">
                            <span className="text-[7px] font-mono text-slate-700 uppercase tracking-widest">
                                Protocol: WebRTC_P2P // Latency: Stable
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}