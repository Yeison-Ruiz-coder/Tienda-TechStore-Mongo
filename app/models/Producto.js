const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: String,
    precio: { type: Number, required: true, min: 0 },
    categoria: String,
    stock: { type: Number, default: 0 },
    proveedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor' }
});

module.exports = mongoose.model('Producto', productoSchema);