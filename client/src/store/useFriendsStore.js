import { create } from 'zustand';

export const useFriendsStore = create((set) => ({
    friends: [],
    setFriends: (friendsData) => {
        set({ friends: friendsData })
    },
    clearFriends: () => set({ friends: [] }),
}));