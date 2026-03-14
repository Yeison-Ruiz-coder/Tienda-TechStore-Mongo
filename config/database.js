const mongoose = require('mongoose');

// URL de conexión a MongoDB (ajusta según tu configuración)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/techstore';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
        console.log(`📦 Base de datos: ${conn.connection.name}`);
        
        // Eventos de conexión
        mongoose.connection.on('error', (err) => {
            console.error('❌ Error en MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB desconectado');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconectado');
        });

        return conn;

    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        process.exit(1);
    }
};

// Función para desconectar (útil para testing)
const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('📦 MongoDB desconectado correctamente');
    } catch (error) {
        console.error('❌ Error al desconectar MongoDB:', error.message);
    }
};

// Verificar estado de la conexión
const getConnectionStatus = () => {
    const state = mongoose.connection.readyState;
    const states = {
        0: 'Desconectado',
        1: 'Conectado',
        2: 'Conectando',
        3: 'Desconectando'
    };
    return {
        state,
        status: states[state] || 'Desconocido'
    };
};

module.exports = {
    connectDB,
    disconnectDB,
    getConnectionStatus,
    MONGODB_URI
};