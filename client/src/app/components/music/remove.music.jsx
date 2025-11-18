'use client';

import { useState } from 'react';
import api from '@/utils/api';
import { FaTrash} from 'react-icons/fa';

export default function DeleteMusic({ musicId, publicId, url, onDeleted = () => {} }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (loading) return;

    const ok = window.confirm('are you sure you want to delete this music?');
    if (!ok) return;

    try {
      setLoading(true);

      await api.delete(`/api/music/remove/${musicId}`, {
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
      className='text-red-400 text-xs underline hover:text-red-500 transition lowercase'
    >
      {loading ? 'deleting...' : <FaTrash className='text-xl' />}
    </button>
  );
}