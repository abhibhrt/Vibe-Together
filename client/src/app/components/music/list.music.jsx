'use client';

import { useState, useEffect, useRef } from 'react';
import { FaMusic } from 'react-icons/fa';
import api from '@/utils/api';
import DeleteMusic from './remove.music';
import { useUserStore } from '@/store/useUserStore';
import { useSongStore } from '@/store/useSongStore';

export default function ListMusic({ searchQuery }) {
  const [musicList, setMusicList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { user } = useUserStore();
  const { setSong } = useSongStore();

  const containerRef = useRef(null);

  // ========== fetch ==========
  const fetchMusic = async (pageNum = 1) => {
    if (loading) return;

    setLoading(true);
    setFetchFailed(false);

    try {
      const res = await api.get(`/api/music?page=${pageNum}&q=${searchQuery || ''}`);

      if (res?.data?.music) {
        if (pageNum === 1) {
          setMusicList(res.data.music);
        } else {
          setMusicList(prev => [...prev, ...res.data.music]);
        }

        setHasMore(res.data.music.length === 10);
        setPage(pageNum);
      } else {
        setFetchFailed(true);
      }

    } catch (err) {
      console.error('fetch error:', err);
      setFetchFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setMusicList([]);
    fetchMusic(1);
  }, [searchQuery]);

  // infinite scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      if (loading || !hasMore) return;

      const nearBottom =
        container.scrollHeight - container.scrollTop <= container.clientHeight + 100;

      if (nearBottom) fetchMusic(page + 1);
    };

    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, [loading, hasMore, page]);

  // item ui
  const renderItem = (music, index) => (
    <div
      key={music._id}
      className='bg-gray-800/70 cursor-pointer backdrop-blur-lg rounded-2xl p-4 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 animate-fade-in'
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className='flex items-center space-x-4'>
        <div className='relative'>
          <div onClick={() => setSong(music)} className='w-16 h-16 bg-gradient-to-br from-purple-600 to-red-600 rounded-xl flex items-center justify-center'>
            <FaMusic className='text-white text-xl' />
          </div>
        </div>

        <div className='flex-1 min-w-0'>
          <h3 onClick={() => setSong(music)} className='text-white font-semibold truncate'>
            {music.music_name}
          </h3>

          <p className='text-purple-300 text-sm truncate'>
            {music.singers?.join(', ') || 'unknown'}
          </p>
        </div>
        {
          user && (
            <DeleteMusic
              musicId={music._id}
              publicId={music.public_id}
              url={music.url}
              onDeleted={() => fetchMusic(1)}
            />
          )
        }
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={containerRef}
        className='music-container max-h-[calc(100vh-140px)] overflow-y-auto space-y-3'
      >
        {musicList.map((music, index) => renderItem(music, index))}

        {loading && (
          <div className='flex justify-center py-6'>
            <div className='w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin' />
          </div>
        )}

        {!hasMore && !loading && (
          <div className='text-center py-6 text-purple-300'>
            end of results
          </div>
        )}

        {fetchFailed && (
          <div className='text-center py-6 text-red-400 text-sm'>
            failed to load music
          </div>
        )}
      </div>
    </>
  );
}