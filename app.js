const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Importar rutas
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/techstore', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB conectado correctamente'))
.catch(err => {
    console.error('❌ Error conectando a MongoDB:', err.message);
    process.exit(1);
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Servir archivos estáticos del frontend
app.use(express.static('public'));

// Ruta de prueba para verificar que la API funciona
app.get('/api/status', (req, res) => {
    res.json({
        servidor: '✅ Funcionando',
        database: mongoose.connection.readyState === 1 ? '✅ Conectado' : '❌ Desconectado',
        timestamp: new Date().toISOString()
    });
});

// Rutas de la API
app.use('/api', apiRoutes);

// Ruta principal - sirve el index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de rutas no encontradas en la API
app.use('/api/*', (req, res) => {
    res.status(404).json({ 
        error: 'Ruta API no encontrada',
        message: `No se encontró la ruta ${req.originalUrl}`
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📝 API disponible en http://localhost:${PORT}/api`);
    console.log(`🔍 Estado: http://localhost:${PORT}/api/status`);
    console.log(`📁 Frontend: http://localhost:${PORT}`);
});