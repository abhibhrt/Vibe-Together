'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import SelectedChats from '../components/chats/selected.chats';

export default function ChattingPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');

    return <SelectedChats chatId={id} />;
}