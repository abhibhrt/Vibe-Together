// Packages Imported
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Modules Imported
import { connectDb } from './config/db.config.js';

// Routes Imported
import AuthRoutes from './routes/user.route.js';
import CoupleRoute from './routes/couple.route.js';
import PlaylistRoute from './routes/playlist.route.js';
import MusicRoute from './routes/music.route.js';

// Modules Applied
dotenv.config();
const app = express();
connectDb();

// Middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'https://vibe-together.vercel.app',
        credentials: true
    })
);

// Routes
app.use('/api/user', AuthRoutes);
app.use('/api/couple', CoupleRoute);
app.use('/api/playlist', PlaylistRoute);
app.use('/api/music', MusicRoute);

// Health Check
app.get('/', (req, res) => {
    res.status(200).json({ message: 'api running..' });
});

// Server Listen
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`api running port: ${port}`));