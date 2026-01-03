'use client';

import { FiPaperclip, FiMic, FiSend, FiZap } from 'react-icons/fi';

export default function CommandTransmissionBar({
    message,
    setMessage,
    sendMessage,
    handleKeyDown,
    isInCall = false
}) {
    return (
        <div className={`bg-slate-950 border-t border-slate-800 p-4 transition-all ${isInCall ? 'opacity-20 pointer-events-none grayscale' : 'opacity-100'}`}>
            <div className='flex items-end space-x-3 max-w-5xl mx-auto'>
                
                {/* ATTACHMENT_NODE */}
                <button
                    className='w-11 h-11 flex items-center justify-center border border-slate-800 text-slate-500 hover:text-blue-400 hover:border-blue-500/50 transition-all disabled:opacity-20'
                    title="ATTACH_FILE"
                    disabled={isInCall}
                >
                    <FiPaperclip className="text-sm" />
                </button>

                {/* INPUT_TERMINAL */}
                <div className='flex-1 relative group'>
                    <div className="absolute -top-6 left-2 flex items-center gap-2">
                        <FiZap className="text-[8px] text-blue-500 animate-pulse" />
                        <span className="text-[7px] font-black tracking-[0.3em] text-slate-600 uppercase">Terminal_Active</span>
                    </div>
                    
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isInCall ? 'SIGNAL_LOCK: IN_CALL_VOICE_OVERRIDE' : 'ENTER_DATA_PACKET...'}
                        rows='1'
                        className='w-full bg-slate-900 border border-slate-800 px-4 py-3 text-[11px] font-medium tracking-wide text-white resize-none outline-none focus:border-blue-500/60 placeholder-slate-700 transition-all disabled:opacity-50'
                        disabled={isInCall}
                    />
                    
                    {/* CORNER ACCENTS */}
                    <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-slate-700" />
                    <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-slate-700" />
                </div>

                {/* TRANSMIT_ACTION */}
                {message.trim() ? (
                    <button
                        onClick={sendMessage}
                        disabled={isInCall}
                        className='bg-blue-600 hover:bg-blue-500 text-white w-11 h-11 flex items-center justify-center transition-all disabled:opacity-20 shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                        title="PUSH_SIGNAL"
                    >
                        <FiSend className="text-sm" />
                    </button>
                ) : (
                    <button
                        className='border border-slate-800 text-slate-500 hover:text-blue-400 w-11 h-11 flex items-center justify-center transition-all disabled:opacity-20'
                        title="AUDIO_SAMPLER"
                        disabled={isInCall}
                    >
                        <FiMic className="text-sm" />
                    </button>
                )}
            </div>
            
            {/* STATUS_LINE */}
            <div className="max-w-5xl mx-auto mt-2 flex justify-between items-center opacity-30">
                <span className="text-[6px] font-mono text-slate-500 tracking-[0.4em] uppercase">Enc_Protocol: TLS_1.3</span>
                <span className="text-[6px] font-mono text-slate-500 tracking-[0.4em] uppercase">Buffer: {message.length}/1024_KB</span>
            </div>
        </div>
    );
}