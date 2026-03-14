const express = require('express');
const router = express.Router();

// Importar controladores
const ClienteController = require('../app/controllers/ClienteController');
const ProductoController = require('../app/controllers/ProductoController');
const ProveedorController = require('../app/controllers/ProveedorController');
const PedidoController = require('../app/controllers/PedidoController');
const ConsultaController = require('../app/controllers/ConsultaController');

// Middleware para logging de peticiones (opcional)
router.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url}`);
    next();
});

// ============= RUTAS DE CLIENTES =============
router.get('/clientes', ClienteController.index);
router.get('/clientes/:id', ClienteController.show);
router.post('/clientes', ClienteController.store);
router.put('/clientes/:id', ClienteController.update);
router.delete('/clientes/:id', ClienteController.destroy);
router.get('/clientes/ciudad/:ciudad', ClienteController.porCiudad);
router.get('/clientes/mayores/:edad', ClienteController.mayoresDe);

// ============= RUTAS DE PRODUCTOS =============
router.get('/productos', ProductoController.index);
router.get('/productos/:id', ProductoController.show);
router.post('/productos', ProductoController.store);
router.put('/productos/:id', ProductoController.update);
router.delete('/productos/:id', ProductoController.destroy);
router.get('/productos/categoria/:categoria', ProductoController.porCategoria);
router.get('/productos/precio/:max', ProductoController.porPrecioMaximo);
router.get('/productos/stock-bajo/:limite?', ProductoController.stockBajo);
router.patch('/productos/:id/stock', ProductoController.actualizarStock);

// ============= RUTAS DE PROVEEDORES =============
router.get('/proveedores', ProveedorController.index);
router.get('/proveedores/:id', ProveedorController.show);
router.post('/proveedores', ProveedorController.store);
router.put('/proveedores/:id', ProveedorController.update);
router.delete('/proveedores/:id', ProveedorController.destroy);
router.get('/proveedores/ciudad/:ciudad', ProveedorController.porCiudad);
router.get('/proveedores/con-productos', ProveedorController.conProductos);
router.post('/proveedores/:id/productos/:productoId', ProveedorController.agregarProducto);
router.delete('/proveedores/:id/productos/:productoId', ProveedorController.quitarProducto);

// ============= RUTAS DE PEDIDOS =============
router.get('/pedidos', PedidoController.index);
router.get('/pedidos/:id', PedidoController.show);
router.post('/pedidos', PedidoController.store);
router.put('/pedidos/:id', PedidoController.update);
router.delete('/pedidos/:id', PedidoController.destroy);
router.patch('/pedidos/:id/estado', PedidoController.actualizarEstado);
router.get('/pedidos/estado/:estado', PedidoController.porEstado);
router.get('/pedidos/total/:min', PedidoController.porTotalMayor);
router.get('/pedidos/producto/:nombre', PedidoController.porProducto);
router.get('/pedidos/fecha', PedidoController.porFecha);
router.get('/pedidos/cliente/:clienteId', PedidoController.porCliente);

// ============= RUTAS DE CONSULTAS =============
router.get('/consultas/clientes-mayores-30', ConsultaController.clientesMayores30);
router.get('/consultas/clientes-ciudades', ConsultaController.clientesPorCiudad);
router.get('/consultas/productos-accesorios-baratos', ConsultaController.accesoriosBaratos);
router.get('/consultas/pedidos-reto', ConsultaController.pedidosReto);

// ============= RUTA DE BIENVENIDA =============
router.get('/', (req, res) => {
    res.json({
        mensaje: 'API de TechStore',
        version: '1.0.0',
        endpoints: {
            clientes: '/api/clientes',
            productos: '/api/productos',
            proveedores: '/api/proveedores',
            pedidos: '/api/pedidos',
            consultas: '/api/consultas'
        }
    });
});

module.exports = router;