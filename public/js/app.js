// Configuración de la API
const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function() {
    cargarSeccionInicial();
    document.getElementById('fecha-actual').textContent = new Date().toLocaleDateString();
    
    // Event listeners para navegación
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            cambiarSeccion(this.dataset.section);
        });
    });
});
// ==================== FUNCIONES DE DEPURACIÓN ====================
console.log('✅ app.js cargado correctamente');

// Verificar que las funciones de pedidos están disponibles
window.addEventListener('load', function() {
    console.log('✅ Funciones de pedidos disponibles:', {
        cargarPedidos: typeof cargarPedidos === 'function',
        editarPedido: typeof editarPedido === 'function',
        guardarPedido: typeof guardarPedido === 'function',
        agregarProductoAlPedido: typeof agregarProductoAlPedido === 'function'
    });
});
// ==================== CARGA DE SECCIONES ====================
async function cargarSeccionInicial() {
    await cargarSeccion('dashboard');
}

async function cargarSeccion(seccion) {
    try {
        // Cargar el CSS de la sección si no está cargado
        const cssExistente = document.querySelector(`link[data-seccion="${seccion}"]`);
        if (!cssExistente) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `css/sections/${seccion}.css`;
            link.setAttribute('data-seccion', seccion);
            document.head.appendChild(link);
        }

        // Cargar el HTML de la sección
        const response = await fetch(`views/${seccion}.html`);
        const html = await response.text();
        document.getElementById('content-container').innerHTML = html;
        
        const titulos = {
            'dashboard': 'Dashboard',
            'clientes': 'Gestión de Clientes',
            'productos': 'Gestión de Productos',
            'pedidos': 'Gestión de Pedidos',
            'proveedores': 'Gestión de Proveedores',
            'analytics': 'Centro de Análisis'
        };
        document.getElementById('page-title').textContent = titulos[seccion];
        
        await cargarDatosSeccion(seccion);
        
    } catch (error) {
        console.error('Error cargando sección:', error);
    }
}

async function cargarDatosSeccion(seccion) {
    switch(seccion) {
        case 'dashboard':
            await cargarTodosLosDatos();
            break;
        case 'clientes':
            await cargarClientes();
            break;
        case 'productos':
            await cargarProductos();
            break;
        case 'pedidos':
            await cargarPedidos();
            break;
        case 'proveedores':
            await cargarProveedores();
            break;
    }
}

function cambiarSeccion(seccion) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === seccion) {
            item.classList.add('active');
        }
    });
    cargarSeccion(seccion);
}

// ==================== DASHBOARD ====================
async function cargarTodosLosDatos() {
    try {
        console.log('Cargando datos para dashboard...');
        
        // Mostrar cargando
        document.getElementById('stat-clientes').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        document.getElementById('stat-productos').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        document.getElementById('stat-pedidos').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        document.getElementById('stat-proveedores').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        const [clientesRes, productosRes, pedidosRes, proveedoresRes] = await Promise.all([
            fetch(`${API_URL}/clientes`).catch(e => ({ ok: false })),
            fetch(`${API_URL}/productos`).catch(e => ({ ok: false })),
            fetch(`${API_URL}/pedidos`).catch(e => ({ ok: false })),
            fetch(`${API_URL}/proveedores`).catch(e => ({ ok: false }))
        ]);
        
        const clientes = clientesRes.ok ? await clientesRes.json() : [];
        const productos = productosRes.ok ? await productosRes.json() : [];
        const pedidos = pedidosRes.ok ? await pedidosRes.json() : [];
        const proveedores = proveedoresRes.ok ? await proveedoresRes.json() : [];
        
        console.log('Datos cargados:', { 
            clientes: clientes.length, 
            productos: productos.length, 
            pedidos: pedidos.length, 
            proveedores: proveedores.length 
        });
        
        // Actualizar estadísticas
        document.getElementById('stat-clientes').textContent = clientes.length || 0;
        document.getElementById('stat-productos').textContent = productos.length || 0;
        document.getElementById('stat-pedidos').textContent = pedidos.length || 0;
        document.getElementById('stat-proveedores').textContent = proveedores.length || 0;
        
        // Mostrar últimos registros
        mostrarUltimosClientes(clientes);
        mostrarUltimosPedidos(pedidos);
        
        // Crear gráficos con los datos reales
        crearGraficos(productos, pedidos);
        
    } catch (error) {
        console.error('Error cargando todos los datos:', error);
        mostrarNotificacion('Error al cargar datos del dashboard', 'error');
    }
}
function mostrarUltimosClientes(clientes) {
    const container = document.getElementById('recent-clientes');
    if (!container) return;
    
    if (!clientes || clientes.length === 0) {
        container.innerHTML = '<div class="recent-item">No hay clientes</div>';
        return;
    }
    
    const ultimos = clientes.slice(-5).reverse();
    container.innerHTML = '';
    
    ultimos.forEach(cliente => {
        const item = document.createElement('div');
        item.className = 'recent-item';
        item.innerHTML = `
            <span><strong>${cliente.nombre || 'Sin nombre'}</strong></span>
            <span>${cliente.email || ''}</span>
        `;
        container.appendChild(item);
    });
}

