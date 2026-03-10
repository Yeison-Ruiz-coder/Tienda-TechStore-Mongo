const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    contacto: String,
    email: String,
    telefono: String,
    direccion: String,
    productos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Producto' }]
});

module.exports = mongoose.model('Proveedor', proveedorSchema);