'use client'

import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaMusic,
} from 'react-icons/fa'
import { useRef, useEffect, useState } from 'react'

export default function MiniPlayer({ music }) {
  const playerRef = useRef(null)
  const containerRef = useRef(null)
  const rafRef = useRef(null)

  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  // NEW → show loader until player ready
  const [loading, setLoading] = useState(true)

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
    setLoading(true) // NEW → whenever video changes, loader ON

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
            setLoading(false)  // NEW → player ready → stop loader
            e.target.playVideo()

            setTimeout(() => {
              e.target.unMute()
            }, 1000)
          },
          onStateChange: (e) => {
            setPlaying(e.data === 1)
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
  }, [videoId])

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

  return (
    <div className='fixed bottom-16 left-0 w-full bg-gray-900 text-white p-3 shadow-xl border-t border-purple-700/40 flex flex-col z-50'>

      <div className='absolute top-0 left-0 opacity-0 pointer-events-none'>
        <div ref={containerRef} className='w-0 h-0'></div>
      </div>

      <div className='flex items-center justify-between w-full'>
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 rounded-md overflow-hidden bg-gradient-to-br from-purple-700 to-red-700 flex items-center justify-center shadow-md'>
            <FaMusic className='text-white text-lg opacity-80' />
          </div>

          <div className='flex flex-col'>
            <span className='font-semibold text-sm truncate w-32'>
              {music.music_name}
            </span>
            <span className='text-xs text-purple-300 truncate w-32'>
              {music.singers?.join(', ') || 'unknown artist'}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          <button className='p-2 text-purple-300 hover:text-white'>
            <FaStepBackward />
          </button>

          {/* 🔥 Updated Play/Pause with spinner */}
          <button
            onClick={togglePlay}
            disabled={loading}
            className='bg-gradient-to-r from-purple-600 to-red-600 p-3 rounded-full hover:scale-105 transition transform shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : playing ? (
              <FaPause />
            ) : (
              <FaPlay className='ml-1' />
            )}
          </button>

          <button className='p-2 text-purple-300 hover:text-white'>
            <FaStepForward />
          </button>
        </div>
      </div>

      <input
        type='range'
        min='0'
        max={duration || 0}
        value={progress}
        onChange={handleSeek}
        className='w-full mt-3 h-1 rounded-full appearance-none bg-gradient-to-r from-purple-600 to-red-600'
      />
    </div>
  )
}
