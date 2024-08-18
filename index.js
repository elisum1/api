import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoute from './routes/auth.js';
import usersRoute from './routes/users.js';
import roomsRoute from './routes/rooms.js';
import hotelsRoute from './routes/hotels.js';
import cookieParser from 'cookie-parser';

const app = express();
dotenv.config();

// Conexión a la base de datos
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
        throw error;
    }
};

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB desconectado');
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB está conectado');
});

// Configuración de CORS
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://localhost:3001',
        'https://hotel-admin-alg8tut6s-elisum1s-projects.vercel.app',
        'https://hotel-client-xi.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Middleware para manejar pre-flight requests
app.options('*', cors());

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

// Iniciar el servidor
app.listen(process.env.PORT || 8800, () => {
    connectDB();
    console.log('Servidor corriendo en el puerto', process.env.PORT || 8800);
});
