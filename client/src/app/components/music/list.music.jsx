'use client';

import { useState, useEffect } from 'react';
import { FaMusic } from 'react-icons/fa';
import api from '@/utils/api';
import DeleteMusic from './remove.music';
import { useUserStore } from '@/store/useUserStore';
import { usePlaybackStore, usePlaylistStore } from '@/store/useSongStore';

export default function ListMusic({ searchQuery }) {
  const [filteredMusic, setFilteredMusic] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);

  const { user } = useUserStore();
  const { setPlayingNow } = usePlaybackStore();
  const { setAllSongs, allSongs } = usePlaylistStore();

  const getYoutubeId = (url) => {
    try {
      if (!url) return null;
      if (url.includes('youtu.be')) return url.split('youtu.be/')[1].split('?')[0];
      return new URL(url).searchParams.get('v');
    } catch {
      return null;
    }
  };

  // fetch ALL songs once
  const fetchMusic = async () => {
    setLoading(true);
    setFetchFailed(false);

    try {
      const res = await api.get(`/api/musics/getall`);

      if (res?.data?.music) {
        setFilteredMusic(res.data.music);
        setAllSongs(res.data.music);
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
    if (allSongs.length === 0)
      fetchMusic();
  }, []);

  // local filter (song name + singer name)
  useEffect(() => {
    if (!searchQuery) {
      setFilteredMusic(allSongs);
      return;
    }

    const q = searchQuery.toLowerCase();

    const filtered = allSongs.filter((item) => {
      const nameMatch = item.music_name?.toLowerCase().includes(q);

      const singerMatch = Array.isArray(item.singers)
        ? item.singers.some(s => s.toLowerCase().includes(q))
        : item.singers?.toLowerCase().includes(q);

      return nameMatch || singerMatch;
    });

    setFilteredMusic(filtered);
  }, [searchQuery, allSongs]);

  const handleSetMusic = (music) => {
    setPlayingNow(null);
    setTimeout(() => setPlayingNow(music), 1);
  };

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
          <div
            onClick={() => handleSetMusic(music)}
            className='w-16 h-16 rounded-xl overflow-hidden bg-gray-700'
          >
            {thumbnail ? (
              <img src={thumbnail} alt={music.music_name} className='w-full h-full object-cover' />
            ) : (
              <div className='w-full h-full bg-gradient-to-br from-purple-600 to-red-600 flex items-center justify-center'>
                <FaMusic className='text-white text-xl' />
              </div>
            )}
          </div>

          <div className='flex-1 min-w-0'>
            <h3 onClick={() => handleSetMusic(music)} className='text-white font-semibold truncate'>
              {music.music_name}
            </h3>
            <p className='text-purple-300 text-sm truncate'>
              {Array.isArray(music.singers) ? music.singers.join(', ') : music.singers || 'unknown'}
            </p>
          </div>

          {user && (
            <DeleteMusic
              musicId={music._id}
              publicId={music.public_id}
              url={music.url}
              onDeleted={fetchMusic}
            />
          )}
        </div>

        <p className='absolute bottom-2 right-4 text-[10px] text-purple-400 opacity-70'>
          source: youtube
        </p>
      </div>
    );
  };

  return (
    <div className='music-container max-h-[calc(100vh-140px)] overflow-y-auto'>
      {filteredMusic.map((music, index) => renderItem(music, index))}

      {loading && (
        <div className='flex justify-center py-6'>
          <div className='w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin' />
        </div>
      )}

      {!loading && filteredMusic.length === 0 && (
        <div className='text-center py-6 text-purple-300'>
          no results found
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