'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
    ]
};

export default function useWebRTC(socket, roomId, user, friend) {
    const [isInCall, setIsInCall] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const [isReceivingCall, setIsReceivingCall] = useState(false);
    const [callFrom, setCallFrom] = useState(null);
    const [callerName, setCallerName] = useState('');
    const [callType, setCallType] = useState('video');
    const [callSignal, setCallSignal] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callRingtone] = useState(typeof Audio !== 'undefined' ? new Audio('/ringtone.mp3') : null);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const localStream = useRef(null);
    const isCaller = useRef(false);

    // Cleanup function
    const cleanup = useCallback(() => {
        console.log('Cleaning up WebRTC...');

        // Stop ringtone
        if (callRingtone) {
            callRingtone.pause();
            callRingtone.currentTime = 0;
        }

        // Close peer connection
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        // Stop local stream
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
            localStream.current = null;
        }

        // Clear video elements
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        isCaller.current = false;
    }, [callRingtone]);

    // Initialize socket listeners
    useEffect(() => {
        if (!socket) return;

        const handleIncomingCall = ({ signal, from, name, type, roomId: incomingRoomId }) => {
            console.log('📞 Incoming call from:', from);
            setCallSignal(signal);
            setCallFrom(from);
            setCallerName(name);
            setCallType(type);
            setIsReceivingCall(true);

            // Play ringtone
            if (callRingtone) {
                callRingtone.loop = true;
                callRingtone.play().catch(e => console.log('Could not play ringtone:', e));
            }
        };

        const handleCallAccepted = (data) => {
            console.log('✅ Call accepted:', data);
            if (peerConnection.current && data.signal) {
                peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.signal))
                    .then(() => {
                        console.log('Remote description set successfully');
                        setIsInCall(true);
                        setIsCalling(false);
                    })
                    .catch(err => console.error('Error setting remote description:', err));
            }
        };

        const handleCallEnded = () => {
            console.log('❌ Call ended');
            cleanup();
            setIsInCall(false);
            setIsCalling(false);
            setIsReceivingCall(false);
            alert('Call ended');
        };

        const handleCallRejected = () => {
            console.log('❌ Call rejected');
            cleanup();
            setIsCalling(false);
            alert('Call rejected');
        };

        const handleCallerICE = (candidate) => {
            console.log('Received caller ICE candidate');
            if (peerConnection.current && candidate) {
                peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
                    .catch(err => console.error('Error adding ICE candidate:', err));
            }
        };

        const handleCalleeICE = (candidate) => {
            console.log('Received callee ICE candidate');
            if (peerConnection.current && candidate) {
                peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
                    .catch(err => console.error('Error adding ICE candidate:', err));
            }
        };

        // Register listeners
        socket.on('incomingCall', handleIncomingCall);
        socket.on('callAccepted', handleCallAccepted);
        socket.on('callEnded', handleCallEnded);
        socket.on('callRejected', handleCallRejected);
        socket.on('callerICE', handleCallerICE);
        socket.on('calleeICE', handleCalleeICE);

        return () => {
            // Cleanup listeners
            socket.off('incomingCall', handleIncomingCall);
            socket.off('callAccepted', handleCallAccepted);
            socket.off('callEnded', handleCallEnded);
            socket.off('callRejected', handleCallRejected);
            socket.off('callerICE', handleCallerICE);
            socket.off('calleeICE', handleCalleeICE);
            cleanup();
        };
    }, [socket, cleanup, callRingtone]);

    const createPeerConnection = useCallback(() => {
        try {
            console.log('Creating peer connection...');
            peerConnection.current = new RTCPeerConnection(servers);

            // Add local stream tracks
            if (localStream.current) {
                localStream.current.getTracks().forEach(track => {
                    peerConnection.current.addTrack(track, localStream.current);
                });
            }

            // Handle remote stream
            peerConnection.current.ontrack = (event) => {
                console.log('Received remote track:', event.track.kind);
                if (remoteVideoRef.current && event.streams[0]) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            // ICE candidate handling
            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate && roomId) {
                    console.log('Sending ICE candidate');
                    const eventName = isCaller.current ? 'callerICE' : 'calleeICE';
                    socket.emit(eventName, { roomId, candidate: event.candidate });
                }
            };

            peerConnection.current.oniceconnectionstatechange = () => {
                console.log('ICE connection state:', peerConnection.current?.iceConnectionState);
            };

            console.log('Peer connection created successfully');
        } catch (error) {
            console.error('Error creating peer connection:', error);
        }
    }, [socket, roomId]);

    const getLocalStream = useCallback(async (type) => {
        try {
            const constraints = {
                audio: true,
                video: type === 'video' ? {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 30 }
                } : false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            localStream.current = stream;

            // Show local video preview
            if (localVideoRef.current && type === 'video') {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.muted = true;
            }

            return stream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw error;
        }
    }, []);

    const startCall = useCallback(async (type) => {
        try {
            console.log('Starting', type, 'call...');
            setIsCalling(true);
            setCallType(type);
            isCaller.current = true;

            // Get local media stream
            await getLocalStream(type);

            // Create peer connection
            createPeerConnection();

            // Create offer
            const offer = await peerConnection.current.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: type === 'video'
            });

            await peerConnection.current.setLocalDescription(offer);

            // Send call invitation
            socket.emit('callUser', {
                roomId,
                signalData: offer,
                from: user.id,
                name: user.name || user.email || 'User',
                type
            });

            console.log('Call invitation sent');
        } catch (error) {
            console.error('Error starting call:', error);
            setIsCalling(false);
            if (error.name === 'NotAllowedError') {
                alert('Please allow camera/microphone access to make calls.');
            } else {
                alert('Failed to start call. Please try again.');
            }
        }
    }, [socket, roomId, user, getLocalStream, createPeerConnection]);

    const acceptCall = useCallback(async () => {
        try {
            console.log('Accepting call...');
            setIsReceivingCall(false);
            setIsInCall(true);
            isCaller.current = false;

            // Stop ringtone
            if (callRingtone) {
                callRingtone.pause();
                callRingtone.currentTime = 0;
            }

            // Get local media stream
            await getLocalStream(callType);

            // Create peer connection
            createPeerConnection();

            // Set remote description from caller's offer
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
                roomId
            });

            console.log('Call accepted and answer sent');
        } catch (error) {
            console.error('Error accepting call:', error);
            alert('Failed to accept call. Please try again.');
            cleanup();
        }
    }, [socket, roomId, callFrom, callType, callSignal, getLocalStream, createPeerConnection, cleanup, callRingtone]);

    const rejectCall = useCallback(() => {
        console.log('Rejecting call...');
        if (callRingtone) {
            callRingtone.pause();
            callRingtone.currentTime = 0;
        }
        socket.emit('rejectCall', { roomId });
        setIsReceivingCall(false);
        setCallSignal(null);
        cleanup();
    }, [socket, roomId, cleanup, callRingtone]);

    const endCall = useCallback(() => {
        console.log('Ending call...');
        socket.emit('endCall', { roomId, userId: user.id });
        cleanup();
        setIsInCall(false);
        setIsCalling(false);
        setIsReceivingCall(false);
    }, [socket, roomId, user.id, cleanup]);

    const toggleMute = useCallback(() => {
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    const toggleVideo = useCallback(() => {
        if (localStream.current) {
            localStream.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    }, [isVideoOff]);

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

        // Cleanup
        cleanup
    };
}