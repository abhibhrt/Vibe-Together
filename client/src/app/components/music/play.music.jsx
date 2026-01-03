'use client'

import {
    FaPlay,
    FaPause,
    FaStepBackward,
    FaStepForward,
    FaMusic,
} from 'react-icons/fa'
import { useRef, useEffect, useState } from 'react'

export default function MiniPlayer({ music, handlePrev, handleNext }) {
    const playerRef = useRef(null)
    const containerRef = useRef(null)
    const rafRef = useRef(null)

    const [playing, setPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const [loading, setLoading] = useState(true)
    const [thumbnailError, setThumbnailError] = useState(false);

    if (!music) return null

    const getVideoId = (url) => {
        if (!url) return null
        const idMatch = url.match(/(?:youtu\.be\/|v=)([A-Za-z0-9_-]{11})/)
        return idMatch ? idMatch[1] : null
    }

    const getThumbnailUrl = (videoId) => {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    }

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`
    }

    const videoId = getVideoId(music.url)
    if (!videoId) return null

    // --- LOGIC PRESERVED FROM ORIGINAL ---
    useEffect(() => {
        setThumbnailError(false)
    }, [videoId])

    useEffect(() => {
        if (window.YT && window.YT.Player) return
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        tag.async = true
        document.body.appendChild(tag)
    }, [])

    useEffect(() => {
        let mounted = true
        setLoading(true)

        const createPlayer = () => {
            if (!mounted) return
            if (!window.YT || !window.YT.Player) return

            if (playerRef.current) {
                playerRef.current.loadVideoById(videoId)
                return
            }

            playerRef.current = new window.YT.Player(containerRef.current, {
                height: '0',
                width: '0',
                videoId,
                playerVars: {
                    enablejsapi: 1,
                    controls: 0,
                    rel: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    autoplay: 1,
                    mute: 1,
                },
                events: {
                    onReady: (e) => {
                        e.target.playVideo()
                        setTimeout(() => {
                            e.target.unMute()
                        }, 1000)
                    },
                    onStateChange: (e) => {
                        if (e.data !== -1) setLoading(false)
                        setPlaying(e.data === 1)
                        if (e.data === 0 && handleNext) {
                            handleNext()
                        }
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
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [videoId, handleNext]);

    useEffect(() => {
        const tick = () => {
            const p = playerRef.current
            if (p && typeof p.getCurrentTime === 'function') {
                setProgress(p.getCurrentTime())
                setDuration(p.getDuration())
            }
            rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(rafRef.current)
    }, [])

    const togglePlay = () => {
        const p = playerRef.current
        if (!p || loading) return
        const state = p.getPlayerState()
        if (state === 1) p.pauseVideo()
        else p.playVideo()
    }

    const handleSeek = (e) => {
        const pos = Number(e.target.value)
        if (playerRef.current) {
            playerRef.current.seekTo(pos, true)
            setProgress(pos)
        }
    }

    const thumbnailUrl = getThumbnailUrl(videoId)

    return (
        <div className='fixed bottom-0 left-0 w-full bg-slate-950 border-t border-slate-800 text-white flex flex-col z-50 transition-all'>
            {/* HIDDEN_CONTAINER */}
            <div className='absolute top-0 left-0 opacity-0 pointer-events-none'>
                <div ref={containerRef} className='w-0 h-0'></div>
            </div>

            {/* PROGRESS_MONITOR */}
            <div className='w-full relative h-1 bg-slate-900 group'>
                <input
                    type='range'
                    min='0'
                    max={duration || 0}
                    value={progress}
                    onChange={handleSeek}
                    disabled={!duration || loading}
                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                />
                <div 
                    className='h-full bg-blue-600 relative transition-all duration-100'
                    style={{ width: `${(progress / duration) * 100}%` }}
                >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                </div>
            </div>

            <div className='flex items-center justify-between p-4 max-w-7xl mx-auto w-full'>
                {/* ASSET_METADATA */}
                <div className='flex items-center gap-4 w-1/3'>
                    <div className='w-14 h-14 border border-slate-800 bg-slate-900 overflow-hidden flex-shrink-0 relative'>
                        {!thumbnailError ? (
                            <img
                                src={thumbnailUrl}
                                alt="thumb"
                                className='object-cover w-full h-full grayscale opacity-60 hover:grayscale-0 transition-all'
                                onError={() => setThumbnailError(true)}
                            />
                        ) : (
                            <FaMusic className='m-auto text-slate-700' />
                        )}
                        <div className="absolute inset-0 border-inset border-white/5 pointer-events-none" />
                    </div>

                    <div className='flex flex-col min-w-0'>
                        <span className='font-black text-[11px] tracking-tighter uppercase truncate text-slate-100'>
                            {music.music_name}
                        </span>
                        <span className='text-[9px] font-mono text-blue-500 uppercase tracking-widest truncate'>
                            {music.singers?.join(' // ') || 'CONTRIBUTOR_NULL'}
                        </span>
                    </div>
                </div>

                {/* CONTROL_CORE */}
                <div className='flex flex-col items-center gap-2'>
                    <div className='flex items-center gap-8'>
                        <button onClick={handlePrev} className='text-slate-500 hover:text-blue-400 transition-colors'>
                            <FaStepBackward size={14} />
                        </button>

                        <button
                            onClick={togglePlay}
                            disabled={loading}
                            className='w-12 h-12 border border-slate-700 flex items-center justify-center bg-slate-950 hover:border-blue-500 hover:bg-slate-900 transition-all disabled:opacity-30'
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-slate-700 border-t-blue-500 animate-spin" />
                            ) : playing ? (
                                <FaPause size={16} />
                            ) : (
                                <FaPlay size={16} className='ml-1' />
                            )}
                        </button>

                        <button onClick={handleNext} className='text-slate-500 hover:text-blue-400 transition-colors'>
                            <FaStepForward size={14} />
                        </button>
                    </div>
                </div>

                {/* STATUS_LINE */}
                <div className='w-1/3 flex justify-end items-center gap-6'>
                    <div className="hidden lg:flex flex-col items-end opacity-40">
                        <span className="text-[7px] font-mono text-slate-500 uppercase">Buffer_Status</span>
                        <div className="flex gap-0.5 mt-1">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`w-1 h-2 ${playing ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                            ))}
                        </div>
                    </div>
                    <div className='flex items-center font-mono text-[10px] gap-2'>
                        <span className='text-blue-500'>{formatTime(progress)}</span>
                        <span className='text-slate-800'>|</span>
                        <span className='text-slate-500'>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}