const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la empresa es requerido'],
        trim: true
    },
    contacto: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
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
    productos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto'
    }],
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Índices
proveedorSchema.index({ nombre: 'text' });
proveedorSchema.index({ email: 1 });

module.exports = mongoose.model('Proveedor', proveedorSchema);