const Proveedor = require('../models/Proveedor');

const ProveedorController = {
    // Obtener todos los proveedores
    index: async (req, res) => {
        try {
            const proveedores = await Proveedor.find()
                .populate('productos', 'nombre precio categoria')
                .sort({ createdAt: -1 });
            res.json(proveedores);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener un proveedor por ID
    show: async (req, res) => {
        try {
            const proveedor = await Proveedor.findById(req.params.id)
                .populate('productos', 'nombre precio categoria stock');
            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }
            res.json(proveedor);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Crear un nuevo proveedor
    store: async (req, res) => {
        try {
            const nuevoProveedor = new Proveedor(req.body);
            await nuevoProveedor.save();
            
            const proveedorConProductos = await Proveedor.findById(nuevoProveedor._id)
                .populate('productos', 'nombre precio categoria');
                
            res.status(201).json(proveedorConProductos);
        } catch (error) {
            if (error.code === 11000) {
                res.status(400).json({ error: 'El email ya está registrado' });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    },

    // Actualizar un proveedor
    update: async (req, res) => {
        try {
            const proveedor = await Proveedor.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            ).populate('productos', 'nombre precio categoria');
            
            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }
            res.json(proveedor);
        } catch (error) {
            if (error.code === 11000) {
                res.status(400).json({ error: 'El email ya está registrado' });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    },

    // Eliminar un proveedor
    destroy: async (req, res) => {
        try {
            const proveedor = await Proveedor.findByIdAndDelete(req.params.id);
            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }
            
            // Opcional: Actualizar productos que referenciaban a este proveedor
            await Producto.updateMany(
                { proveedorId: req.params.id },
                { $unset: { proveedorId: 1 } }
            );
            
            res.json({ 
                mensaje: 'Proveedor eliminado correctamente',
                proveedor: proveedor 
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Buscar proveedores por ciudad
    porCiudad: async (req, res) => {
        try {
            const proveedores = await Proveedor.find({ 
                'direccion.ciudad': req.params.ciudad 
            }).populate('productos', 'nombre precio');
            res.json(proveedores);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Proveedores con productos
    conProductos: async (req, res) => {
        try {
            const proveedores = await Proveedor.find({
                'productos.0': { $exists: true }
            }).populate('productos', 'nombre precio categoria');
            res.json(proveedores);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Agregar producto a proveedor
    agregarProducto: async (req, res) => {
        try {
            const { id, productoId } = req.params;
            const proveedor = await Proveedor.findByIdAndUpdate(
                id,
                { $addToSet: { productos: productoId } },
                { new: true }
            ).populate('productos', 'nombre precio');
            
            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }
            res.json(proveedor);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Quitar producto de proveedor
    quitarProducto: async (req, res) => {
        try {
            const { id, productoId } = req.params;
            const proveedor = await Proveedor.findByIdAndUpdate(
                id,
                { $pull: { productos: productoId } },
                { new: true }
            ).populate('productos', 'nombre precio');
            
            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }
            res.json(proveedor);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = ProveedorController;