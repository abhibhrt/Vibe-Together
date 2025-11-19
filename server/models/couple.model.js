import mongoose from 'mongoose';

const coupleSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        duplex: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Couple = mongoose.models.couple || mongoose.model('couple', coupleSchema);

export default Couple;