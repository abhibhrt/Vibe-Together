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

  // extract youtube video id
  const getYoutubeId = (url) => {
    try {
      if (!url) return null;

      if (url.includes('youtu.be')) {
        return url.split('youtu.be/')[1].split('?')[0];
      }

      const params = new URL(url).searchParams;
      return params.get('v');
    } catch {
      return null;
    }
  };

  // fetch music
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

  const handleSetMusic = (music) => {
  setSong(null);

  setTimeout(() => {
    setSong(music);
  }, 100);
};
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

  // card ui
  const renderItem = (music, index) => {
    const videoId = getYoutubeId(music.url);
    const thumbnail = videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : null;

    return (
      <div
        key={music._id}
        className='relative bg-gray-800/70 cursor-pointer backdrop-blur-lg p-4 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 animate-fade-in'
        style={{ animationDelay: `${index * 0.06}s` }}
      >
        <div className='flex items-center space-x-4'>
          {/* thumbnail */}
          <div className='relative'>
            <div
              onClick={() => handleSetMusic(music)}
              className='w-16 h-16 rounded-xl overflow-hidden bg-gray-700'
            >
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={music.music_name}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full bg-gradient-to-br from-purple-600 to-red-600 flex items-center justify-center'>
                  <FaMusic className='text-white text-xl' />
                </div>
              )}
            </div>
          </div>

          {/* title + singer */}
          <div className='flex-1 min-w-0'>
            <h3
              onClick={() => handleSetMusic(music)}
              className='text-white font-semibold truncate'
            >
              {music.music_name}
            </h3>

            <p className='text-purple-300 text-sm truncate'>
              {music.singers?.join(', ') || 'unknown'}
            </p>
          </div>

          {/* delete */}
          {user && (
            <DeleteMusic
              musicId={music._id}
              publicId={music.public_id}
              url={music.url}
              onDeleted={() => fetchMusic(1)}
            />
          )}
        </div>

        {/* youtube credit */}
        <p className='absolute bottom-2 right-4 text-[10px] text-purple-400 opacity-70'>
          source: youtube
        </p>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className='music-container max-h-[calc(100vh-140px)] overflow-y-auto'
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
  );
}
