const Producto = require('../models/Producto');

const ProductoController = {
    index: async (req, res) => {
        try {
            const productos = await Producto.find().populate('proveedorId');
            res.json(productos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    store: async (req, res) => {
        try {
            const nuevoProducto = new Producto(req.body);
            await nuevoProducto.save();
            res.status(201).json(nuevoProducto);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    destroy: async (req, res) => {
        try {
            const producto = await Producto.findByIdAndDelete(req.params.id);
            if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
            res.json({ mensaje: 'Producto eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    porCategoria: async (req, res) => {
        try {
            const productos = await Producto.find({ categoria: req.params.categoria });
            res.json(productos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    porPrecioMaximo: async (req, res) => {
        try {
            const productos = await Producto.find({
                precio: { $lte: parseFloat(req.params.max) }
            });
            res.json(productos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = ProductoController;