'use client';
import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_API_URL, {
    auth: {
        token: typeof window !== 'undefined' ? localStorage.getItem('token') : ''
    }
});