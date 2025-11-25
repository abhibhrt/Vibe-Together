import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';

import { connectDb } from './config/db.config.js';

import AuthRoutes from './routes/users.route.js';
import RequestRoute from './routes/requests.route.js';
import MusicRoute from './routes/musics.route.js';
import FriendsRoute from './routes/friends.route.js';

import { chatHandler } from './socket/chat.handler.js';

dotenv.config();
const app = express();
connectDb();

// middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  'https://vibe-together.vercel.app',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('not allowed by cors'));
    },
    credentials: true,
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    allowedHeaders: [
      'content-type',
      'authorization',
      'accept',
      'x-requested-with'
    ]
  })
);

// http server
const server = http.createServer(app);

// socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// ⭐ IMPORTANT: allow controller to emit socket events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// routes
app.use('/api/users', AuthRoutes);
app.use('/api/requests', RequestRoute);
app.use('/api/musics', MusicRoute);
app.use('/api/friends', FriendsRoute);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'api running..' });
});

// socket listener
io.on('connection', (socket) => {
  chatHandler(io, socket);
});

// start server
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`api running port: ${port}`));