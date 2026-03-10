const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    telefono: String,
    edad: Number,
    direccion: {
        calle: String,
        ciudad: String,
        codigoPostal: String,
        pais: String
    },
    fechaRegistro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cliente', clienteSchema);