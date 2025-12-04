'use client';

import { useRef, useState, useEffect } from 'react';
import { 
    FaVideo, FaPhone, FaVideoSlash, FaMicrophoneSlash,
    FaTimes, FaPhoneSlash, FaMicrophone
} from 'react-icons/fa';

export default function CallManager({ 
    socket, 
    roomId, 
    user, 
    friend, 
    onCallStart, 
    onCallEnd 
}) {
    const [isInCall, setIsInCall] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const [isReceivingCall, setIsReceivingCall] = useState(false);
    const [callFrom, setCallFrom] = useState('');
    const [callerName, setCallerName] = useState('');
    const [callType, setCallType] = useState('video');
    const [callSignal, setCallSignal] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callRoomId, setCallRoomId] = useState(null);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const localStream = useRef(null);

    const servers = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
        ]
    };

    // Initialize socket listeners
    useEffect(() => {
        if (!socket) return;

        const handleIncomingCall = ({ signal, from, name, type, roomId: incomingRoomId }) => {
            console.log('Incoming call from:', from, 'type:', type);
            setCallSignal(signal);
            setCallFrom(from);
            setCallerName(name);
            setCallType(type);
            setCallRoomId(incomingRoomId);
            setIsReceivingCall(true);
        };

        const handleCallAccepted = ({ signal, from, roomId: acceptedRoomId }) => {
            console.log('Call accepted by:', from);
            if (peerConnection.current && signal) {
                peerConnection.current.setRemoteDescription(
                    new RTCSessionDescription(signal)
                );
                setIsInCall(true);
                setIsCalling(false);
                if (onCallStart) onCallStart();
            }
        };

        const handleCallEnded = () => {
            console.log('Call ended');
            endCall();
            if (onCallEnd) onCallEnd();
        };

        const handleCallRejected = () => {
            console.log('Call rejected');
            alert('Call was rejected');
            setIsCalling(false);
            if (onCallEnd) onCallEnd();
        };

        const handleCallerICE = ({ candidate, from }) => {
            if (peerConnection.current && candidate) {
                peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        };

        const handleCalleeICE = ({ candidate, from }) => {
            if (peerConnection.current && candidate) {
                peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        };

        socket.on('incomingCall', handleIncomingCall);
        socket.on('callAccepted', handleCallAccepted);
        socket.on('callEnded', handleCallEnded);
        socket.on('callRejected', handleCallRejected);
        socket.on('callerICE', handleCallerICE);
        socket.on('calleeICE', handleCalleeICE);

        return () => {
            socket.off('incomingCall', handleIncomingCall);
            socket.off('callAccepted', handleCallAccepted);
            socket.off('callEnded', handleCallEnded);
            socket.off('callRejected', handleCallRejected);
            socket.off('callerICE', handleCallerICE);
            socket.off('calleeICE', handleCalleeICE);
        };
    }, [socket, onCallStart, onCallEnd]);

    // Initialize local video stream
    const initLocalStream = async (type) => {
        try {
            const constraints = {
                audio: true,
                video: type === 'video' ? {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } : false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            localStream.current = stream;
            
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.muted = true;
            }
            
            return stream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw error;
        }
    };

    const createPeerConnection = async () => {
        peerConnection.current = new RTCPeerConnection(servers);

        // Add local stream to connection
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => {
                peerConnection.current.addTrack(track, localStream.current);
            });
        }

        // Handle remote stream
        peerConnection.current.ontrack = (event) => {
            console.log('Received remote stream');
            if (remoteVideoRef.current && event.streams && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // ICE candidate handling
        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate && callRoomId) {
                const target = isCalling ? 'callerICE' : 'calleeICE';
                socket.emit(target, { 
                    roomId: callRoomId, 
                    candidate: event.candidate,
                    to: isCalling ? friend.id : user.id
                });
            }
        };

        peerConnection.current.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', peerConnection.current.iceConnectionState);
            if (peerConnection.current.iceConnectionState === 'disconnected') {
                console.log('ICE connection disconnected');
            }
        };
    };

    // Start a call (caller)
    const startCall = async (type) => {
        try {
            setIsCalling(true);
            setCallType(type);
            setCallRoomId(roomId);

            // Initialize local stream first
            await initLocalStream(type);
            
            // Create peer connection
            await createPeerConnection();

            // Create offer
            const offer = await peerConnection.current.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: type === 'video'
            });
            
            await peerConnection.current.setLocalDescription(offer);

            // Send call signal
            socket.emit('callUser', {
                roomId,
                signalData: offer,
                from: user.id,
                name: user.name || user.email || 'User',
                type
            });

            console.log('Call started, waiting for acceptance...');

        } catch (error) {
            console.error('Error starting call:', error);
            setIsCalling(false);
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                alert('Please allow camera and microphone access to make calls.');
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                alert('No camera/microphone found. Please connect a camera and microphone.');
            } else {
                alert('Failed to start call: ' + error.message);
            }
        }
    };

    // Accept call (callee)
    const acceptCall = async () => {
        try {
            setIsReceivingCall(false);
            setIsInCall(true);
            setCallRoomId(callRoomId || roomId);

            // Initialize local stream
            await initLocalStream(callType);
            
            // Create peer connection
            await createPeerConnection();

            // Set remote description from caller
            await peerConnection.current.setRemoteDescription(
                new RTCSessionDescription(callSignal)
            );

            // Create answer
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);

            // Send acceptance
            socket.emit('acceptCall', {
                signal: answer,
                to: callFrom,
                roomId: callRoomId || roomId
            });

            if (onCallStart) onCallStart();
            console.log('Call accepted');

        } catch (error) {
            console.error('Error accepting call:', error);
            alert('Failed to accept call: ' + error.message);
            endCall();
        }
    };

    // Reject call
    const rejectCall = () => {
        socket.emit('rejectCall', { 
            roomId: callRoomId || roomId, 
            from: user.id 
        });
        setIsReceivingCall(false);
        setCallSignal(null);
    };

    // End call
    const endCall = () => {
        console.log('Ending call...');
        
        // Close peer connection
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        // Stop local stream
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => {
                track.stop();
            });
            localStream.current = null;
        }

        // Clear video elements
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        // Emit end call event
        if (isInCall || isCalling || isReceivingCall) {
            socket.emit('endCall', { 
                roomId: callRoomId || roomId, 
                userId: user.id 
            });
        }

        // Reset state
        setIsInCall(false);
        setIsCalling(false);
        setIsReceivingCall(false);
        setCallSignal(null);
        setIsMuted(false);
        setIsVideoOff(false);
        setCallRoomId(null);

        if (onCallEnd) onCallEnd();
    };

    // Toggle mute
    const toggleMute = () => {
        if (localStream.current) {
            const audioTracks = localStream.current.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    // Toggle video
    const toggleVideo = () => {
        if (localStream.current) {
            const videoTracks = localStream.current.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    return {
        // State
        isInCall,
        isCalling,
        isReceivingCall,
        callFrom,
        callerName,
        callType,
        isMuted,
        isVideoOff,
        
        // Refs
        localVideoRef,
        remoteVideoRef,
        
        // Methods
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleVideo,
        
        // Render components
        CallInterface: () => (
            <>
                {/* Call Modal */}
                {isReceivingCall && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md">
                        <div className="bg-gray-800/90 p-8 rounded-2xl border border-purple-500/30 max-w-md w-full mx-4">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-red-600 flex items-center justify-center">
                                    <FaVideo className="text-white text-3xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Incoming {callType === 'video' ? 'Video' : 'Voice'} Call
                                </h2>
                                <p className="text-purple-300 mb-6">From: {callerName}</p>
                                <div className="flex justify-center space-x-4">
                                    <button
                                        onClick={rejectCall}
                                        className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-transform hover:scale-105"
                                    >
                                        <FaPhoneSlash size={24} />
                                    </button>
                                    <button
                                        onClick={acceptCall}
                                        className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full transition-transform hover:scale-105"
                                    >
                                        <FaPhone size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Call Interface */}
                {isInCall && (
                    <div className="fixed inset-0 bg-black z-40">
                        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
                            <div className="bg-black/50 p-3 rounded-xl">
                                <p className="text-white font-semibold">
                                    {callType === 'video' ? 'Video' : 'Voice'} Call with {friend.name}
                                </p>
                            </div>
                            <button
                                onClick={endCall}
                                className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-transform hover:scale-105"
                            >
                                <FaPhoneSlash size={20} />
                            </button>
                        </div>

                        {/* Remote Video */}
                        <div className="w-full h-full">
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            {callType === 'video' && !remoteVideoRef.current?.srcObject && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-white text-center">
                                        <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                                            <FaVideo className="text-4xl" />
                                        </div>
                                        <p>Waiting for video...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Local Video (Picture-in-picture) */}
                        {callType === 'video' && (
                            <div className="absolute bottom-24 right-4 w-48 h-64 rounded-xl overflow-hidden border-2 border-purple-500 bg-black">
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                {!localVideoRef.current?.srcObject && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                        <FaVideo className="text-white text-2xl" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Call Controls */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                            <button
                                onClick={toggleMute}
                                className={`p-4 rounded-full transition-transform hover:scale-105 ${isMuted ? 'bg-red-600' : 'bg-gray-800/70 hover:bg-gray-700'}`}
                            >
                                {isMuted ? (
                                    <FaMicrophoneSlash className="text-white" size={20} />
                                ) : (
                                    <FaMicrophone className="text-white" size={20} />
                                )}
                            </button>
                            {callType === 'video' && (
                                <button
                                    onClick={toggleVideo}
                                    className={`p-4 rounded-full transition-transform hover:scale-105 ${isVideoOff ? 'bg-red-600' : 'bg-gray-800/70 hover:bg-gray-700'}`}
                                >
                                    {isVideoOff ? (
                                        <FaVideoSlash className="text-white" size={20} />
                                    ) : (
                                        <FaVideo className="text-white" size={20} />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </>
        ),
        
        CallButtons: () => (
            <div className="flex items-center space-x-2">
                {!isCalling && !isInCall && (
                    <>
                        <button
                            onClick={() => startCall('voice')}
                            className="text-green-400 hover:text-green-300 p-2 bg-gray-700/50 rounded-full hover:bg-gray-700 transition-all"
                            title="Voice Call"
                        >
                            <FaPhone size={18} />
                        </button>
                        <button
                            onClick={() => startCall('video')}
                            className="text-blue-400 hover:text-blue-300 p-2 bg-gray-700/50 rounded-full hover:bg-gray-700 transition-all"
                            title="Video Call"
                        >
                            <FaVideo size={18} />
                        </button>
                    </>
                )}
                
                {isCalling && (
                    <div className="flex items-center space-x-2">
                        <span className="text-yellow-400 text-sm animate-pulse">Calling...</span>
                        <button
                            onClick={endCall}
                            className="text-red-400 hover:text-red-300 p-2 bg-gray-700/50 rounded-full hover:bg-gray-700 transition-all"
                            title="Cancel Call"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>
                )}
            </div>
        )
    };
}