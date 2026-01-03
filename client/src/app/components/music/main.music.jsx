'use client';

import { useState } from 'react';
import { FiSearch, FiPlus, FiDatabase, FiUploadCloud, FiActivity } from 'react-icons/fi';
import ListMusic from './list.music';
import UploadMusic from './upload.music';
import { useUserStore } from '@/store/useUserStore';

export default function AudioAssetManager() {
    const { user } = useUserStore();
    const [activeTab, setActiveTab] = useState(true); // true = List, false = Ingest
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col">
            {/* SEARCH_AND_CONTROL_BAR */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="QUERY_INDEX: SONG_TITLE, ARTIST_ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 px-10 py-2.5 text-[11px] font-mono text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all"
                            />
                            {/* CORNER_ACCENTS */}
                            <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-slate-700" />
                            <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-slate-700" />
                        </div>
                    </div>

                    {user && (
                        <button
                            onClick={() => setActiveTab(!activeTab)}
                            className={`flex items-center gap-3 px-4 py-2.5 transition-all border ${
                                activeTab 
                                ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-blue-500/50' 
                                : 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                            }`}
                        >
                            <span className="text-[10px] font-black tracking-widest uppercase hidden md:block">
                                {activeTab ? 'INGEST_NEW_ASSET' : 'EXIT_INGEST_MODE'}
                            </span>
                            <FiPlus className={`transition-transform duration-500 ${activeTab ? 'rotate-0' : 'rotate-45'}`} />
                        </button>
                    )}
                </div>
            </div>

            {/* HEADER_METADATA */}
            <div className="p-2 max-w-7xl mx-auto w-full">
                <div className="flex items-end gap-4 mb-2">
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20">
                        <FiDatabase className="text-blue-500 text-xl" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-bold text-white tracking-tighter uppercase">
                            {activeTab ? 'CORE_AUDIOS' : 'ASSET_INGESTION'}
                        </h2>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <FiActivity className="text-emerald-500 text-[10px] animate-pulse" />
                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                        {activeTab 
                            ? 'Indexing_Complete // Total_Assets: 2,491 // Status: Ready' 
                            : 'Awaiting_File_Stream // Protocol: S3_Direct_Upload'}
                    </p>
                </div>
            </div>

            {/* DATA_STREAM_VIEW */}
            <div className="flex-1 px-0 pb-8 max-w-7xl mx-auto w-full transition-all duration-500">
                <div className="border border-slate-800 bg-slate-950/30 p-1">
                    <div className="border border-slate-800/50 min-h-[400px]">
                        {activeTab ? (
                            <ListMusic searchQuery={searchQuery} />
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <UploadMusic />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .animate-in {
                    animation-fill-mode: forwards;
                }
            `}</style>
        </div>
    );
}