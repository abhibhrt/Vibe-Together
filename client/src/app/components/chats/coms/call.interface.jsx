'use client';

import {
    FaVideo, FaPhone, FaVideoSlash, FaMicrophoneSlash,
    FaTimes, FaPhoneSlash, FaMicrophone
} from 'react-icons/fa';

export default function CallInterface({
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
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo
}) {
    return (
        <>
            {/* Incoming Call Modal */}
            {isReceivingCall && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-lg">
                    <div className="bg-gradient-to-br from-purple-800/90 to-gray-900/90 p-8 rounded-3xl border-2 border-purple-500/50 max-w-md w-full mx-4 shadow-2xl">
                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center animate-pulse">
                                <FaVideo className="text-white text-4xl" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-3">
                                Incoming {callType === 'video' ? 'Video' : 'Voice'} Call
                            </h2>
                            <p className="text-purple-300 text-lg mb-2">From:</p>
                            <p className="text-white text-2xl font-semibold mb-8">{callerName}</p>
                            <div className="flex justify-center space-x-6">
                                <button
                                    onClick={rejectCall}
                                    className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white p-5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-red-500/50"
                                >
                                    <FaPhoneSlash size={28} />
                                </button>
                                <button
                                    onClick={acceptCall}
                                    className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white p-5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-green-500/50"
                                >
                                    <FaPhone size={28} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Call Interface */}
            {isInCall && (
                <div className="fixed inset-0 bg-black z-40">
                    {/* Top Bar */}
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                        <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-purple-500/30">
                            <p className="text-white font-bold text-lg">
                                {callType === 'video' ? '📹 Video' : '📞 Voice'} Call with {friend.name}
                            </p>
                        </div>
                        <button
                            onClick={endCall}
                            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110"
                        >
                            <FaPhoneSlash size={22} />
                        </button>
                    </div>

                    {/* Remote Video */}
                    <div className="w-full h-full relative">
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        {callType === 'video' && !remoteVideoRef.current?.srcObject && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                <div className="text-center">
                                    <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-800/80 flex items-center justify-center">
                                        <FaVideo className="text-white text-5xl" />
                                    </div>
                                    <p className="text-white text-xl">Waiting for {friend.name}'s video...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Local Video Preview (Picture-in-picture) */}
                    {callType === 'video' && (
                        <div className="absolute bottom-32 right-6 w-56 h-72 rounded-2xl overflow-hidden border-3 border-purple-500/70 bg-black shadow-2xl">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                            {!localVideoRef.current?.srcObject && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                    <FaVideo className="text-white text-3xl" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Call Controls */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-6">
                        <button
                            onClick={toggleMute}
                            className={`p-5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${isMuted
                                ? 'bg-gradient-to-r from-red-600 to-red-800 hover:shadow-red-500/50'
                                : 'bg-gradient-to-r from-gray-800/80 to-gray-900/80 hover:shadow-white/20'}`}
                        >
                            {isMuted ? (
                                <FaMicrophoneSlash className="text-white" size={24} />
                            ) : (
                                <FaMicrophone className="text-white" size={24} />
                            )}
                        </button>

                        {callType === 'video' && (
                            <button
                                onClick={toggleVideo}
                                className={`p-5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${isVideoOff
                                    ? 'bg-gradient-to-r from-red-600 to-red-800 hover:shadow-red-500/50'
                                    : 'bg-gradient-to-r from-gray-800/80 to-gray-900/80 hover:shadow-white/20'}`}
                            >
                                {isVideoOff ? (
                                    <FaVideoSlash className="text-white" size={24} />
                                ) : (
                                    <FaVideo className="text-white" size={24} />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}