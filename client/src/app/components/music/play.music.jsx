'use client'

import {
    FaTimes,
    FaPlay,
    FaPause,
    FaStepBackward,
    FaStepForward,
    FaVolumeUp,
    FaVolumeMute,
    FaEye,
    FaEyeSlash,
    FaMusic
} from 'react-icons/fa'
import { useEffect, useRef, useState } from 'react'

export default function PlayerPopup({ music, onClose }) {
    const playerRef = useRef(null)
    const containerRef = useRef(null)
    const rafRef = useRef(null)

    const [playing, setPlaying] = useState(false)
    const [volume, setVolume] = useState(100)
    const [isMuted, setIsMuted] = useState(false)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const [hideScreen, setHideScreen] = useState(true)
    const [ready, setReady] = useState(false)

    if (!music) return null

    const getVideoId = (url) => {
        if (!url) return null
        const idMatch = url.match(/(?:youtu\.be\/|v=)([A-Za-z0-9_-]{11})/)
        return idMatch ? idMatch[1] : null
    }

    const videoId = getVideoId(music.url)
    if (!videoId) return null

    useEffect(() => {
        if (window.YT && window.YT.Player) return
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        tag.async = true
        document.body.appendChild(tag)
    }, [])

    useEffect(() => {
        let mounted = true

        const createPlayer = () => {
            if (!mounted) return
            if (!window.YT || !window.YT.Player) return

            if (playerRef.current) {
                playerRef.current.loadVideoById(videoId)
                return
            }

            playerRef.current = new window.YT.Player(containerRef.current, {
                height: '100%',
                width: '100%',
                videoId,
                playerVars: {
                    enablejsapi: 1,
                    controls: 1,
                    rel: 0,
                    modestbranding: 1,
                    playsinline: 1
                },
                events: {
                    onReady: (e) => {
                        setReady(true)
                        e.target.setVolume(volume)
                        const d = e.target.getDuration() || 0
                        setDuration(d)
                    },
                    onStateChange: (e) => {
                        const s = e.data
                        if (s === 1) setPlaying(true)
                        if (s === 2 || s === 0) setPlaying(false)
                    }
                }
            })
        }

        if (window.YT && window.YT.Player) createPlayer()
        else {
            const prev = window.onYouTubeIframeAPIReady
            window.onYouTubeIframeAPIReady = () => {
                if (typeof prev === 'function') prev()
                createPlayer()
            }
        }

        return () => {
            mounted = false
            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                playerRef.current.destroy()
                playerRef.current = null
            }
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
        }
    }, [videoId, volume])

    useEffect(() => {
        const tick = () => {
            const p = playerRef.current
            if (p && typeof p.getCurrentTime === 'function') {
                const ct = p.getCurrentTime() || 0
                const d = p.getDuration() || 0
                setProgress(Number(ct.toFixed(2)))
                setDuration(Number(d.toFixed(2)))
            }
            rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
    }, [])

    const togglePlay = () => {
        const p = playerRef.current
        if (!p) return
        const state = p.getPlayerState()
        if (state === 1) p.pauseVideo()
        else p.playVideo()
    }

    const handleSeek = (e) => {
        const val = Number(e.target.value)
        if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
            playerRef.current.seekTo(val, true)
            setProgress(val)
        }
    }

    const toggleMute = () => {
        const p = playerRef.current
        if (!p) return
        if (isMuted) {
            p.unMute()
            setIsMuted(false)
        } else {
            p.mute()
            setIsMuted(true)
        }
    }

    const handleVolume = (e) => {
        const v = Number(e.target.value)
        setVolume(v)
        if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
            playerRef.current.setVolume(v)
            if (v === 0) setIsMuted(true)
            else setIsMuted(false)
        }
    }

    const fmt = (sec) => {
        if (!sec || Number.isNaN(sec)) return '0:00'
        const s = Math.floor(sec)
        const m = Math.floor(s / 60)
        const r = s % 60
        return `${m}:${r.toString().padStart(2, '0')}`
    }

    return (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 animate-fadein'>
            <div className='relative bg-gradient-to-br from-gray-900 to-purple-900/80 border border-purple-500/30 w-[95%] max-w-md p-6 shadow-2xl shadow-purple-500/20 animate-scalein'>

                <div className='flex justify-between items-center mb-6'>
                    <div className='flex items-center space-x-2'>
                        <div className='w-3 h-3 bg-red-500 rounded-full animate-pulse' />
                        <span className='text-purple-300 text-sm font-medium'>Now Playing</span>
                    </div>

                    <div className='flex items-center gap-2'>
                        <button
                            onClick={() => setHideScreen((s) => !s)}
                            className='text-purple-300 bg-white/5 hover:text-white p-2 rounded-full'
                        >
                            {hideScreen ? <FaEye /> : <FaEyeSlash />}
                        </button>

                        <button onClick={onClose} className='text-purple-300 hover:text-red-400 p-2 hover:bg-white/10 rounded-full'>
                            <FaTimes />
                        </button>
                    </div>
                </div>

                <div className='relative mb-6 w-full h-56 rounded-xl overflow-hidden shadow-lg shadow-purple-500/30'>
                    <div
                        ref={containerRef}
                        className={`w-full h-full transition-opacity duration-300 ${hideScreen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    />

                    {hideScreen && (
                        <div className='absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-950 to-red-950 z-10'>
                            <FaMusic className='text-white text-4xl opacity-95' />
                        </div>
                    )}
                </div>

                <div className='text-center mb-4'>
                    <h2 className='text-white text-2xl font-bold truncate'>{music.music_name}</h2>
                    <p className='text-purple-300 text-lg'>{music.singers?.join(', ') || 'unknown artist'}</p>
                </div>

                <div className='mb-2'>
                    <input
                        type='range'
                        min='0'
                        max={Math.max(0, duration)}
                        value={Math.min(progress, duration)}
                        onChange={handleSeek}
                        step='0.1'
                        className='w-full h-2 rounded-full cursor-pointer appearance-none bg-gradient-to-r from-purple-600 to-red-600'
                    />
                    <div className='flex justify-between text-xs text-purple-300 mt-1'>
                        <span>{fmt(progress)}</span>
                        <span>{fmt(duration)}</span>
                    </div>
                </div>

                {/* <div className='mb-6 flex items-center space-x-3'>
                    <button onClick={toggleMute} className='text-purple-300 hover:text-white p-2'>
                        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                    </button>

                    <input
                        type='range'
                        min='0'
                        max='100'
                        value={isMuted ? 0 : volume}
                        onChange={handleVolume}
                        className='w-24 h-1 bg-gray-700 rounded-full cursor-pointer'
                    />
                </div> */}

                <div className='flex items-center justify-center space-x-6'>
                    <button
                        onClick={() => playerRef.current && playerRef.current.seekTo(Math.max(0, (progress || 0) - 10), true)}
                        className='text-purple-300 hover:text-white p-3 hover:bg-white/10 rounded-full'
                    >
                        <FaStepBackward className='text-xl' />
                    </button>

                    <button
                        onClick={togglePlay}
                        className='bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white p-4 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30'
                    >
                        {playing ? <FaPause className='text-xl' /> : <FaPlay className='text-xl ml-1' />}
                    </button>

                    <button
                        onClick={() => playerRef.current && playerRef.current.seekTo(Math.min(duration || 0, (progress || 0) + 10), true)}
                        className='text-purple-300 hover:text-white p-3 hover:bg-white/10 rounded-full'
                    >
                        <FaStepForward className='text-xl' />
                    </button>
                </div>
            </div>
        </div>
    )
}
