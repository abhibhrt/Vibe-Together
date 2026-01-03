'use client';

import { useState, useEffect } from 'react';
import { FiArrowLeft, FiMoreVertical, FiActivity, FiShield, FiCpu } from 'react-icons/fi';
import Link from 'next/link';
import io from 'socket.io-client';
import api from '@/utils/api';
import { useUserStore } from '@/store/useUserStore';

// Institutional Component Imports
import useWebRTC from '@/app/hooks/useWebRTC.js';
import CallInterface from './coms/call.interface.jsx';
import CallButtons from './coms/call.buttons.jsx';
import MessageList from './coms/message.list.jsx';
import MessageInput from './coms/message.input.jsx';

let socket = null;

export default function SignalTerminal({ friend }) {
    const { user } = useUserStore();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [roomId, setRoomId] = useState(null);

    if (!friend) {
        return (
            <div className='flex flex-col items-center justify-center min-h-screen bg-[#020617] gap-4'>
                <FiCpu className="text-slate-800 text-4xl animate-pulse" />
                <span className="text-[10px] font-black tracking-[0.5em] text-slate-700 uppercase">
                    Error_Link_Null: Select_Peer_Node
                </span>
            </div>
        );
    }

    useEffect(() => {
        if (!friend.id) return;

        const initSignalBuffer = async () => {
            try {
                const roomRes = await api.post(`/api/friends/chat/${friend.id}`);
                const roomData = roomRes.data;
                setRoomId(roomData.roomId);

                const msgRes = await api.get(`/api/friends/chat/${friend.id}`);
                const oldMsgs = msgRes.data || [];

                const normalized = oldMsgs.map(msg => ({
                    ...msg,
                    senderId: String(msg.sender?._id || msg.sender)
                }));

                setMessages(normalized);

                socket = io(process.env.NEXT_PUBLIC_API_URL, {
                    withCredentials: true,
                    transports: ['websocket', 'polling']
                });

                socket.emit('joinRoom', roomData.roomId);

                socket.on("serverMessage", (msg) => {
                    const fixed = {
                        ...msg,
                        senderId: String(msg.sender?._id || msg.sender)
                    };
                    setMessages(prev => [...prev, fixed]);
                });

            } catch (error) {
                console.error('[SIGNAL_ERROR]: Buffer initialization failed', error);
            }
        };

        initSignalBuffer();

        return () => {
            if (socket) {
                socket.disconnect();
                socket = null;
            }
        };
    }, [friend.id]);

    const webrtc = useWebRTC(socket, roomId, user, friend);

    const sendMessage = async () => {
        if (!message.trim() || !roomId || !socket) return;
        try {
            const res = await api.post(`/api/friends/message/${roomId}`, { content: message });
            socket.emit("sendMessageServer", { roomId, message: res.data });
            setMessage('');
        } catch (error) {
            console.error('[AUTH_ERROR]: Message purge failed', error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className='h-screen bg-[#020617] flex flex-col relative overflow-hidden'>
            {/* OVERRIDE: CALL INTERFACE */}
            <CallInterface
                {...webrtc}
                friend={friend}
            />

            {/* HEADER: NODE METADATA */}
            <div className={`bg-slate-950/80 border-b border-slate-800 p-4 flex items-center justify-between z-30 backdrop-blur-md transition-all ${webrtc.isInCall ? 'opacity-20 blur-md' : 'opacity-100'}`}>
                <div className='flex items-center gap-4'>
                    <Link href='/' className='md:hidden text-slate-500 hover:text-blue-500 transition-colors'>
                        <FiArrowLeft />
                    </Link>

                    <div className='flex items-center gap-4'>
                        {/* NODE FRAME */}
                        <div className='w-12 h-12 border border-slate-800 bg-slate-900 p-0.5 relative shrink-0'>
                            <img src={friend.avatar} alt={friend.name} className='w-full h-full object-cover grayscale opacity-70' />
                            <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-slate-950' />
                        </div>

                        <div>
                            <div className='flex items-center gap-2'>
                                <h2 className='text-[11px] font-black tracking-[0.2em] text-white uppercase'>{friend.name}</h2>
                                <FiShield className="text-blue-500/50 text-[10px]" />
                            </div>
                            <div className='flex items-center gap-2 mt-0.5'>
                                <FiActivity className={`text-[8px] ${webrtc.isInCall ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
                                <span className='text-[8px] font-mono text-slate-500 uppercase tracking-tighter'>
                                    {webrtc.isInCall ? 'STATUS: VOICE_OVERRIDE' : 'STATUS: SYNC_ACTIVE'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <CallButtons
                        isCalling={webrtc.isCalling}
                        isInCall={webrtc.isInCall}
                        startCall={webrtc.startCall}
                        endCall={webrtc.endCall}
                    />
                    <button className='w-8 h-8 flex items-center justify-center border border-slate-800 hover:border-blue-500/50 text-slate-500 transition-all'>
                        <FiMoreVertical />
                    </button>
                </div>
            </div>

            {/* BUFFER: MESSAGE STREAM */}
            <div className={`flex-1 overflow-hidden transition-all duration-500 ${webrtc.isInCall ? 'opacity-5 blur-xl scale-95' : 'opacity-100'}`}>
                <MessageList messages={messages} user={user} />
            </div>

            {/* INPUT: COMMAND BUFFER */}
            <div className={`p-4 border-t border-slate-800 transition-all ${webrtc.isInCall ? 'opacity-5 blur-md' : 'opacity-100'}`}>
                <MessageInput
                    message={message}
                    setMessage={setMessage}
                    sendMessage={sendMessage}
                    handleKeyDown={handleKeyDown}
                    isInCall={webrtc.isInCall}
                />
                <div className="mt-2 flex justify-between items-center">
                    <span className="text-[7px] font-mono text-slate-700 uppercase tracking-widest">
                        Packet_Encryption: AES_256 // Protocol: WebSocket_Secure
                    </span>
                    <span className="text-[7px] font-mono text-slate-800 uppercase">
                        Latency: 24ms
                    </span>
                </div>
            </div>
        </div>
    );
}