import { create } from 'zustand';

export const useSongStore = create((set) => ({
    song: null,
    setSong: (songData) => {
        set({ song: songData })
    },
    clearSong: () => set({ song: null }),
}));