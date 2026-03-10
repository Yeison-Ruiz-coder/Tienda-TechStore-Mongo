const express = require('express');
const router = express.Router();

// Importar controladores
const ClienteController = require('../app/controllers/ClienteController');
const ProductoController = require('../app/controllers/ProductoController');
const ProveedorController = require('../app/controllers/ProveedorController');
const PedidoController = require('../app/controllers/PedidoController');
const ConsultaController = require('../app/controllers/ConsultaController');

// Verificar que todos los controladores existen
console.log('✅ Controladores cargados:');
console.log('- ClienteController:', typeof ClienteController.index === 'function' ? 'OK' : 'ERROR');
console.log('- ProductoController:', typeof ProductoController.index === 'function' ? 'OK' : 'ERROR');
console.log('- ProveedorController:', typeof ProveedorController.index === 'function' ? 'OK' : 'ERROR');
console.log('- PedidoController:', typeof PedidoController.index === 'function' ? 'OK' : 'ERROR');
console.log('- ConsultaController:', typeof ConsultaController.clientesMayores30 === 'function' ? 'OK' : 'ERROR');

// ============= RUTAS DE CLIENTES =============
router.get('/clientes', ClienteController.index);
router.get('/clientes/:id', ClienteController.show);
router.post('/clientes', ClienteController.store);
router.put('/clientes/:id', ClienteController.update);
router.delete('/clientes/:id', ClienteController.destroy);

// ============= RUTAS DE PRODUCTOS =============
router.get('/productos', ProductoController.index);
router.post('/productos', ProductoController.store);
router.delete('/productos/:id', ProductoController.destroy);
router.get('/productos/categoria/:categoria', ProductoController.porCategoria);
router.get('/productos/precio/:max', ProductoController.porPrecioMaximo);

// ============= RUTAS DE PROVEEDORES =============
router.get('/proveedores', ProveedorController.index);
router.post('/proveedores', ProveedorController.store);
router.delete('/proveedores/:id', ProveedorController.destroy);

// ============= RUTAS DE PEDIDOS =============
router.get('/pedidos', PedidoController.index);
router.post('/pedidos', PedidoController.store);
router.delete('/pedidos/:id', PedidoController.destroy);
router.get('/pedidos/total/:min', PedidoController.porTotalMayor);
router.get('/pedidos/producto/:nombre', PedidoController.porProducto);

// ============= RUTAS DE CONSULTAS =============
router.get('/consultas/clientes-mayores-30', ConsultaController.clientesMayores30);
router.get('/consultas/clientes-ciudades', ConsultaController.clientesPorCiudad);
router.get('/consultas/productos-accesorios-baratos', ConsultaController.accesoriosBaratos);
router.get('/consultas/pedidos-reto', ConsultaController.pedidosReto);

module.exports = router;