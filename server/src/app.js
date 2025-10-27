import express from 'express';
import morgan from 'morgan';
import CookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import crudRouter from './routes/crud.routes.js';
import tipoCambioRouter from './routes/tipoCambio.routes.js';  // ← AGREGA ESTO
import cors from 'cors';

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://10.221.47.59:3000'
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(CookieParser());

app.use('/api', authRouter);
app.use('/api', crudRouter);
app.use('/api', tipoCambioRouter);  // ← AGREGA ESTO

export default app;