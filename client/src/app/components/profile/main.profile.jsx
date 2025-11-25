'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import SigninPage from '../auth/signin.auth';
import SignupPage from '../auth/signup.auth';
import api from '@/utils/api';
import { FaHeart, FaEdit, FaCamera, FaMusic, FaHistory, FaCog } from 'react-icons/fa';
import SignOutPage from '../auth/signout.auth';

export default function Profile() {
  const { user, setUser } = useUserStore();

  const [backuser, setBackuser] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState(user || {
    name: '',
    email: '',
    avatar: null,
  });

  function handleBackUser() {
    setBackuser(!backuser);
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
    setFormData((prev) => ({
      ...prev,
      avatar: file,
    }));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      if (formData.avatar) {
        fd.append('avatar', formData.avatar);
      }

      const res = await api.put('/api/users/update', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res?.status === 200 && res?.data?.user) {
        setUser(res.data.user);
        setPreview(null);
        setEditMode(false);
      }
    } catch (err) {
      console.error('update failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user)
    return backuser ? (
      <SigninPage handleBackUser={handleBackUser} />
    ) : (
      <SignupPage handleBackUser={handleBackUser} />
    );

  return (
    <div>
      <div className='w-full max-w-md space-y-6 animate-fade-in'>
        <div className='bg-gray-800/70 backdrop-blur-lg p-6 shadow-2xl shadow-purple-500/20 transition-all duration-500 hover:shadow-purple-500/30'>
          <div className='relative group mb-6'>
            <div className='relative w-32 h-32 mx-auto'>
              <div className='absolute -inset-2 bg-gradient-to-r from-purple-600 to-red-600 rounded-full opacity-75 group-hover:opacity-100 blur transition-all duration-500 animate-pulse'></div>
              <div className='relative w-32 h-32 bg-gradient-to-br from-purple-700 to-red-700 rounded-full flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105'>
                {preview ? (
                  <img
                    src={preview}
                    alt='avatar'
                    className='w-full h-full object-cover rounded-full'
                  />
                ) : user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt='avatar'
                    className='w-full h-full object-cover rounded-full'
                  />
                ) : (
                  <span className='text-white text-xl font-bold'>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              {editMode && (
                <label className='absolute bottom-2 right-2 bg-gradient-to-r from-purple-600 to-red-600 p-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50'>
                  <FaCamera className='text-white text-sm' />
                  <input
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>
          {editMode ? (
            <div className='space-y-4 animate-slide-up'>
              <div className='space-y-3'>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  placeholder='Your beautiful name'
                  className='w-full p-4 rounded-xl bg-gray-700/80 border border-purple-500/30 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300'
                />
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  placeholder='your.email@romance.com'
                  className='w-full p-4 rounded-xl bg-gray-700/80 border border-purple-500/30 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300'
                />
              </div>
              <div className='space-y-2'>
                <button
                  disabled={loading}
                  onClick={handleUpdate}
                  className='w-full bg-gradient-to-r from-purple-600 to-red-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:transform-none'
                >
                  {loading ? (
                    <div className='flex items-center justify-center space-x-2'>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                      <span>Saving Your Magic...</span>
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  onClick={() => {
                    setPreview(null);
                    setEditMode(false);
                  }}
                  className='w-full bg-gray-700/80 text-white py-4 rounded-xl font-semibold border border-gray-600 transition-all duration-300 hover:bg-gray-600/80 hover:scale-105'
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className='text-center animate-fade-in'>
              <h2 className='text-white text-2xl font-bold bg-gradient-to-r from-purple-200 to-red-200 bg-clip-text text-transparent'>
                {user?.name || 'Beautiful Soul'}
              </h2>
              <p className='text-purple-300 text-sm'>{user?.email || ''}</p>

              <button
                onClick={() => setEditMode(true)}
                className='mt-4 bg-gradient-to-r from-purple-600 to-red-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 flex items-center justify-center space-x-2 mx-auto'
              >
                <FaEdit className='text-sm' />
                <span>Edit Profile</span>
              </button>
            </div>
          )}
        </div>
        <div className='p-2 animate-slide-up'>
          <h3 className='text-white font-semibold mb-4 text-lg flex items-center space-x-2'>
            <FaCog className='text-purple-400' />
            <span>Account Settings</span>
          </h3>
          <div className='space-y-2'>
            {[
              { icon: FaMusic, label: 'Subscription'},
              { icon: FaHeart, label: 'Privacy'},
              { icon: FaCog, label: 'Language'},
            ].map((item, index) => (
              <button
                key={item.label}
                className='w-full text-left group'
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-gradient-to-r from-purple-600 to-red-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300'>
                    <item.icon className='text-white text-sm' />
                  </div>
                  <div>
                    <div className='text-white font-medium'>{item.label}</div>
                  </div>
                </div>
              </button>
            ))}
            <SignOutPage />
          </div>
        </div>
      </div>
    </div>
  );
}