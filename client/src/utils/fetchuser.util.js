'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore.js';
import api from './api.js';

export const fetchUserUtil = () => {
    const { setUser } = useUserStore();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/api/user/me');
                if (res?.status === 200 && res?.data?.user) {
                    setUser(res.data.user);
                }
            } catch {
                console.log('error occurred');
            }
        };
        fetchUser();
    }, [setUser]);
};