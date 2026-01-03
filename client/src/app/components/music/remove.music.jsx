'use client';

import { useState } from 'react';
import api from '@/utils/api';
import { FiTrash2, FiAlertCircle } from 'react-icons/fi';

export default function DeleteMusic({ musicId, publicId, url, onDeleted = () => {} }) {
  const [loading, setLoading] = useState(false);

  // --- LOGIC PRESERVED FROM ORIGINAL ---
  async function handleDelete() {
    if (loading) return;

    const ok = window.confirm('are you sure you want to delete this music?');
    if (!ok) return;

    try {
      setLoading(true);

      await api.delete(`/api/musics/remove/${musicId}`, {
        data: { public_id: publicId, url }
      });

      setLoading(false);
      onDeleted();
    } catch (err) {
      console.error('delete error:', err);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`
        relative group flex items-center justify-center
        w-10 h-10 border transition-all duration-200
        ${loading 
          ? 'bg-red-950/20 border-red-500/50 cursor-wait' 
          : 'bg-slate-950 border-slate-800 hover:border-red-600 hover:bg-red-600/5 text-slate-500 hover:text-red-500'
        }
      `}
      title="PURGE_ASSET"
    >
      {loading ? (
        <div className="flex flex-col items-center gap-1">
          <div className="w-3 h-3 border border-red-500 border-t-transparent animate-spin" />
          <span className="text-[6px] font-black text-red-500 uppercase tracking-tighter">PURGING</span>
        </div>
      ) : (
        <div className="relative">
          <FiTrash2 size={16} className="group-hover:scale-110 transition-transform" />
          {/* HOVER_ACCENT */}
          <div className="absolute -top-1 -right-1 w-1 h-1 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* TECHNICAL_OVERLAY */}
      {!loading && (
        <div className="absolute inset-x-0 -bottom-8 opacity-0 group-hover:opacity-100 pointer-events-none flex justify-center">
            <span className="text-[7px] font-mono bg-red-600 text-white px-1 py-0.5 whitespace-nowrap">
                CMD: PURGE_ASSET_ID_{musicId?.substring(0, 4)}
            </span>
        </div>
      )}
    </button>
  );
}