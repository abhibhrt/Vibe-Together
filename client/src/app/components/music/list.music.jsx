'use client';

import { useState, useEffect } from 'react';
import { FiMusic, FiDatabase, FiTrash2, FiYoutube, FiActivity } from 'react-icons/fi';
import api from '@/utils/api';
import DeleteMusic from './remove.music';
import { useUserStore } from '@/store/useUserStore';
import { usePlaybackStore, usePlaylistStore } from '@/store/useSongStore';

export default function AssetIndexTable({ searchQuery }) {
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
    } catch { return null; }
  };

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
      setFetchFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allSongs.length === 0) fetchMusic();
  }, []);

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
    const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

    return (
      <div
        key={music._id}
        className='group relative bg-slate-950 border-b border-slate-900 p-3 hover:bg-blue-950/10 hover:border-blue-900/50 transition-all flex items-center gap-4'
      >
        {/* ASSET_NUMERATION */}
        <span className="text-[9px] font-mono text-slate-700 w-4">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* THUMBNAIL_BUFFER */}
        <div
          onClick={() => handleSetMusic(music)}
          className='relative w-12 h-12 border border-slate-800 bg-slate-900 cursor-pointer overflow-hidden'
        >
          {thumbnail ? (
            <img src={thumbnail} alt="asset" className='w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all' />
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-blue-900/20'>
              <FiMusic className='text-blue-500 text-xs' />
            </div>
          )}
          <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 pointer-events-none" />
        </div>

        {/* METADATA_BLOCK */}
        <div className='flex-1 min-w-0 flex flex-col' onClick={() => handleSetMusic(music)}>
          <div className="flex items-center gap-2">
            <h3 className='text-[12px] font-bold text-slate-200 truncate tracking-tight uppercase'>
              {music.music_name}
            </h3>
            <span className="text-[7px] px-1 border border-slate-800 text-slate-600 font-black">PCM_AUDIO</span>
          </div>
          <p className='text-[10px] font-mono text-blue-500/70 truncate uppercase tracking-tighter'>
            CONTRIBUTOR: {Array.isArray(music.singers) ? music.singers.join(' // ') : music.singers || 'NULL'}
          </p>
        </div>

        {/* ACTION_CONTROL */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[7px] font-mono text-slate-700 uppercase">Status</span>
            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
          </div>
          
          {user && (
            <div className="group-hover:opacity-100 transition-opacity">
               <DeleteMusic
                musicId={music._id}
                publicId={music.public_id}
                url={music.url}
                onDeleted={fetchMusic}
              />
            </div>
          )}
        </div>

        {/* DATA_SOURCE_TAG */}
        <div className="absolute top-1 right-2 flex items-center gap-1 opacity-20 group-hover:opacity-60 transition-opacity">
          <FiYoutube size={8} className="text-red-500" />
          <span className="text-[6px] font-mono text-slate-400">YOUTUBE_NODE</span>
        </div>
      </div>
    );
  };

  return (
    <div className='max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar overflow-x-hidden bg-slate-950/50'>
      {/* TABLE_HEADER */}
      <div className="sticky top-0 bg-slate-900/80 border-b border-slate-800 p-2 flex items-center gap-4 z-10">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-12">Entry_Index // Source_Stream</span>
      </div>

      {filteredMusic.map((music, index) => renderItem(music, index))}

      {loading && (
        <div className='flex flex-col items-center justify-center py-12 gap-3'>
          <div className='w-48 h-1 bg-slate-900 relative overflow-hidden'>
            <div className="absolute inset-0 bg-blue-600 animate-[loading_1.5s_infinite]" style={{ width: '30%' }} />
          </div>
          <span className="text-[8px] font-mono text-blue-500 animate-pulse uppercase tracking-[0.4em]">Recovering_Data_Packets...</span>
        </div>
      )}

      {!loading && filteredMusic.length === 0 && (
        <div className='text-center py-12 border border-dashed border-slate-900 m-4'>
          <FiActivity className="mx-auto text-slate-800 mb-2" />
          <span className="text-[10px] font-mono text-slate-700 uppercase tracking-widest">Search_Query_Returned_Zero_Hits</span>
        </div>
      )}

      {fetchFailed && (
        <div className='text-center py-12 text-red-500 text-[10px] font-black uppercase tracking-[0.3em]'>
          Critical_Error: Failed_To_Initialize_Music_Buffer
        </div>
      )}

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}