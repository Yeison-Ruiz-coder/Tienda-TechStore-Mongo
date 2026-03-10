const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');

const PedidoController = {
    index: async (req, res) => {
        try {
            const pedidos = await Pedido.find()
                .populate('clienteId')
                .populate('productos.productoId');
            res.json(pedidos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    store: async (req, res) => {
        try {
            const nuevoPedido = new Pedido(req.body);
            await nuevoPedido.save();
            res.status(201).json(nuevoPedido);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    destroy: async (req, res) => {
        try {
            const pedido = await Pedido.findByIdAndDelete(req.params.id);
            if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
            res.json({ mensaje: 'Pedido eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    porTotalMayor: async (req, res) => {
        try {
            const pedidos = await Pedido.find({
                total: { $gt: parseFloat(req.params.min) }
            }).populate('clienteId').populate('productos.productoId');
            res.json(pedidos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    porProducto: async (req, res) => {
        try {
            const productos = await Producto.find({
                nombre: { $regex: req.params.nombre, $options: 'i' }
            });
            const productoIds = productos.map(p => p._id);

            const pedidos = await Pedido.find({
                'productos.productoId': { $in: productoIds }
            }).populate('clienteId').populate('productos.productoId');

            res.json(pedidos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = PedidoController;