export const CHAT_STATIC = [
    {
        id: 1,
        name: 'Sarah Johnson',
        lastMessage: 'Hey! How are you doing? 💖',
        timestamp: '10:30 AM',
        unread: 2,
        isOnline: true,
        avatar: null,
        messages: [
            { id: 1, text: 'Hey there! 👋', time: '10:25 AM', isMe: false },
            { id: 2, text: 'Hello! How are you?', time: '10:26 AM', isMe: true },
            { id: 3, text: 'I\'m good! Just listening to some music 🎵', time: '10:27 AM', isMe: false },
            { id: 4, text: 'That sounds amazing! What are you listening to?', time: '10:28 AM', isMe: true },
            { id: 5, text: 'Some romantic tracks from The Weeknd 💫', time: '10:29 AM', isMe: false },
            { id: 6, text: 'Hey! How are you doing? 💖', time: '10:30 AM', isMe: false }
        ]
    },
    {
        id: 2,
        name: 'Mike Chen',
        lastMessage: 'Check out this new song!',
        timestamp: 'Yesterday',
        unread: 0,
        isOnline: true,
        avatar: null,
        messages: [
            { id: 1, text: 'Hey, found this amazing track!', time: 'Yesterday', isMe: false },
            { id: 2, text: 'Send it over! 🎧', time: 'Yesterday', isMe: true }
        ]
    },
    {
        id: 3,
        name: 'Emma Davis',
        lastMessage: 'Let\'s create a playlist together',
        timestamp: 'Yesterday',
        unread: 1,
        isOnline: false,
        avatar: null,
        messages: [
            { id: 1, text: 'We should make a collaborative playlist!', time: 'Yesterday', isMe: false },
            { id: 2, text: 'Great idea! What theme?', time: 'Yesterday', isMe: true },
            { id: 3, text: 'Let\'s create a playlist together', time: 'Yesterday', isMe: false }
        ]
    },
    {
        id: 4,
        name: 'Alex Rodriguez',
        lastMessage: 'The concert was amazing!',
        timestamp: 'Monday',
        unread: 0,
        isOnline: true,
        avatar: null,
        messages: [
            { id: 1, text: 'Just came back from the concert!', time: 'Monday', isMe: false },
            { id: 2, text: 'How was it? 🤩', time: 'Monday', isMe: true },
            { id: 3, text: 'The concert was amazing!', time: 'Monday', isMe: false }
        ]
    }
];