const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');

const PedidoController = {
    // Obtener todos los pedidos
    index: async (req, res) => {
        try {
            const pedidos = await Pedido.find()
                .populate('clienteId', 'nombre email telefono')
                .populate('productos.productoId', 'nombre precio categoria')
                .sort({ fecha: -1 });
            res.json(pedidos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener un pedido por ID
    show: async (req, res) => {
        try {
            const pedido = await Pedido.findById(req.params.id)
                .populate('clienteId', 'nombre email telefono direccion')
                .populate('productos.productoId', 'nombre precio categoria');
            
            if (!pedido) {
                return res.status(404).json({ error: 'Pedido no encontrado' });
            }
            res.json(pedido);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Crear un nuevo pedido
    store: async (req, res) => {
        try {
            // Obtener precios de productos si no vienen
            if (req.body.productos && !req.body.total) {
                let total = 0;
                for (let item of req.body.productos) {
                    if (!item.precioUnitario) {
                        const producto = await Producto.findById(item.productoId);
                        if (producto) {
                            item.precioUnitario = producto.precio;
                        }
                    }
                    item.subtotal = (item.precioUnitario || 0) * item.cantidad;
                    total += item.subtotal;
                }
                req.body.total = total;
            }

            const nuevoPedido = new Pedido(req.body);
            await nuevoPedido.save();
            
            // Actualizar stock de productos
            for (let item of req.body.productos) {
                await Producto.findByIdAndUpdate(
                    item.productoId,
                    { $inc: { stock: -item.cantidad } }
                );
            }
            
            const pedidoCompleto = await Pedido.findById(nuevoPedido._id)
                .populate('clienteId', 'nombre email')
                .populate('productos.productoId', 'nombre precio');
                
            res.status(201).json(pedidoCompleto);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Actualizar un pedido
    update: async (req, res) => {
        try {
            // Si se actualizan productos, recalcular total
            if (req.body.productos) {
                let total = 0;
                for (let item of req.body.productos) {
                    item.subtotal = (item.precioUnitario || 0) * item.cantidad;
                    total += item.subtotal;
                }
                req.body.total = total;
            }
            
            const pedido = await Pedido.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            ).populate('clienteId', 'nombre email')
             .populate('productos.productoId', 'nombre precio');
            
            if (!pedido) {
                return res.status(404).json({ error: 'Pedido no encontrado' });
            }
            res.json(pedido);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Eliminar un pedido
    destroy: async (req, res) => {
        try {
            const pedido = await Pedido.findByIdAndDelete(req.params.id);
            if (!pedido) {
                return res.status(404).json({ error: 'Pedido no encontrado' });
            }
            
            // Restaurar stock si es necesario
            if (pedido.estado !== 'cancelado') {
                for (let item of pedido.productos) {
                    await Producto.findByIdAndUpdate(
                        item.productoId,
                        { $inc: { stock: item.cantidad } }
                    );
                }
            }
            
            res.json({ 
                mensaje: 'Pedido eliminado correctamente',
                pedido: pedido 
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Actualizar estado del pedido
    actualizarEstado: async (req, res) => {
        try {
            const { estado } = req.body;
            const pedidoAnterior = await Pedido.findById(req.params.id);
            
            const pedido = await Pedido.findByIdAndUpdate(
                req.params.id,
                { estado },
                { new: true }
            ).populate('clienteId', 'nombre email')
             .populate('productos.productoId', 'nombre precio');
            
            if (!pedido) {
                return res.status(404).json({ error: 'Pedido no encontrado' });
            }
            
            // Si se cancela, restaurar stock
            if (estado === 'cancelado' && pedidoAnterior.estado !== 'cancelado') {
                for (let item of pedido.productos) {
                    await Producto.findByIdAndUpdate(
                        item.productoId,
                        { $inc: { stock: item.cantidad } }
                    );
                }
            }
            
            res.json(pedido);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Pedidos por estado
    porEstado: async (req, res) => {
        try {
            const pedidos = await Pedido.find({ estado: req.params.estado })
                .populate('clienteId', 'nombre email')
                .populate('productos.productoId', 'nombre precio')
                .sort({ fecha: -1 });
            res.json(pedidos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Pedidos por total mayor a
    porTotalMayor: async (req, res) => {
        try {
            const pedidos = await Pedido.find({
                total: { $gt: parseFloat(req.params.min) }
            })
            .populate('clienteId', 'nombre email')
            .populate('productos.productoId', 'nombre precio')
            .sort({ total: -1 });
            res.json(pedidos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Pedidos por producto
    porProducto: async (req, res) => {
        try {
            const productos = await Producto.find({
                nombre: { $regex: req.params.nombre, $options: 'i' }
            });
            const productoIds = productos.map(p => p._id);

            const pedidos = await Pedido.find({
                'productos.productoId': { $in: productoIds }
            })
            .populate('clienteId', 'nombre email')
            .populate('productos.productoId', 'nombre precio');

            res.json(pedidos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Pedidos por fecha
    porFecha: async (req, res) => {
        try {
            const { inicio, fin } = req.query;
            const pedidos = await Pedido.find({
                fecha: {
                    $gte: new Date(inicio),
                    $lte: new Date(fin)
                }
            })
            .populate('clienteId', 'nombre email')
            .populate('productos.productoId', 'nombre precio')
            .sort({ fecha: -1 });
            res.json(pedidos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Pedidos de un cliente específico
    porCliente: async (req, res) => {
        try {
            const pedidos = await Pedido.find({ 
                clienteId: req.params.clienteId 
            })
            .populate('productos.productoId', 'nombre precio')
            .sort({ fecha: -1 });
            res.json(pedidos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = PedidoController;