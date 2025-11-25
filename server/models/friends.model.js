import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
    {
        friend1: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        friend2: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        messages: [
            {
                sender: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
                content: { type: String, required: true },
                timestamp: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);

const Friends = mongoose.model("Friends", friendSchema);

export default Friends;