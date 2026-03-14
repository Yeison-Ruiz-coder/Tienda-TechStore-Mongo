const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
    clienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: [true, 'El cliente es requerido']
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    productos: [{
        productoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto',
            required: true
        },
        cantidad: {
            type: Number,
            required: true,
            min: [1, 'La cantidad mínima es 1']
        },
        precioUnitario: Number,
        subtotal: Number
    }],
    total: {
        type: Number,
        required: true,
        min: [0, 'El total no puede ser negativo']
    },
    estado: {
        type: String,
        enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'],
        default: 'pendiente'
    },
    metodoPago: {
        type: String,
        enum: ['efectivo', 'tarjeta', 'transferencia', 'otros'],
        default: 'otros'
    },
    observaciones: String
}, {
    timestamps: true
});

// Middleware para calcular subtotales antes de guardar
pedidoSchema.pre('save', async function(next) {
    if (this.productos && this.productos.length > 0) {
        let total = 0;
        for (let item of this.productos) {
            if (!item.subtotal) {
                item.subtotal = (item.precioUnitario || 0) * item.cantidad;
            }
            total += item.subtotal;
        }
        this.total = total;
    }
    next();
});

// Índices
pedidoSchema.index({ clienteId: 1 });
pedidoSchema.index({ fecha: -1 });
pedidoSchema.index({ estado: 1 });
pedidoSchema.index({ total: 1 });

module.exports = mongoose.model('Pedido', pedidoSchema);