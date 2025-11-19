'use client';

import { useState } from 'react';
import Link from 'next/link.js';
import api from '@/utils/api';
import { useUserStore } from '@/store/useUserStore.js';
import { FaHeart, FaMusic, FaUser, FaEnvelope, FaLock, FaArrowLeft, FaStar } from 'react-icons/fa';

export default function SignupPage({ handleBackUser }) {
    const [isLoading, setIsLoading] = useState(false);
    const { setUser } = useUserStore();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await api.post('/api/user/signup', form);
            setUser(res?.data?.user);
            setForm({
                name: '',
                email: '',
                password: ''
            })
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div>
            <div className="w-full max-w-md animate-fade-in">
                <div className="bg-gray-800/70 backdrop-blur-lg p-6 md:p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20">
                    <div className="text-center mb-8">
                        <div className="flex justify-center space-x-2 mb-4">
                            {[1, 2, 3].map((i) => (
                                <FaHeart 
                                    key={i}
                                    className="text-red-400 animate-pulse"
                                    style={{ animationDelay: `${i * 0.3}s` }}
                                />
                            ))}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-300 to-red-300 bg-clip-text text-transparent mb-2 transition-transform duration-300 hover:scale-105">
                            Start Your Love Story
                        </h1>
                        <p className="text-purple-300 text-sm md:text-base">
                            Join our musical world today
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-purple-300 block flex items-center space-x-2">
                                <FaUser className="text-purple-400" />
                                <span>Your Beautiful Name</span>
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleInputChange}
                                placeholder="What should we call you?"
                                className="w-full px-4 py-3 bg-gray-700/80 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white placeholder-purple-300"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-purple-300 block flex items-center space-x-2">
                                <FaEnvelope className="text-purple-400" />
                                <span>Email Address</span>
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleInputChange}
                                placeholder="your.unique@email.com"
                                className="w-full px-4 py-3 bg-gray-700/80 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white placeholder-purple-300"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-purple-300 block flex items-center space-x-2">
                                <FaLock className="text-purple-400" />
                                <span>Secret Password</span>
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleInputChange}
                                placeholder="Create your magical password"
                                className="w-full px-4 py-3 bg-gray-700/80 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white placeholder-purple-300"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 px-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                                isLoading 
                                    ? 'bg-purple-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-purple-600 to-red-600 hover:shadow-lg hover:shadow-purple-500/50'
                            }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Creating Magic...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center space-x-2">
                                    <FaHeart className="text-sm" />
                                    <span>Begin Your Journey</span>
                                </div>
                            )}
                        </button>
                    </form>
                    <div className="mt-6 grid grid-cols-2 gap-3 text-center">
                        {[
                            { icon: FaMusic, text: 'Unlimited Songs' },
                            { icon: FaHeart, text: 'Personalized' },
                            { icon: FaStar, text: 'Premium Quality' },
                            { icon: FaUser, text: 'Your Profile' }
                        ].map((benefit, index) => (
                            <div 
                                key={benefit.text}
                                className="flex items-center space-x-2 justify-center p-2 bg-purple-900/30 rounded-lg border border-purple-500/20 transition-all duration-300 hover:scale-105"
                            >
                                <benefit.icon className="text-purple-400 text-xs" />
                                <span className="text-purple-300 text-xs">{benefit.text}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-purple-500/30 text-center">
                        <p className="text-purple-300 text-sm">
                            Already have an account?{' '}
                            <button 
                                onClick={handleBackUser}
                                className="font-medium bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
                            >
                                Signin
                            </button>
                        </p>
                    </div>
                </div>
                <div className="text-center mt-6">
                    <p className="text-purple-400/70 text-sm italic animate-pulse">
                        "Every great love story starts with a beautiful beginning"
                    </p>
                </div>
                <div className="h-8 md:h-0"></div>
            </div>
        </div>
    );
}