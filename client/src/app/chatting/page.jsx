'use client'

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SelectedChats from '../components/chats/selected.chats';

function ChattingInner() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')

    return (
        <SelectedChats
            chatId={id}
        />
    )
}

export default function ChattingPage() {
    return (
        <Suspense fallback={
            <div className="text-white p-4">loading...</div>
        }>
            <ChattingInner />
        </Suspense>
    )
}
