const Producto = require('../models/Producto');

const ProductoController = {
    // Obtener todos los productos
    index: async (req, res) => {
        try {
            const productos = await Producto.find()
                .populate('proveedorId', 'nombre email telefono')
                .sort({ createdAt: -1 });
            res.json(productos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener un producto por ID
    show: async (req, res) => {
        try {
            const producto = await Producto.findById(req.params.id)
                .populate('proveedorId', 'nombre email telefono');
            if (!producto) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            res.json(producto);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Crear un nuevo producto
    store: async (req, res) => {
        try {
            const nuevoProducto = new Producto(req.body);
            await nuevoProducto.save();
            
            const productoConProveedor = await Producto.findById(nuevoProducto._id)
                .populate('proveedorId', 'nombre email telefono');
                
            res.status(201).json(productoConProveedor);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Actualizar un producto
    update: async (req, res) => {
        try {
            const producto = await Producto.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            ).populate('proveedorId', 'nombre email telefono');
            
            if (!producto) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            res.json(producto);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Eliminar un producto
    destroy: async (req, res) => {
        try {
            const producto = await Producto.findByIdAndDelete(req.params.id);
            if (!producto) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            res.json({ 
                mensaje: 'Producto eliminado correctamente',
                producto: producto 
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Productos por categoría
    porCategoria: async (req, res) => {
        try {
            const productos = await Producto.find({ 
                categoria: req.params.categoria 
            }).populate('proveedorId', 'nombre email');
            res.json(productos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Productos por precio máximo
    porPrecioMaximo: async (req, res) => {
        try {
            const productos = await Producto.find({
                precio: { $lte: parseFloat(req.params.max) }
            }).populate('proveedorId', 'nombre email');
            res.json(productos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Productos con stock bajo
    stockBajo: async (req, res) => {
        try {
            const limite = parseInt(req.params.limite) || 5;
            const productos = await Producto.find({
                stock: { $lte: limite }
            }).populate('proveedorId', 'nombre email');
            res.json(productos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Actualizar stock
    actualizarStock: async (req, res) => {
        try {
            const { id } = req.params;
            const { cantidad, operacion } = req.body; // operacion: 'increment' o 'decrement'
            
            let update;
            if (operacion === 'increment') {
                update = { $inc: { stock: cantidad } };
            } else if (operacion === 'decrement') {
                update = { $inc: { stock: -cantidad } };
            } else {
                update = { stock: cantidad };
            }
            
            const producto = await Producto.findByIdAndUpdate(
                id,
                update,
                { new: true }
            ).populate('proveedorId', 'nombre email');
            
            if (!producto) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            res.json(producto);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = ProductoController;