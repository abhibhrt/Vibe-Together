'use client';

import { FaTimes, FaPlay, FaPause, FaStepBackward, FaStepForward, FaVolumeUp, FaVolumeMute, FaMusic } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';

export default function PlayerPopup({ music, onClose }) {
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        setPlaying(false);
        setCurrentTime(0);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [music]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnd = () => setPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnd);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnd);
        };
    }, [music]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (playing) {
            audioRef.current.pause();
            setPlaying(false);
        } else {
            audioRef.current.play();
            setPlaying(true);
        }
    };

    const handleSeek = (e) => {
        if (!audioRef.current) return;
        const seekTime = (e.nativeEvent.offsetX / e.target.offsetWidth) * duration;
        audioRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    const handleVolumeChange = (e) => {
        if (!audioRef.current) return;
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        audioRef.current.volume = newVolume;
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        if (!audioRef.current) return;
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        audioRef.current.volume = newMutedState ? 0 : volume;
    };

    const formatTime = (time) => {
        if (!time) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

    if (!music) return null;

    return (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 animate-fade-in'>
            <div className='bg-gradient-to-br from-gray-900 to-purple-900/80 border border-purple-500/30 w-[95%] max-w-md p-6 animate-scale-in shadow-2xl shadow-purple-500/20'>

                {/* Header */}
                <div className='flex justify-between items-center mb-6'>
                    <div className='flex items-center space-x-2'>
                        <div className='w-3 h-3 bg-red-500 rounded-full animate-pulse'></div>
                        <span className='text-purple-300 text-sm font-medium'>Now Playing</span>
                    </div>
                    <button
                        onClick={onClose}
                        className='text-purple-300 hover:text-red-400 transition-colors duration-300 p-2 hover:bg-white/10 rounded-full'
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Album Art */}
                <div className='relative mb-8'>
                    <div className='w-48 h-48 mx-auto bg-gradient-to-br from-purple-600 to-red-600 rounded-2xl shadow-2xl shadow-purple-500/30 flex items-center justify-center overflow-hidden'>
                        {music.coverArt ? (
                            <img
                                src={music.coverArt}
                                alt={music.music_name}
                                className='w-full h-full object-cover'
                            />
                        ) : (
                            <FaMusic className='text-white text-4xl opacity-80' />
                        )}
                    </div>

                    {/* Rotating disc effect when playing */}
                    {playing && (
                        <div className='absolute inset-0 flex items-center justify-center'>
                            <div className='w-12 h-12 border-4 border-white/20 border-t-purple-400 rounded-full animate-spin'></div>
                        </div>
                    )}
                </div>

                {/* Song Info */}
                <div className='text-center mb-6'>
                    <h2 className='text-white text-2xl font-bold mb-2 truncate'>{music.music_name}</h2>
                    <p className='text-purple-300 text-lg'>
                        {music.singers?.join(', ') || 'Unknown Artist'}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className='mb-6'>
                    <div className='flex justify-between text-purple-300 text-sm mb-2'>
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                    <div
                        className='w-full h-1 bg-gray-700 rounded-full cursor-pointer relative group'
                        onClick={handleSeek}
                    >
                        <div
                            className='h-1 bg-gradient-to-r from-purple-500 to-red-500 rounded-full transition-all duration-200 relative'
                            style={{ width: `${progressPercentage}%` }}
                        >
                            {/* Progress knob */}
                            <div className='w-3 h-3 bg-white rounded-full absolute right-0 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg'></div>
                        </div>
                    </div>
                </div>

                {/* Audio element */}
                <audio ref={audioRef} src={music.url} preload='metadata' />

                {/* Controls */}
                <div className='space-y-4'>
                    {/* Volume Control */}
                    <div className='flex items-center space-x-3'>
                        <button
                            onClick={toggleMute}
                            className='text-purple-300 hover:text-white transition-colors duration-300 p-2'
                        >
                            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-purple-500 [&::-webkit-slider-thumb]:to-red-500"
                        />
                    </div>

                    {/* Main Controls */}
                    <div className='flex items-center justify-center space-x-6'>
                        {/* Previous Button */}
                        <button className='text-purple-300 hover:text-white transition-colors duration-300 p-3 hover:bg-white/10 rounded-full'>
                            <FaStepBackward className='text-xl' />
                        </button>

                        {/* Play/Pause Button */}
                        <button
                            onClick={togglePlay}
                            className='bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white p-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30'
                        >
                            {playing ? <FaPause className='text-xl' /> : <FaPlay className='text-xl ml-1' />}
                        </button>

                        {/* Next Button */}
                        <button className='text-purple-300 hover:text-white transition-colors duration-300 p-3 hover:bg-white/10 rounded-full'>
                            <FaStepForward className='text-xl' />
                        </button>
                    </div>
                </div>

                {/* Additional Info */}
                <div className='mt-6 pt-4 border-t border-purple-500/20'>
                    <div className='flex justify-between text-purple-400 text-xs'>
                        <span>Quality: 320kbps</span>
                        <span>Format: MP3</span>
                    </div>
                </div>
            </div>

            {/* Add CSS animations */}
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scale-in {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in { 
                    animation: fade-in 0.3s ease-out; 
                }
                .animate-scale-in { 
                    animation: scale-in 0.3s ease-out; 
                }
            `}</style>
        </div>
    );
}