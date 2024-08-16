import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';  // Importa el paquete cors
import authRoute from './routes/auth.js';
import usersRoute from './routes/users.js';
import roomsRoute from './routes/rooms.js';
import hotelsRoute from './routes/hotels.js';
import cookieParser from 'cookie-parser';

const app = express();
dotenv.config();

// Configuración de CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Permite ambos orígenes
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true
}));

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log('Conectado a MongoDB');
    } catch (error) {
        throw error;
    }
};

mongoose.connection.on('disconnected', () => {
    console.log('mongoDB desconectado');
});

mongoose.connection.on('connected', () => {
    console.log('mongoDB está conectado');
});

// Middlewares
app.use(cookieParser());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoute);
app.use('/api/users', usersRoute);
app.use('/api/hotels', hotelsRoute);
app.use('/api/rooms', roomsRoute);

// Manejo de errores
app.use((err, req, res, next) => {
    const errorStatus = err.status || 500;
    const errorMessage = err.message || 'Algo anda mal!';
    return res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
        stack: err.stack,
    });
});

app.listen(process.env.PORT || 8800,   () => {
    connectDB();
    console.log('Connected on port 8800');
});
