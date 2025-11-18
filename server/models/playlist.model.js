import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema(
    {
        couple_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'couple',
            default: null
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            default: null
        },
        playlist_name: {
            type: String,
            required: true,
            trim: true
        },
        music_ids: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'music',
                default: []
            }
        ]
    },
    {
        timestamps: true
    }
);

const Playlist =
    mongoose.models.playlist || mongoose.model('playlist', playlistSchema);

export default Playlist;