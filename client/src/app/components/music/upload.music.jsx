'use client';

import { useState } from 'react';
import { FaMusic } from 'react-icons/fa';
import api from '@/utils/api';

export default function UploadMusic() {
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
            alert('please fill all required fields');
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
            alert('failed to upload');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='space-y-6 animate-fade-in'>
            <div className='bg-gray-800/70 backdrop-blur-lg p-6'>

                <form onSubmit={handleSubmit} className='space-y-6'>
                    {/* music name */}
                    <div className='space-y-2'>
                        <label className='text-purple-300 font-medium'>Song Title</label>
                        <input
                            type='text'
                            name='music_name'
                            value={formData.music_name}
                            onChange={handleChange}
                            placeholder='Enter Song Title'
                            className='w-full px-4 py-3 bg-gray-700/80 border border-purple-500/30 rounded-xl 
                                       focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300'
                        />
                    </div>

                    {/* singers */}
                    <div className='space-y-2'>
                        <label className='text-purple-300 font-medium'>Artists</label>
                        <input
                            type='text'
                            name='singers'
                            value={formData.singers}
                            onChange={handleChange}
                            placeholder='Enter Artists'
                            className='w-full px-4 py-3 bg-gray-700/80 border border-purple-500/30 rounded-xl 
                                       focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300'
                        />
                    </div>

                    {/* url */}
                    <div className='space-y-2'>
                        <label className='text-purple-300 font-medium'>YouTube Url</label>
                        <input
                            type='text'
                            name='url'
                            value={formData.url}
                            onChange={handleChange}
                            placeholder='Paste YouTube URL'
                            className='w-full px-4 py-3 bg-gray-700/80 border border-purple-500/30 rounded-xl 
                                       focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300'
                        />
                    </div>

                    {/* submit */}
                    <button
                        type='submit'
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 
                                   transform hover:scale-105
                                   ${loading
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-red-600 hover:shadow-lg hover:shadow-purple-500/50'
                            }`}
                    >
                        {loading ? (
                            <div className='flex items-center justify-center space-x-2'>
                                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                                <span>saving...</span>
                            </div>
                        ) : (
                            <div className='flex items-center justify-center space-x-2'>
                                <FaMusic />
                                <span>Add Content</span>
                            </div>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}