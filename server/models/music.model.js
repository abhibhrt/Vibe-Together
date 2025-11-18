import mongoose from 'mongoose';

const musicSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true
        },
        music_name: {
            type: String,
            required: true,
            trim: true
        },
        singers: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Music = mongoose.models.music || mongoose.model('music', musicSchema);

export default Music;