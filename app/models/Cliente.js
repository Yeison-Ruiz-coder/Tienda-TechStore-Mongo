const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    telefono: {
        type: String,
        trim: true
    },
    direccion: {
        calle: String,
        ciudad: String,
        codigoPostal: String,
        pais: { type: String, default: 'Colombia' }
    },
    ciudad: String, // Para compatibilidad con consultas simples
    edad: {
        type: Number,
        min: [0, 'La edad no puede ser negativa'],
        max: [120, 'Edad fuera de rango']
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Índices para búsquedas frecuentes
clienteSchema.index({ email: 1 });
clienteSchema.index({ 'direccion.ciudad': 1 });
clienteSchema.index({ edad: 1 });

module.exports = mongoose.model('Cliente', clienteSchema);