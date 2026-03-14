const Cliente = require('../models/Cliente');
const Producto = require('../models/Producto');
const Pedido = require('../models/Pedido');

const ConsultaController = {
    clientesMayores30: async (req, res) => {
        try {
            const clientes = await Cliente.find({ edad: { $gt: 30 } });
            res.json(clientes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    clientesPorCiudad: async (req, res) => {
        try {
            const clientes = await Cliente.find({
                $or: [
                    { 'direccion.ciudad': { $in: ['Cali', 'Bogotá'] } },
                    { ciudad: { $in: ['Cali', 'Bogotá'] } }
                ]
            });
            res.json(clientes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    accesoriosBaratos: async (req, res) => {
        try {
            const productos = await Producto.find({
                categoria: 'Accesorios',
                precio: { $lt: 50 }
            });
            res.json(productos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    pedidosReto: async (req, res) => {
        try {
            const laptops = await Producto.find({
                nombre: { $regex: 'Laptop', $options: 'i' }
            });

            const laptopIds = laptops.map(l => l._id);

            const pedidos = await Pedido.find({
                total: { $gt: 500 },
                'productos.productoId': { $in: laptopIds }
            }).populate('clienteId').populate('productos.productoId');

            res.json(pedidos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = ConsultaController;