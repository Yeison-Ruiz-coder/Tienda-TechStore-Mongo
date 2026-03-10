const Proveedor = require('../models/Proveedor');

const ProveedorController = {
    index: async (req, res) => {
        try {
            const proveedores = await Proveedor.find().populate('productos');
            res.json(proveedores);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    store: async (req, res) => {
        try {
            const nuevoProveedor = new Proveedor(req.body);
            await nuevoProveedor.save();
            res.status(201).json(nuevoProveedor);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    destroy: async (req, res) => {
        try {
            const proveedor = await Proveedor.findByIdAndDelete(req.params.id);
            if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
            res.json({ mensaje: 'Proveedor eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = ProveedorController;