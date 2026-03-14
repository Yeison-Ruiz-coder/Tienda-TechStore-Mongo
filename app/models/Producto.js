const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del producto es requerido'],
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    precio: {
        type: Number,
        required: [true, 'El precio es requerido'],
        min: [0, 'El precio no puede ser negativo']
    },
    categoria: {
        type: String,
        required: [true, 'La categoría es requerida'],
        enum: ['Computadoras', 'Accesorios', 'Monitores', 'Periféricos', 'Otros'],
        default: 'Otros'
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'El stock no puede ser negativo']
    },
    proveedorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedor',
        required: false
    },
    imagen: String,
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Índices para búsquedas frecuentes
productoSchema.index({ nombre: 'text' });
productoSchema.index({ categoria: 1 });
productoSchema.index({ precio: 1 });
productoSchema.index({ proveedorId: 1 });

module.exports = mongoose.model('Producto', productoSchema);