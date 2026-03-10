const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
    fecha: { type: Date, default: Date.now },
    estado: { 
        type: String, 
        enum: ['pendiente', 'pagado', 'enviado', 'entregado'], 
        default: 'pendiente' 
    },
    productos: [{
        productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
        cantidad: Number,
        precioUnitario: Number
    }],
    total: Number
});

module.exports = mongoose.model('Pedido', pedidoSchema);