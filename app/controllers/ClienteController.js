const Cliente = require('../models/Cliente');

const ClienteController = {
    // Obtener todos los clientes
    index: async (req, res) => {
        try {
            const clientes = await Cliente.find().sort({ createdAt: -1 });
            res.json(clientes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener un cliente por ID
    show: async (req, res) => {
        try {
            const cliente = await Cliente.findById(req.params.id);
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }
            res.json(cliente);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Crear un nuevo cliente
    store: async (req, res) => {
        try {
            // Si viene ciudad en el body, la asignamos también a direccion.ciudad
            if (req.body.ciudad && !req.body.direccion) {
                req.body.direccion = { ciudad: req.body.ciudad };
            } else if (req.body.ciudad && req.body.direccion) {
                req.body.direccion.ciudad = req.body.ciudad;
            }
            
            const nuevoCliente = new Cliente(req.body);
            await nuevoCliente.save();
            res.status(201).json(nuevoCliente);
        } catch (error) {
            if (error.code === 11000) {
                res.status(400).json({ error: 'El email ya está registrado' });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    },

    // Actualizar un cliente
    update: async (req, res) => {
        try {
            // Actualizar también ciudad si viene en el body
            if (req.body.ciudad) {
                if (!req.body.direccion) req.body.direccion = {};
                req.body.direccion.ciudad = req.body.ciudad;
            }
            
            const cliente = await Cliente.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }
            res.json(cliente);
        } catch (error) {
            if (error.code === 11000) {
                res.status(400).json({ error: 'El email ya está registrado' });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    },

    // Eliminar un cliente
    destroy: async (req, res) => {
        try {
            const cliente = await Cliente.findByIdAndDelete(req.params.id);
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }
            res.json({ 
                mensaje: 'Cliente eliminado correctamente',
                cliente: cliente 
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Buscar clientes por ciudad
    porCiudad: async (req, res) => {
        try {
            const clientes = await Cliente.find({ 
                $or: [
                    { 'direccion.ciudad': req.params.ciudad },
                    { ciudad: req.params.ciudad }
                ]
            });
            res.json(clientes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Buscar clientes mayores de cierta edad
    mayoresDe: async (req, res) => {
        try {
            const clientes = await Cliente.find({ 
                edad: { $gt: parseInt(req.params.edad) } 
            });
            res.json(clientes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = ClienteController;