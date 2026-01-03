'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import SigninPage from '../auth/signin.auth';
import SignupPage from '../auth/signup.auth';
import api from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit3, FiCamera, FiSettings, FiShield, FiGlobe, FiCreditCard, FiCpu, FiUser } from 'react-icons/fi';
import SignOutPage from '../auth/signout.auth';

export default function IdentityCore() {
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
      console.error('[REGISTRY_ERROR]: Update sequence failed', err);
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
    <div className='max-w-xl mx-auto'>
      <div className='space-y-8'>
        {/* IDENTITY MODULE */}
        <section className='border border-slate-800 bg-slate-900/20 p-8 rounded-sm relative overflow-hidden'>
          <div className='absolute top-0 right-0 p-2'>
            <span className='text-[8px] font-mono text-slate-700 tracking-tighter uppercase'>
                ID_STATE: {editMode ? 'UNSTABLE_MODIFICATION' : 'ENCRYPTED_STABLE'}
            </span>
          </div>

          <div className='flex flex-col items-center mb-8'>
            <div className='relative group'>
              {/* SPECIMEN FRAME */}
              <div className='relative w-32 h-32 border border-slate-700 bg-[#020617] p-1 overflow-hidden'>
                <div className='absolute inset-0 bg-blue-500/5 pointer-events-none' />
                {preview || user?.avatar?.url ? (
                  <img
                    src={preview || user.avatar.url}
                    alt='specimen'
                    className={`w-full h-full object-cover transition-all ${!editMode && 'opacity-70'}`}
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center bg-slate-900'>
                    <FiUser className='text-slate-700 text-4xl' />
                  </div>
                )}
                
                {/* SCANLINE ANIMATION */}
                <div className='absolute inset-0 w-full h-[2px] bg-blue-500/20 animate-scanline' />
                
                {/* CORNER ACCENTS */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500" />
              </div>

              {editMode && (
                <label className='absolute -bottom-2 -right-2 bg-blue-600 border border-blue-400 p-2 cursor-pointer hover:bg-blue-500 transition-all'>
                  <FiCamera className='text-white text-xs' />
                  <input type='file' accept='image/*' className='hidden' onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>

          <AnimatePresence mode='wait'>
            {editMode ? (
              <motion.div 
                key="edit-fields"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className='space-y-4'
              >
                <div className='grid grid-cols-1 gap-3'>
                    <div className='relative'>
                        <span className='absolute top-2 left-3 text-[7px] font-black text-blue-500/60 uppercase'>Field_Name</span>
                        <input
                            type='text' name='name' value={formData.name} onChange={handleChange}
                            className='w-full pt-6 pb-2 px-3 bg-[#020617] border border-slate-800 text-[10px] font-bold tracking-widest text-white uppercase focus:border-blue-500 outline-none transition-all'
                        />
                    </div>
                    <div className='relative'>
                        <span className='absolute top-2 left-3 text-[7px] font-black text-blue-500/60 uppercase'>Field_Email</span>
                        <input
                            type='email' name='email' value={formData.email} onChange={handleChange}
                            className='w-full pt-6 pb-2 px-3 bg-[#020617] border border-slate-800 text-[10px] font-bold tracking-widest text-white uppercase focus:border-blue-500 outline-none transition-all'
                        />
                    </div>
                </div>
                
                <div className='flex gap-2 pt-2'>
                  <button
                    disabled={loading} onClick={handleUpdate}
                    className='flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black tracking-[0.3em] uppercase py-3 transition-all disabled:opacity-50'
                  >
                    {loading ? 'EXECUTING_UPDATE...' : 'SAVE_MODIFICATIONS'}
                  </button>
                  <button
                    onClick={() => { setPreview(null); setEditMode(false); }}
                    className='px-6 border border-slate-700 text-slate-400 text-[9px] font-black tracking-[0.3em] uppercase hover:bg-slate-800 transition-all'
                  >
                    ABORT
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="display-fields"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className='text-center'
              >
                <h2 className='text-sm font-black tracking-[0.4em] text-white uppercase'>
                  {user?.name || 'NODE_UNNAMED'}
                </h2>
                <p className='text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1'>
                    Network_Alias: {user?.email || 'N/A'}
                </p>

                <button
                  onClick={() => setEditMode(true)}
                  className='mt-6 border border-slate-700 px-6 py-2 text-slate-400 hover:text-blue-400 hover:border-blue-500/50 text-[9px] font-black tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-2 mx-auto'
                >
                  <FiEdit3 className='text-xs' />
                  <span>Modify_Identity</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* SETTINGS MODULE */}
        <section className='px-2'>
          <h3 className='text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase mb-4 flex items-center gap-2'>
            <FiSettings className='text-blue-500' /> System_Preferences
          </h3>
          <div className='space-y-1'>
            {[
              { icon: FiCreditCard, label: 'Asset_Provisioning', sub: 'Subscription' },
              { icon: FiShield, label: 'Data_Isolation', sub: 'Privacy' },
              { icon: FiGlobe, label: 'Locale_Config', sub: 'Language' },
            ].map((item) => (
              <button
                key={item.label}
                className='w-full group flex items-center justify-between p-3 border border-transparent hover:border-slate-800 hover:bg-slate-900/20 transition-all'
              >
                <div className='flex items-center gap-4'>
                  <div className='w-8 h-8 border border-slate-800 bg-[#020617] flex items-center justify-center group-hover:border-blue-500/50 transition-colors'>
                    <item.icon className='text-slate-500 group-hover:text-blue-400 text-xs' />
                  </div>
                  <div className='text-left'>
                    <div className='text-[9px] font-black tracking-widest text-slate-200 uppercase'>{item.label}</div>
                    <div className='text-[7px] font-bold text-slate-600 uppercase tracking-widest'>{item.sub}</div>
                  </div>
                </div>
                <div className='h-1 w-1 rounded-full bg-slate-800 group-hover:bg-blue-500 transition-colors' />
              </button>
            ))}
            
            <div className='mt-8 pt-4 border-t border-slate-800/50'>
                <SignOutPage />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}