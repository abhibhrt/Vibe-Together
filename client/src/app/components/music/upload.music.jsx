'use client';

import { useState } from 'react';
import { FiMusic, FiLink, FiUser, FiArrowRight, FiActivity } from 'react-icons/fi';
import api from '@/utils/api';

export default function AssetIngestionForm() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        music_name: '',
        singers: '',
        url: ''
    });

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.music_name || !formData.singers || !formData.url) {
            alert('CRITICAL: REQUIRE_ALL_FIELDS_FILLED');
            return;
        }

        setLoading(true);

        try {
            const res = await api.post('/api/musics/create', formData);
            setFormData({
                music_name: '',
                singers: '',
                url: ''
            });
        } catch (err) {
            console.error(err);
            alert('INGESTION_FAILURE: SERVER_REJECTED_PACKET');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500'>
            <div className='bg-slate-950 border border-slate-800 p-8 relative'>
                {/* CORNER_ACCENT */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-blue-500/20" />
                
                <div className="mb-8 flex items-center gap-3">
                    <div className="w-2 h-6 bg-blue-600" />
                    <h2 className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase">
                        INGESTION_PROTOCOL_v2.0
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className='space-y-8'>
                    {/* ENTRY_TITLE */}
                    <div className='group'>
                        <label className='text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 block group-focus-within:text-blue-500 transition-colors'>
                            [01] Song_Title_ID
                        </label>
                        <div className="relative">
                            <FiMusic className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" />
                            <input
                                type='text'
                                name='music_name'
                                value={formData.music_name}
                                onChange={handleChange}
                                placeholder='ST_NAME_HERE'
                                className='w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 text-[12px] font-mono text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-all'
                            />
                        </div>
                    </div>

                    {/* CONTRIBUTOR_DATA */}
                    <div className='group'>
                        <label className='text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 block group-focus-within:text-blue-500 transition-colors'>
                            [02] Contributor_Strings
                        </label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" />
                            <input
                                type='text'
                                name='singers'
                                value={formData.singers}
                                onChange={handleChange}
                                placeholder='ARRAY_OF_ARTISTS'
                                className='w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 text-[12px] font-mono text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-all'
                            />
                        </div>
                    </div>

                    {/* SOURCE_LINK */}
                    <div className='group'>
                        <label className='text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 block group-focus-within:text-blue-500 transition-colors'>
                            [03] External_Source_URI
                        </label>
                        <div className="relative">
                            <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" />
                            <input
                                type='text'
                                name='url'
                                value={formData.url}
                                onChange={handleChange}
                                placeholder='HTTPS://YOUTU.BE/...'
                                className='w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 text-[12px] font-mono text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-all'
                            />
                        </div>
                    </div>

                    {/* EXECUTE_BUTTON */}
                    <button
                        type='submit'
                        disabled={loading}
                        className={`w-full group relative overflow-hidden py-4 border transition-all duration-300 
                            ${loading
                                ? 'bg-slate-900 border-slate-800 cursor-not-allowed'
                                : 'bg-blue-600 border-blue-500 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                            }`}
                    >
                        <div className='flex items-center justify-center space-x-3'>
                            {loading ? (
                                <>
                                    <FiActivity className='w-4 h-4 text-white animate-pulse' />
                                    <span className='text-[10px] font-black uppercase tracking-[0.3em]'>COMMITTING_TO_DB...</span>
                                </>
                            ) : (
                                <>
                                    <span className='text-[10px] font-black uppercase tracking-[0.3em]'>EXECUTE_INGESTION</span>
                                    <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                                </>
                            )}
                        </div>
                    </button>
                </form>
            </div>
            
            {/* SYSTEM_FOOTER */}
            <div className="flex justify-between items-center px-2">
                <span className="text-[7px] font-mono text-slate-700 uppercase">Input_Terminal_01</span>
                <span className="text-[7px] font-mono text-slate-700 uppercase">Ready_for_stream_input</span>
            </div>
        </div>
    );
}