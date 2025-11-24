import { create } from 'zustand';

export const usePlaybackStore = create((set) => ({
    playingNow: null,

    setPlayingNow: (songData) => {
        set({ playingNow: songData });
    },

    clearPlayingNow: () => set({ playingNow: null }),
}));

export const usePlaylistStore = create((set) => ({
    allSongs: [],

    setAllSongs: (songsArray) => {
        set({ allSongs: songsArray });
    },

    addSong: (songData) => {
        set((state) => ({ allSongs: [...state.allSongs, songData] }));
    },

    removeSong: (songId) => {
        set((state) => ({
            allSongs: state.allSongs.filter(song => song._id !== songId)
        }));
    },
}));