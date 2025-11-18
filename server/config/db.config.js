// Depedencies Imported
import mongoose from "mongoose";

export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('database connected');
    } catch (err) {
        console.log('database connection error:', err.message);
        process.exit(1);
    }
};