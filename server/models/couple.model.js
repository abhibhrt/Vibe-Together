import mongoose from 'mongoose';

const coupleSchema = new mongoose.Schema(
    {
        user1: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        user2: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        couple_name: {
            type: String,
            required: true,
            trim: true
        },
        playlist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'playlist'
        }
    },
    {
        timestamps: true
    }
);

const Couple =
    mongoose.models.couple || mongoose.model('couple', coupleSchema);

export default Couple;