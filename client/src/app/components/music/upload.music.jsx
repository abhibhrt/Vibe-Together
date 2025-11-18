'use client';

import { useState, useRef } from 'react';
import { FaUpload, FaMusic, FaFileAudio, FaImage, FaTimes, FaCloudUploadAlt } from 'react-icons/fa';
import api from '@/utils/api';

export default function UploadMusic() {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        audioFile: null,
        coverArt: null
    });
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileSelect = (file) => {
        if (file.type.startsWith('audio/')) {
            setFormData(prev => ({
                ...prev,
                audioFile: file
            }));

            // Create preview for audio file
            const audio = new Audio(URL.createObjectURL(file));
            audio.addEventListener('loadedmetadata', () => {
                setPreview({
                    type: 'audio',
                    duration: audio.duration,
                    url: URL.createObjectURL(file)
                });
            });
        } else if (file.type.startsWith('image/')) {
            setFormData(prev => ({
                ...prev,
                coverArt: file
            }));
            setPreview({
                type: 'image',
                url: URL.createObjectURL(file)
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.audioFile || !formData.title || !formData.artist) {
            alert('Please fill all required fields and select an audio file');
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            const fd = new FormData();
            fd.append('music_name', formData.title);
            fd.append('singers', formData.artist);
            fd.append('audio', formData.audioFile);
            if (formData.coverArt) {
                fd.append('coverArt', formData.coverArt);
            }

            const res = await api.post('/api/music/create', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percent);
                }
            });

            if (res?.status === 200) {
                // Reset form
                setFormData({
                    title: '',
                    artist: '',
                    audioFile: null,
                    coverArt: null
                });
                setPreview(null);
                setProgress(0);

                alert('Music uploaded successfully! 🎵');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const removeFile = () => {
        setFormData(prev => ({ ...prev, audioFile: null, coverArt: null }));
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Upload Form */}
            <div className="bg-gray-800/70 backdrop-blur-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-purple-300 font-medium">Song Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter your song title"
                                className="w-full px-4 py-3 bg-gray-700/80 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white placeholder-purple-300"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-purple-300 font-medium">Artist Name *</label>
                            <input
                                type="text"
                                name="artist"
                                value={formData.artist}
                                onChange={handleInputChange}
                                placeholder="Enter artist name"
                                className="w-full px-4 py-3 bg-gray-700/80 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white placeholder-purple-300"
                                required
                            />
                        </div>
                    </div>

                    {/* File Upload Area */}
                    <div className="space-y-4">
                        <label className="text-purple-300 font-medium">Audio File *</label>

                        <div
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${dragActive
                                    ? 'border-purple-500 bg-purple-500/10'
                                    : 'border-purple-500/30 hover:border-purple-500/50'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {formData.audioFile ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center space-x-3">
                                        <FaFileAudio className="text-purple-400 text-2xl" />
                                        <div className="text-left">
                                            <p className="text-white font-medium">{formData.audioFile.name}</p>
                                            <p className="text-purple-300 text-sm">
                                                {(formData.audioFile.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="text-gray-400 hover:text-red-400 transition-colors duration-300"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>

                                    {preview && preview.type === 'audio' && (
                                        <div className="bg-gray-700/50 rounded-xl p-4">
                                            <p className="text-purple-300 text-sm">
                                                Duration: {Math.floor(preview.duration / 60)}:{(preview.duration % 60).toFixed(0).padStart(2, '0')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <FaUpload className="text-purple-400 text-3xl mx-auto" />
                                    <div>
                                        <p className="text-white font-medium">Drop your audio file here</p>
                                        <p className="text-purple-300 text-sm">or click to browse</p>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleFileInput}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-gradient-to-r from-purple-600 to-red-600 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
                                    >
                                        Choose File
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cover Art Upload */}
                    <div className="space-y-4">
                        <label className="text-purple-300 font-medium">Cover Art (Optional)</label>
                        <div className="flex items-center space-x-4">
                            {preview?.type === 'image' ? (
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={preview.url}
                                        alt="Cover preview"
                                        className="w-16 h-16 rounded-xl object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, coverArt: null }));
                                            setPreview(null);
                                        }}
                                        className="text-gray-400 hover:text-red-400 transition-colors duration-300"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'image/*';
                                        input.onchange = (e) => handleFileSelect(e.target.files[0]);
                                        input.click();
                                    }}
                                    className="w-16 h-16 border-2 border-dashed border-purple-500/30 rounded-xl flex items-center justify-center text-purple-400 hover:border-purple-500/50 hover:text-purple-300 transition-all duration-300"
                                >
                                    <FaImage />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {uploading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-purple-300 text-sm">
                                <span>Uploading...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-purple-600 to-red-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={uploading || !formData.audioFile}
                        className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${uploading || !formData.audioFile
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-red-600 hover:shadow-lg hover:shadow-purple-500/50'
                            }`}
                    >
                        {uploading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Uploading Your Magic...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center space-x-2">
                                <FaMusic />
                                <span>Share Your Song</span>
                            </div>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}