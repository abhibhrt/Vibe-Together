'use client'

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SelectedChats from '../components/chats/selected.chats';
import { useFriendsStore } from '@/store/useFriendsStore';

function ChattingInner() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const { friends } = useFriendsStore();
    const friend = friends.find(f => f.id === id) || null;

    return <SelectedChats friend={friend} />;
}

export default function ChattingPage() {
    return (
        <Suspense fallback={<div className='text-white p-4'>loading...</div>}>
            <ChattingInner />
        </Suspense>
    );
}