function mostrarUltimosPedidos(pedidos) {
    const container = document.getElementById('recent-pedidos');
    if (!container) return;
    
    if (!pedidos || pedidos.length === 0) {
        container.innerHTML = '<div class="recent-item">No hay pedidos</div>';
        return;
    }
    
    const ultimos = pedidos.slice(-5).reverse();
    container.innerHTML = '';
    
    ultimos.forEach(pedido => {
        const total = pedido.total ? `$${Number(pedido.total).toFixed(2)}` : '$0';
        const item = document.createElement('div');
        item.className = 'recent-item';
        item.innerHTML = `
            <span>Pedido #${pedido._id?.substring(0, 6) || 'N/A'}</span>
            <span>${total}</span>
        `;
        container.appendChild(item);
    });
}

function crearGraficos(productos, pedidos) {
    console.log('Creando gráficos con:', { productos, pedidos });
    
    // Destruir gráficos existentes
    if (window.categoriasChart) {
        window.categoriasChart.destroy();
        window.categoriasChart = null;
    }
    if (window.pedidosChart) {
        window.pedidosChart.destroy();
        window.pedidosChart = null;
    }
    
    // ===== GRÁFICO DE PRODUCTOS POR CATEGORÍA =====
    const ctxCategorias = document.getElementById('categoriasChart')?.getContext('2d');
    if (ctxCategorias) {
        // Procesar datos de productos por categoría
        const categorias = {};
        
        if (productos && productos.length > 0) {
            productos.forEach(p => {
                const cat = p.categoria || 'Sin categoría';
                categorias[cat] = (categorias[cat] || 0) + 1;
            });
        } else {
            // Si no hay productos, mostrar datos de ejemplo
            categorias['Computadoras'] = 5;
            categorias['Accesorios'] = 8;
            categorias['Monitores'] = 3;
            categorias['Periféricos'] = 4;
        }
        
        console.log('Datos para gráfico de categorías:', categorias);
        
        window.categoriasChart = new Chart(ctxCategorias, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categorias),
                datasets: [{
                    data: Object.values(categorias),
                    backgroundColor: [
                        '#4361ee', '#4cc9f0', '#f72585', '#f8961e', 
                        '#7209b7', '#4895ef', '#3f37c9', '#b5179e'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} productos (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // ===== GRÁFICO DE PEDIDOS POR ESTADO =====
    const ctxPedidos = document.getElementById('pedidosChart')?.getContext('2d');
    if (ctxPedidos) {
        // Procesar datos de pedidos por estado
        const estados = {
            'pendiente': 0,
            'pagado': 0,
            'enviado': 0,
            'entregado': 0,
            'cancelado': 0
        };
        
        if (pedidos && pedidos.length > 0) {
            pedidos.forEach(p => {
                const estado = p.estado || 'pendiente';
                estados[estado] = (estados[estado] || 0) + 1;
            });
        } else {
            // Si no hay pedidos, mostrar datos de ejemplo
            estados['pendiente'] = 4;
            estados['pagado'] = 6;
            estados['enviado'] = 3;
            estados['entregado'] = 8;
            estados['cancelado'] = 1;
        }
        
        // Filtrar estados con valor > 0
        const estadosActivos = {};
        Object.keys(estados).forEach(key => {
            if (estados[key] > 0) {
                estadosActivos[key] = estados[key];
            }
        });
        
        console.log('Datos para gráfico de estados:', estadosActivos);
        
        window.pedidosChart = new Chart(ctxPedidos, {
            type: 'bar',
            data: {
                labels: Object.keys(estadosActivos).map(e => e.charAt(0).toUpperCase() + e.slice(1)),
                datasets: [{
                    label: 'Cantidad de Pedidos',
                    data: Object.values(estadosActivos),
                    backgroundColor: '#4361ee',
                    borderRadius: 5,
                    barPercentage: 0.7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                return Number.isInteger(value) ? value : null;
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Cantidad: ${context.raw}`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// ==================== CLIENTES ====================
async function cargarClientes() {
    try {
        const response = await fetch(`${API_URL}/clientes`);
        const clientes = await response.json();
        
        const tbody = document.getElementById('clientes-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (!clientes || clientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay clientes</td></tr>';
            return;
        }
        
        clientes.forEach(cliente => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cliente.nombre || ''}</td>
                <td>${cliente.email || ''}</td>
                <td>${cliente.telefono || ''}</td>
                <td>${cliente.ciudad || (cliente.direccion?.ciudad) || ''}</td>
                <td>${cliente.edad || ''}</td>
                <td class="acciones">
                    <button class="btn-icon" onclick="editarCliente('${cliente._id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="eliminarCliente('${cliente._id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
    } catch (error) {
        console.error('Error:', error);
    }
}

async function editarCliente(id) {
    try {
        console.log('Editando cliente:', id);
        const response = await fetch(`${API_URL}/clientes/${id}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar cliente');
        }
        
        const cliente = await response.json();
        console.log('Cliente cargado:', cliente);
        
        mostrarModal('cliente', cliente);
        
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al cargar cliente para editar', 'error');
    }
}

async function eliminarCliente(id) {
    if (!confirm('¿Eliminar este cliente?')) return;
    
    try {
        const response = await fetch(`${API_URL}/clientes/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await cargarClientes();
            await cargarTodosLosDatos();
            mostrarNotificacion('Cliente eliminado', 'success');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function filtrarClientes() {
    const busqueda = document.getElementById('buscar-cliente')?.value.toLowerCase() || '';
    const ciudad = document.getElementById('filtro-ciudad')?.value || '';
    
    const filas = document.querySelectorAll('#clientes-body tr');
    filas.forEach(fila => {
        if (fila.cells.length > 1) {
            const nombre = fila.cells[0]?.textContent.toLowerCase() || '';
            const email = fila.cells[1]?.textContent.toLowerCase() || '';
            const ciudadFila = fila.cells[3]?.textContent || '';
            
            const coincide = nombre.includes(busqueda) || email.includes(busqueda);
            const coincideCiudad = !ciudad || ciudadFila === ciudad;
            
            fila.style.display = coincide && coincideCiudad ? '' : 'none';
        }
    });
}

// ==================== PRODUCTOS ====================
async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        const productos = await response.json();
        
        const grid = document.getElementById('productos-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        if (!productos || productos.length === 0) {
            grid.innerHTML = '<div class="text-center">No hay productos</div>';
            return;
        }
        
        productos.forEach(producto => {
            const card = document.createElement('div');
            card.className = 'producto-card';
            card.innerHTML = `
                <h4>${producto.nombre || ''}</h4>
                <div class="producto-precio">$${Number(producto.precio || 0).toFixed(2)}</div>
                <span class="producto-categoria">${producto.categoria || 'Sin categoría'}</span>
                <div class="producto-stock">Stock: ${producto.stock || 0}</div>
                <div class="producto-acciones">
                    <button class="btn-icon" onclick="editarProducto('${producto._id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="eliminarProducto('${producto._id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error:', error);
    }
}

async function editarProducto(id) {
    try {
        console.log('Editando producto:', id);
        const response = await fetch(`${API_URL}/productos/${id}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar producto');
        }
        
        const producto = await response.json();
        console.log('Producto cargado:', producto);
        
        mostrarModal('producto', producto);
        
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al cargar producto', 'error');
    }
}

async function eliminarProducto(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    
    try {
        const response = await fetch(`${API_URL}/productos/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await cargarProductos();
            await cargarTodosLosDatos();
            mostrarNotificacion('Producto eliminado', 'success');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function filtrarProductos() {
    const busqueda = document.getElementById('buscar-producto')?.value.toLowerCase() || '';
    const categoria = document.getElementById('filtro-categoria')?.value || '';
    const precioMax = parseFloat(document.getElementById('precio-max')?.value) || Infinity;
    
    const cards = document.querySelectorAll('.producto-card');
    cards.forEach(card => {
        const nombre = card.querySelector('h4')?.textContent.toLowerCase() || '';
        const categoriaCard = card.querySelector('.producto-categoria')?.textContent || '';
        const precio = parseFloat(card.querySelector('.producto-precio')?.textContent.replace('$', '') || 0);
        
        const coincide = nombre.includes(busqueda);
        const coincideCategoria = !categoria || categoriaCard === categoria;
        const coincidePrecio = precio <= precioMax;
        
        card.style.display = coincide && coincideCategoria && coincidePrecio ? 'block' : 'none';
    });
}

// ==================== PROVEEDORES ====================
async function cargarProveedores() {
    try {
        const response = await fetch(`${API_URL}/proveedores`);
        const proveedores = await response.json();
        
        const grid = document.getElementById('proveedores-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        if (!proveedores || proveedores.length === 0) {
            grid.innerHTML = '<div class="text-center">No hay proveedores</div>';
            return;
        }
        
        proveedores.forEach(proveedor => {
            const card = document.createElement('div');
            card.className = 'proveedor-card';
            card.innerHTML = `
                <div class="proveedor-header">
                    <i class="fas fa-building"></i>
                    <h4>${proveedor.nombre || ''}</h4>
                </div>
                <div class="proveedor-info">
                    <p><i class="fas fa-user"></i> ${proveedor.contacto || 'N/A'}</p>
                    <p><i class="fas fa-envelope"></i> ${proveedor.email || 'N/A'}</p>
                    <p><i class="fas fa-phone"></i> ${proveedor.telefono || 'N/A'}</p>
                </div>
                <div class="proveedor-footer">
                    <span class="badge-productos">
                        <i class="fas fa-box"></i> ${proveedor.productos?.length || 0}
                    </span>
                    <div class="acciones">
                        <button class="btn-icon" onclick="editarProveedor('${proveedor._id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="eliminarProveedor('${proveedor._id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error:', error);
    }
}

async function editarProveedor(id) {
    try {
        console.log('Editando proveedor:', id);
        const response = await fetch(`${API_URL}/proveedores/${id}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar proveedor');
        }
        
        const proveedor = await response.json();
        console.log('Proveedor cargado:', proveedor);
        
        mostrarModal('proveedor', proveedor);
        
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al cargar proveedor', 'error');
    }
}

async function eliminarProveedor(id) {
    if (!confirm('¿Eliminar este proveedor?')) return;
    
    try {
        const response = await fetch(`${API_URL}/proveedores/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await cargarProveedores();
            await cargarTodosLosDatos();
            mostrarNotificacion('Proveedor eliminado', 'success');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function filtrarProveedores() {
    const busqueda = document.getElementById('buscar-proveedor')?.value.toLowerCase() || '';
    
    const cards = document.querySelectorAll('.proveedor-card');
    cards.forEach(card => {
        const nombre = card.querySelector('h4')?.textContent.toLowerCase() || '';
        const contacto = card.querySelector('.proveedor-info p:first-child')?.textContent.toLowerCase() || '';
        
        card.style.display = (nombre.includes(busqueda) || contacto.includes(busqueda)) ? 'block' : 'none';
    });
}

// ==================== PEDIDOS ====================
let productosPedido = [];

async function cargarPedidos() {
    console.log('🔄 Cargando pedidos...');
    try {
        const response = await fetch(`${API_URL}/pedidos`);
        if (!response.ok) throw new Error('Error al cargar pedidos');
        
        const pedidos = await response.json();
        console.log('✅ Pedidos cargados:', pedidos.length);
        
        const tbody = document.getElementById('pedidos-body');
        if (!tbody) {
            console.error('❌ No se encontró el elemento pedidos-body');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (!pedidos || pedidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay pedidos</td></tr>';
            return;
        }
        
        pedidos.forEach(pedido => {
            const fecha = pedido.fecha ? new Date(pedido.fecha).toLocaleDateString() : 'N/A';
            const total = pedido.total ? `$${Number(pedido.total).toFixed(2)}` : '$0';
            const cliente = pedido.clienteId?.nombre || 'N/A';
            const estado = pedido.estado || 'pendiente';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${pedido._id?.substring(0, 8) || 'N/A'}</td>
                <td>${cliente}</td>
                <td>${fecha}</td>
                <td>${total}</td>
                <td><span class="badge-estado ${estado}">${estado}</span></td>
                <td>${pedido.productos?.length || 0} productos</td>
                <td class="acciones">
                    <button class="btn-icon" onclick="editarPedido('${pedido._id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="eliminarPedido('${pedido._id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        const statPedidos = document.getElementById('stat-pedidos');
        if (statPedidos) statPedidos.textContent = pedidos.length;
        
    } catch (error) {
        console.error('❌ Error cargando pedidos:', error);
        const tbody = document.getElementById('pedidos-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center error">Error al cargar pedidos</td></tr>';
        }
        mostrarNotificacion('Error al cargar pedidos', 'error');
    }
}

async function eliminarPedido(id) {
    if (!confirm('¿Eliminar este pedido?')) return;
    
    try {
        const response = await fetch(`${API_URL}/pedidos/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await cargarPedidos();
            await cargarTodosLosDatos();
            mostrarNotificacion('Pedido eliminado', 'success');
        } else {
            mostrarNotificacion('Error al eliminar pedido', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}

function filtrarPedidos() {
    const estado = document.getElementById('filtro-estado')?.value || '';
    const totalMin = parseFloat(document.getElementById('total-min')?.value) || 0;
    
    const filas = document.querySelectorAll('#pedidos-body tr');
    filas.forEach(fila => {
        if (fila.cells.length > 1) {
            const estadoFila = fila.cells[4]?.textContent.trim().toLowerCase() || '';
            const total = parseFloat(fila.cells[3]?.textContent.replace('$', '') || 0);
            
            const coincideEstado = !estado || estadoFila === estado;
            const coincideTotal = total >= totalMin;
            
            fila.style.display = coincideEstado && coincideTotal ? '' : 'none';
        }
    });
}

// Funciones para el modal de pedidos
async function cargarClientesParaSelect() {
    try {
        const response = await fetch(`${API_URL}/clientes`);
        if (!response.ok) throw new Error('Error al cargar clientes');
        
        const clientes = await response.json();
        
        const select = document.getElementById('modal-pedido-cliente');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccione un cliente</option>';
        
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente._id;
            option.textContent = `${cliente.nombre} (${cliente.email})`;
            select.appendChild(option);
        });
        console.log('✅ Clientes cargados en select:', clientes.length);
    } catch (error) {
        console.error('Error cargando clientes:', error);
        const select = document.getElementById('modal-pedido-cliente');
        if (select) {
            select.innerHTML = '<option value="">Error al cargar clientes</option>';
        }
    }
}

async function cargarProductosParaSelect() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        if (!response.ok) throw new Error('Error al cargar productos');
        
        const productos = await response.json();
        window.productosDisponibles = productos;
        console.log('✅ Productos cargados:', productos.length);
        return productos;
    } catch (error) {
        console.error('Error cargando productos:', error);
        window.productosDisponibles = [];
        return [];
    }
}

function agregarProductoAlPedido(productoData = null) {
    console.log('Agregando producto al pedido:', productoData);
    const container = document.getElementById('productos-pedido-container');
    if (!container) {
        console.error('❌ No se encontró el contenedor de productos');
        return;
    }
    
    const productos = window.productosDisponibles || [];
    if (productos.length === 0) {
        mostrarNotificacion('No hay productos disponibles', 'error');
        return;
    }
    
    const div = document.createElement('div');
    div.className = 'producto-item';
    
    let selectOptions = '<option value="">Seleccione producto</option>';
    productos.forEach(p => {
        const selected = productoData && productoData.productoId === p._id ? 'selected' : '';
        selectOptions += `<option value="${p._id}" data-precio="${p.precio}" ${selected}>${p.nombre} - $${p.precio}</option>`;
    });
    
    div.innerHTML = `
        <select class="producto-select" onchange="actualizarPrecioProducto(this)">
            ${selectOptions}
        </select>
        <input type="number" class="producto-cantidad" placeholder="Cantidad" min="1" value="${productoData?.cantidad || 1}" onchange="calcularTotalPedido()">
        <input type="number" class="producto-precio" placeholder="Precio" readonly value="${productoData?.precioUnitario || 0}">
        <button type="button" class="btn-remove" onclick="eliminarProductoDelPedido(this)">✕</button>
    `;
    
    container.appendChild(div);
    calcularTotalPedido();
}

function actualizarPrecioProducto(select) {
    const option = select.options[select.selectedIndex];
    const precio = option.dataset.precio || 0;
    
    const item = select.closest('.producto-item');
    const precioInput = item.querySelector('.producto-precio');
    precioInput.value = precio;
    
    calcularTotalPedido();
}

function eliminarProductoDelPedido(btn) {
    const item = btn.closest('.producto-item');
    item.remove();
    calcularTotalPedido();
}

function calcularTotalPedido() {
    let total = 0;
    
    document.querySelectorAll('.producto-item').forEach(item => {
        const cantidad = parseFloat(item.querySelector('.producto-cantidad')?.value) || 0;
        const precio = parseFloat(item.querySelector('.producto-precio')?.value) || 0;
        total += cantidad * precio;
    });
    
    const totalInput = document.getElementById('modal-pedido-total');
    if (totalInput) totalInput.value = total.toFixed(2);
    
    return total;
}

async function cargarProductosParaSelect() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        const productos = await response.json();
        window.productosDisponibles = productos;
        console.log('✅ Productos cargados:', productos.length);
        return productos;
    } catch (error) {
        console.error('Error cargando productos:', error);
        return [];
    }
}

function agregarProductoAlPedido(productoData = null) {
    console.log('Agregando producto al pedido:', productoData);
    const container = document.getElementById('productos-pedido-container');
    if (!container) {
        console.error('❌ No se encontró el contenedor de productos');
        return;
    }
    
    const productos = window.productosDisponibles || [];
    
    const div = document.createElement('div');
    div.className = 'producto-item';
    
    let selectOptions = '<option value="">Seleccione producto</option>';
    productos.forEach(p => {
        const selected = productoData && productoData.productoId === p._id ? 'selected' : '';
        selectOptions += `<option value="${p._id}" data-precio="${p.precio}" ${selected}>${p.nombre} - $${p.precio}</option>`;
    });
    
    div.innerHTML = `
        <select class="producto-select" onchange="actualizarPrecioProducto(this)">
            ${selectOptions}
        </select>
        <input type="number" class="producto-cantidad" placeholder="Cantidad" min="1" value="${productoData?.cantidad || 1}" onchange="calcularTotalPedido()">
        <input type="number" class="producto-precio" placeholder="Precio" readonly value="${productoData?.precioUnitario || 0}">
        <button type="button" class="btn-remove" onclick="eliminarProductoDelPedido(this)">✕</button>
    `;
    
    container.appendChild(div);
    calcularTotalPedido();
}

function actualizarPrecioProducto(select) {
    const option = select.options[select.selectedIndex];
    const precio = option.dataset.precio || 0;
    
    const item = select.closest('.producto-item');
    const precioInput = item.querySelector('.producto-precio');
    precioInput.value = precio;
    
    calcularTotalPedido();
}

function eliminarProductoDelPedido(btn) {
    const item = btn.closest('.producto-item');
    item.remove();
    calcularTotalPedido();
}

function calcularTotalPedido() {
    let total = 0;
    
    document.querySelectorAll('.producto-item').forEach(item => {
        const cantidad = parseFloat(item.querySelector('.producto-cantidad')?.value) || 0;
        const precio = parseFloat(item.querySelector('.producto-precio')?.value) || 0;
        total += cantidad * precio;
    });
    
    const totalInput = document.getElementById('modal-pedido-total');
    if (totalInput) totalInput.value = total.toFixed(2);
    
    return total;
}

async function guardarPedido(event) {
    event.preventDefault();
    console.log('🔄 Guardando pedido...');
    
    const form = document.getElementById('form-pedido');
    const pedidoId = form?.dataset?.id;
    
    const clienteId = document.getElementById('modal-pedido-cliente')?.value;
    if (!clienteId) {
        mostrarNotificacion('Debe seleccionar un cliente', 'error');
        return;
    }
    
    const productos = [];
    let total = 0;
    
    document.querySelectorAll('.producto-item').forEach(item => {
        const select = item.querySelector('.producto-select');
        const cantidad = parseInt(item.querySelector('.producto-cantidad')?.value);
        const precio = parseFloat(item.querySelector('.producto-precio')?.value);
        
        if (select.value && cantidad > 0) {
            productos.push({
                productoId: select.value,
                cantidad: cantidad,
                precioUnitario: precio
            });
            total += cantidad * precio;
        }
    });
    
    if (productos.length === 0) {
        mostrarNotificacion('Debe agregar al menos un producto', 'error');
        return;
    }
    
    const pedidoData = {
        clienteId: clienteId,
        productos: productos,
        total: total,
        estado: document.getElementById('modal-pedido-estado')?.value || 'pendiente',
        metodoPago: document.getElementById('modal-pedido-metodo-pago')?.value || 'efectivo'
    };
    
    const method = pedidoId ? 'PUT' : 'POST';
    const url = pedidoId ? `${API_URL}/pedidos/${pedidoId}` : `${API_URL}/pedidos`;
    
    try {
        console.log('Enviando datos:', pedidoData);
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedidoData)
        });
        
        if (response.ok) {
            cerrarModal('pedido');
            await cargarPedidos();
            await cargarTodosLosDatos();
            mostrarNotificacion(pedidoId ? 'Pedido actualizado' : 'Pedido creado', 'success');
        } else {
            const result = await response.json();
            mostrarNotificacion(result.error || 'Error al guardar', 'error');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}

async function editarPedido(id) {
    console.log('🔄 Editando pedido:', id);
    try {
        const response = await fetch(`${API_URL}/pedidos/${id}`);
        if (!response.ok) throw new Error('Error al cargar pedido');
        
        const pedido = await response.json();
        console.log('✅ Pedido cargado:', pedido);
        
        mostrarModal('pedido', pedido);
        
    } catch (error) {
        console.error('❌ Error:', error);
        mostrarNotificacion('Error al cargar pedido', 'error');
    }
}

// ==================== MODALES ====================
function mostrarModal(tipo, data = null) {
    console.log(`🔄 Mostrando modal: ${tipo}`, data ? 'con datos' : 'nuevo');
    
    const modal = document.getElementById(`modal-${tipo}`);
    if (!modal) {
        console.error(`❌ Modal ${tipo} no encontrado`);
        return;
    }
    
    // Limpiar el modal antes de cargar nuevo contenido
    modal.innerHTML = '';
    modal.classList.add('active');
    
    // Mostrar loader mientras carga
    modal.innerHTML = '<div class="modal-content"><div class="loader">Cargando...</div></div>';
    
    fetch(`modals/${tipo}-modal.html`)
        .then(response => {
            if (!response.ok) throw new Error(`Error cargando modal ${tipo}`);
            return response.text();
        })
        .then(html => {
            modal.innerHTML = html;
            
            if (tipo === 'pedido') {
                console.log('🔄 Cargando datos para pedido...');
                
                // Mostrar loader en los selects mientras cargan
                const clienteSelect = document.getElementById('modal-pedido-cliente');
                if (clienteSelect) clienteSelect.innerHTML = '<option value="">Cargando clientes...</option>';
                
                // Cargar clientes y productos
                Promise.all([
                    cargarClientesParaSelect(),
                    cargarProductosParaSelect()
                ]).then(() => {
                    if (data) {
                        console.log('📦 Llenando formulario con datos del pedido');
                        setTimeout(() => llenarFormularioPedido(data), 500);
                    }
                });
            } else if (data) {
                // Para otros tipos (cliente, producto, proveedor)
                setTimeout(() => llenarFormularioModal(tipo, data), 100);
            }
            
            // Cambiar título si es edición
            if (data) {
                const titulo = document.getElementById(`modal-${tipo}-titulo`);
                if (titulo) {
                    titulo.textContent = `Editar ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
                }
            }
        })
        .catch(error => {
            console.error('❌ Error cargando modal:', error);
            modal.innerHTML = `<div class="modal-content">
                <span class="close" onclick="cerrarModal('${tipo}')">&times;</span>
                <h3>Error</h3>
                <p>No se pudo cargar el formulario</p>
                <button class="btn-primary" onclick="cerrarModal('${tipo}')">Cerrar</button>
            </div>`;
            mostrarNotificacion('Error al cargar el formulario', 'error');
        });
}

function cerrarModal(tipo) {
    console.log(`Cerrando modal: ${tipo}`);
    const modal = document.getElementById(`modal-${tipo}`);
    if (modal) {
        modal.classList.remove('active');
        // Limpiar después de la animación
        setTimeout(() => {
            modal.innerHTML = '';
        }, 300);
    }
}

// Función específica para llenar formulario de pedido
function llenarFormularioPedido(data) {
    console.log('Llenando formulario de pedido:', data);
    
    // Seleccionar cliente
    const selectCliente = document.getElementById('modal-pedido-cliente');
    if (selectCliente && data.clienteId) {
        const clienteId = data.clienteId._id || data.clienteId;
        selectCliente.value = clienteId;
        console.log('Cliente seleccionado:', clienteId);
    }
    
    // Estado
    const selectEstado = document.getElementById('modal-pedido-estado');
    if (selectEstado && data.estado) {
        selectEstado.value = data.estado;
    }
    
    // Método de pago
    const selectMetodo = document.getElementById('modal-pedido-metodo-pago');
    if (selectMetodo && data.metodoPago) {
        selectMetodo.value = data.metodoPago;
    }
    
    // Observaciones
    const observaciones = document.getElementById('modal-pedido-observaciones');
    if (observaciones && data.observaciones) {
        observaciones.value = data.observaciones;
    }
    
    // Productos
    const container = document.getElementById('productos-pedido-container');
    if (container) {
        container.innerHTML = '';
        
        if (data.productos && data.productos.length > 0) {
            console.log('Agregando productos:', data.productos.length);
            data.productos.forEach(prod => {
                agregarProductoAlPedido({
                    productoId: prod.productoId?._id || prod.productoId,
                    cantidad: prod.cantidad,
                    precioUnitario: prod.precioUnitario || prod.productoId?.precio
                });
            });
        }
    }
    
    // Guardar ID para actualización
    document.getElementById('form-pedido').dataset.id = data._id || '';
}

// Función genérica para llenar otros formularios
function llenarFormularioModal(tipo, data) {
    console.log('Llenando formulario:', tipo, data);
    
    switch(tipo) {
        case 'cliente':
            if (document.getElementById('modal-cliente-nombre')) {
                document.getElementById('modal-cliente-nombre').value = data.nombre || '';
                document.getElementById('modal-cliente-email').value = data.email || '';
                document.getElementById('modal-cliente-telefono').value = data.telefono || '';
                document.getElementById('modal-cliente-ciudad').value = data.ciudad || data.direccion?.ciudad || '';
                document.getElementById('modal-cliente-edad').value = data.edad || '';
                document.getElementById('form-cliente').dataset.id = data._id || '';
            }
            break;
            
        case 'producto':
            if (document.getElementById('modal-producto-nombre')) {
                document.getElementById('modal-producto-nombre').value = data.nombre || '';
                document.getElementById('modal-producto-descripcion').value = data.descripcion || '';
                document.getElementById('modal-producto-precio').value = data.precio || '';
                
                const selectCategoria = document.getElementById('modal-producto-categoria');
                if (selectCategoria) {
                    selectCategoria.value = data.categoria || '';
                }
                
                document.getElementById('modal-producto-stock').value = data.stock || '';
                document.getElementById('form-producto').dataset.id = data._id || '';
            }
            break;
            
        case 'proveedor':
            if (document.getElementById('modal-proveedor-nombre')) {
                document.getElementById('modal-proveedor-nombre').value = data.nombre || '';
                document.getElementById('modal-proveedor-contacto').value = data.contacto || '';
                document.getElementById('modal-proveedor-email').value = data.email || '';
                document.getElementById('modal-proveedor-telefono').value = data.telefono || '';
                document.getElementById('modal-proveedor-direccion').value = data.direccion || '';
                document.getElementById('form-proveedor').dataset.id = data._id || '';
            }
            break;
    }
}

// ==================== GUARDAR (CLIENTES, PRODUCTOS, PROVEEDORES) ====================
async function guardarCliente(event) {
    event.preventDefault();
    
    const form = document.getElementById('form-cliente');
    const clienteId = form?.dataset?.id;
    
    const clienteData = {
        nombre: document.getElementById('modal-cliente-nombre')?.value,
        email: document.getElementById('modal-cliente-email')?.value,
        telefono: document.getElementById('modal-cliente-telefono')?.value,
        ciudad: document.getElementById('modal-cliente-ciudad')?.value,
        edad: parseInt(document.getElementById('modal-cliente-edad')?.value) || 0
    };
    
    if (!clienteData.nombre || !clienteData.email) {
        mostrarNotificacion('Nombre y email son requeridos', 'error');
        return;
    }
    
    const method = clienteId ? 'PUT' : 'POST';
    const url = clienteId ? `${API_URL}/clientes/${clienteId}` : `${API_URL}/clientes`;
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(clienteData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            cerrarModal('cliente');
            await cargarClientes();
            await cargarTodosLosDatos();
            mostrarNotificacion(
                clienteId ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente',
                'success'
            );
        } else {
            mostrarNotificacion(result.error || 'Error al guardar cliente', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión al guardar', 'error');
    }
}

async function guardarProducto(event) {
    event.preventDefault();
    
    const form = document.getElementById('form-producto');
    const productoId = form?.dataset?.id;
    
    const productoData = {
        nombre: document.getElementById('modal-producto-nombre')?.value,
        descripcion: document.getElementById('modal-producto-descripcion')?.value,
        precio: parseFloat(document.getElementById('modal-producto-precio')?.value) || 0,
        categoria: document.getElementById('modal-producto-categoria')?.value,
        stock: parseInt(document.getElementById('modal-producto-stock')?.value) || 0
    };
    
    if (!productoData.nombre || !productoData.precio || !productoData.categoria) {
        mostrarNotificacion('Nombre, precio y categoría son requeridos', 'error');
        return;
    }
    
    const method = productoId ? 'PUT' : 'POST';
    const url = productoId ? `${API_URL}/productos/${productoId}` : `${API_URL}/productos`;
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(productoData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            cerrarModal('producto');
            await cargarProductos();
            await cargarTodosLosDatos();
            mostrarNotificacion(
                productoId ? 'Producto actualizado' : 'Producto creado',
                'success'
            );
        } else {
            mostrarNotificacion(result.error || 'Error al guardar', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}

async function guardarProveedor(event) {
    event.preventDefault();
    
    const form = document.getElementById('form-proveedor');
    const proveedorId = form?.dataset?.id;
    
    const proveedorData = {
        nombre: document.getElementById('modal-proveedor-nombre')?.value,
        contacto: document.getElementById('modal-proveedor-contacto')?.value,
        email: document.getElementById('modal-proveedor-email')?.value,
        telefono: document.getElementById('modal-proveedor-telefono')?.value,
        direccion: document.getElementById('modal-proveedor-direccion')?.value
    };
    
    if (!proveedorData.nombre || !proveedorData.email) {
        mostrarNotificacion('Nombre de empresa y email son requeridos', 'error');
        return;
    }
    
    const method = proveedorId ? 'PUT' : 'POST';
    const url = proveedorId ? `${API_URL}/proveedores/${proveedorId}` : `${API_URL}/proveedores`;
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(proveedorData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            cerrarModal('proveedor');
            await cargarProveedores();
            await cargarTodosLosDatos();
            mostrarNotificacion(
                proveedorId ? 'Proveedor actualizado' : 'Proveedor creado',
                'success'
            );
        } else {
            mostrarNotificacion(result.error || 'Error al guardar', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}

// ==================== NOTIFICACIONES ====================
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacionExistente = document.querySelector('.notificacion');
    if (notificacionExistente) {
        notificacionExistente.remove();
    }
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    
    let icono = 'fa-info-circle';
    if (tipo === 'success') icono = 'fa-check-circle';
    if (tipo === 'error') icono = 'fa-exclamation-circle';
    
    notificacion.innerHTML = `
        <i class="fas ${icono}"></i>
        <span>${mensaje}</span>
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('fade-out');
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

