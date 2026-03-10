const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.static('public'));

// Conectar a MongoDB
connectDB();

// Rutas de API
app.use('/api', apiRoutes);

// Ruta de inicio
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Ruta para insertar datos de ejemplo
app.get('/api/insertar-datos', async (req, res) => {
    try {
        const Cliente = require('./app/models/Cliente');
        const Producto = require('./app/models/Producto');
        const Proveedor = require('./app/models/Proveedor');
        const Pedido = require('./app/models/Pedido');

        console.log('🔄 Insertando datos de ejemplo...');

        // 1. Insertar Proveedores
        const proveedores = await Proveedor.insertMany([
            { nombre: 'TecnoSupply', contacto: 'Juan Pérez', email: 'juan@tecnosupply.com', telefono: '123456789', direccion: 'Bogotá' },
            { nombre: 'ElectroWorld', contacto: 'María García', email: 'maria@electroworld.com', telefono: '987654321', direccion: 'Cali' }
        ]);

        // 2. Insertar Productos
        const productos = await Producto.insertMany([
            { nombre: 'Laptop HP', descripcion: '16GB RAM, 512GB SSD', precio: 899.99, categoria: 'Computadoras', stock: 10, proveedorId: proveedores[0]._id },
            { nombre: 'Mouse Inalámbrico', descripcion: 'Mouse ergonómico', precio: 25.99, categoria: 'Accesorios', stock: 50, proveedorId: proveedores[0]._id },
            { nombre: 'Monitor 24"', descripcion: 'Full HD', precio: 199.99, categoria: 'Monitores', stock: 15, proveedorId: proveedores[1]._id },
            { nombre: 'Teclado Mecánico', descripcion: 'RGB, switches azules', precio: 89.99, categoria: 'Accesorios', stock: 30, proveedorId: proveedores[1]._id }
        ]);

        // 3. Insertar Clientes
        const clientes = await Cliente.insertMany([
            { nombre: 'Carlos Rodríguez', email: 'carlos@email.com', telefono: '555-0101', direccion: { calle: 'Av. Principal 123', ciudad: 'Bogotá', codigoPostal: '28001', pais: 'Colombia' }, edad: 35 },
            { nombre: 'Ana Martínez', email: 'ana@email.com', telefono: '555-0102', direccion: { calle: 'Calle Secundaria 456', ciudad: 'Cali', codigoPostal: '08001', pais: 'Colombia' }, edad: 28 },
            { nombre: 'Pedro Gómez', email: 'pedro@email.com', telefono: '555-0103', direccion: { calle: 'Carrera 78', ciudad: 'Medellín', codigoPostal: '05001', pais: 'Colombia' }, edad: 42 }
        ]);

        // 4. Insertar Pedidos
        const pedidos = await Pedido.insertMany([
            {
                clienteId: clientes[0]._id,
                fecha: new Date(),
                estado: 'entregado',
                productos: [
                    { productoId: productos[0]._id, cantidad: 1, precioUnitario: productos[0].precio },
                    { productoId: productos[1]._id, cantidad: 2, precioUnitario: productos[1].precio }
                ],
                total: 899.99 + (25.99 * 2)
            },
            {
                clienteId: clientes[1]._id,
                fecha: new Date(),
                estado: 'pendiente',
                productos: [
                    { productoId: productos[2]._id, cantidad: 1, precioUnitario: productos[2].precio }
                ],
                total: 199.99
            },
            {
                clienteId: clientes[2]._id,
                fecha: new Date(),
                estado: 'pagado',
                productos: [
                    { productoId: productos[0]._id, cantidad: 1, precioUnitario: productos[0].precio },
                    { productoId: productos[3]._id, cantidad: 1, precioUnitario: productos[3].precio }
                ],
                total: 899.99 + 89.99
            }
        ]);

        // Actualizar proveedores con sus productos
        await Proveedor.findByIdAndUpdate(proveedores[0]._id, { $push: { productos: { $each: [productos[0]._id, productos[1]._id] } } });
        await Proveedor.findByIdAndUpdate(proveedores[1]._id, { $push: { productos: { $each: [productos[2]._id, productos[3]._id] } } });

        res.status(200).json({
            mensaje: '✅ Todos los datos insertados correctamente',
            datos: {
                proveedores: proveedores.length,
                productos: productos.length,
                clientes: clientes.length,
                pedidos: pedidos.length
            }
        });

    } catch (error) {
        console.error('❌ Error insertando datos:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});