const Cliente = require('../models/Cliente');

const ClienteController = {
    // Obtener todos los clientes
    index: async (req, res) => {
        try {
            const clientes = await Cliente.find();
            res.json(clientes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener un cliente por ID
    show: async (req, res) => {
        try {
            const cliente = await Cliente.findById(req.params.id);
            if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
            res.json(cliente);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Crear un nuevo cliente
    store: async (req, res) => {
        try {
            const nuevoCliente = new Cliente(req.body);
            await nuevoCliente.save();
            res.status(201).json(nuevoCliente);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Actualizar un cliente
    update: async (req, res) => {
        try {
            const cliente = await Cliente.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
            res.json(cliente);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Eliminar un cliente
    destroy: async (req, res) => {
        try {
            const cliente = await Cliente.findByIdAndDelete(req.params.id);
            if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
            res.json({ mensaje: 'Cliente eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = ClienteController;