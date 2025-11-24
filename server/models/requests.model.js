import mongoose from 'mongoose';

const RequestsSchema = new mongoose.Schema(
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

const Requests = mongoose.models.Requests || mongoose.model('Requests', RequestsSchema);

export default Requests;