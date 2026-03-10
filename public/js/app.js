const API_URL = 'http://localhost:3000/api';
let charts = {};

// ============= INICIALIZACIÓN =============
document.addEventListener('DOMContentLoaded', () => {
    cargarTodosLosDatos();
    document.getElementById('fecha-actual').textContent = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// ============= NAVEGACIÓN =============
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
        
        item.classList.add('active');
        const section = item.dataset.section;
        document.getElementById(`${section}-section`).classList.add('active');
        document.getElementById('page-title').textContent = item.querySelector('span').textContent;
        
        // Cargar datos específicos de la sección
        if (section === 'clientes') cargarClientes();
        if (section === 'productos') cargarProductos();
        if (section === 'pedidos') cargarPedidos();
        if (section === 'proveedores') cargarProveedores();
        if (section === 'dashboard') actualizarDashboard();
    });
});

// ============= CARGA DE DATOS =============
async function cargarTodosLosDatos() {
    try {
        const [clientes, productos, pedidos, proveedores] = await Promise.all([
            fetch(`${API_URL}/clientes`).then(r => r.json()),
            fetch(`${API_URL}/productos`).then(r => r.json()),
            fetch(`${API_URL}/pedidos`).then(r => r.json()),
            fetch(`${API_URL}/proveedores`).then(r => r.json())
        ]);

        // Actualizar stats
        document.getElementById('stat-clientes').textContent = clientes.length;
        document.getElementById('stat-productos').textContent = productos.length;
        document.getElementById('stat-pedidos').textContent = pedidos.length;
        document.getElementById('stat-proveedores').textContent = proveedores.length;

        // Actualizar datos recientes
        actualizarRecientes(clientes, pedidos);
        
        // Crear gráficos
        crearGraficos(productos, pedidos);
        
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

function actualizarRecientes(clientes, pedidos) {
    const clientesRecientes = clientes.slice(-5).reverse();
    const pedidosRecientes = pedidos.slice(-5).reverse();
    
    const recentClientes = document.getElementById('recent-clientes');
    const recentPedidos = document.getElementById('recent-pedidos');
    
    if (recentClientes) {
        recentClientes.innerHTML = clientesRecientes.map(c => `
            <div class="recent-item">
                <span>${c.nombre}</span>
                <span>${c.direccion?.ciudad || 'N/A'}</span>
            </div>
        `).join('');
    }
    
    if (recentPedidos) {
        recentPedidos.innerHTML = pedidosRecientes.map(p => `
            <div class="recent-item">
                <span>Pedido #${p._id.slice(-6)}</span>
                <span>$${p.total?.toFixed(2) || '0.00'}</span>
            </div>
        `).join('');
    }
}

function crearGraficos(productos, pedidos) {
    // Gráfico de categorías
    const categorias = {};
    productos.forEach(p => {
        if (p.categoria) {
            categorias[p.categoria] = (categorias[p.categoria] || 0) + 1;
        }
    });
    
    const ctxCategorias = document.getElementById('categoriasChart')?.getContext('2d');
    if (ctxCategorias && Object.keys(categorias).length > 0) {
        if (charts.categorias) charts.categorias.destroy();
        charts.categorias = new Chart(ctxCategorias, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categorias),
                datasets: [{
                    data: Object.values(categorias),
                    backgroundColor: ['#4361ee', '#f72585', '#4cc9f0', '#f8961e']
                }]
            }
        });
    }
    
    // Gráfico de pedidos por estado
    const estados = {};
    pedidos.forEach(p => {
        estados[p.estado] = (estados[p.estado] || 0) + 1;
    });
    
    const ctxPedidos = document.getElementById('pedidosChart')?.getContext('2d');
    if (ctxPedidos && Object.keys(estados).length > 0) {
        if (charts.pedidos) charts.pedidos.destroy();
        charts.pedidos = new Chart(ctxPedidos, {
            type: 'bar',
            data: {
                labels: Object.keys(estados),
                datasets: [{
                    label: 'Cantidad de Pedidos',
                    data: Object.values(estados),
                    backgroundColor: '#4361ee'
                }]
            }
        });
    }
}

// ============= CLIENTES =============
async function cargarClientes() {
    try {
        const response = await fetch(`${API_URL}/clientes`);
        const clientes = await response.json();
        
        const tbody = document.getElementById('clientes-body');
        if (tbody) {
            tbody.innerHTML = clientes.map(c => `
                <tr>
                    <td>${c.nombre}</td>
                    <td>${c.email}</td>
                    <td>${c.telefono || 'N/A'}</td>
                    <td>${c.direccion?.ciudad || 'N/A'}</td>
                    <td>${c.edad || 'N/A'}</td>
                    <td>
                        <button class="btn-icon" onclick="eliminarCliente('${c._id}')" title="Eliminar">
                            <i class="fas fa-trash" style="color: var(--danger);"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error cargando clientes:', error);
    }
}

async function guardarCliente(event) {
    event.preventDefault();
    
    const cliente = {
        nombre: document.getElementById('modal-cliente-nombre').value,
        email: document.getElementById('modal-cliente-email').value,
        telefono: document.getElementById('modal-cliente-telefono').value,
        direccion: {
            ciudad: document.getElementById('modal-cliente-ciudad').value
        },
        edad: parseInt(document.getElementById('modal-cliente-edad').value) || 0
    };
    
    try {
        const response = await fetch(`${API_URL}/clientes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cliente)
        });
        
        if (response.ok) {
            alert('✅ Cliente creado');
            cerrarModal('cliente');
            cargarClientes();
            cargarTodosLosDatos();
            event.target.reset();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al crear cliente');
    }
}

async function eliminarCliente(id) {
    if (confirm('¿Eliminar cliente?')) {
        try {
            await fetch(`${API_URL}/clientes/${id}`, { method: 'DELETE' });
            cargarClientes();
            cargarTodosLosDatos();
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// ============= PRODUCTOS =============
async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        const productos = await response.json();
        
        const grid = document.getElementById('productos-grid');
        if (grid) {
            grid.innerHTML = productos.map(p => `
                <div class="producto-card">
                    <h4>${p.nombre}</h4>
                    <p>${p.descripcion || 'Sin descripción'}</p>
                    <div class="producto-precio">$${p.precio?.toFixed(2) || '0.00'}</div>
                    <span class="producto-categoria">${p.categoria || 'Sin categoría'}</span>
                    <p>📦 Stock: ${p.stock || 0}</p>
                    <button class="btn-filter" onclick="eliminarProducto('${p._id}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
    }
}

async function guardarProducto(event) {
    event.preventDefault();
    
    const producto = {
        nombre: document.getElementById('modal-producto-nombre').value,
        descripcion: document.getElementById('modal-producto-descripcion').value,
        precio: parseFloat(document.getElementById('modal-producto-precio').value) || 0,
        categoria: document.getElementById('modal-producto-categoria').value,
        stock: parseInt(document.getElementById('modal-producto-stock').value) || 0
    };
    
    try {
        const response = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto)
        });
        
        if (response.ok) {
            alert('✅ Producto creado');
            cerrarModal('producto');
            cargarProductos();
            cargarTodosLosDatos();
            event.target.reset();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al crear producto');
    }
}

async function eliminarProducto(id) {
    if (confirm('¿Eliminar producto?')) {
        try {
            await fetch(`${API_URL}/productos/${id}`, { method: 'DELETE' });
            cargarProductos();
            cargarTodosLosDatos();
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// ============= PROVEEDORES =============
async function cargarProveedores() {
    try {
        const response = await fetch(`${API_URL}/proveedores`);
        const proveedores = await response.json();

        const grid = document.getElementById('proveedores-grid');
        if (grid) {
            grid.innerHTML = proveedores.map(p => `
                <div class="proveedor-card">
                    <div class="proveedor-header">
                        <i class="fas fa-building"></i>
                        <h4>${p.nombre}</h4>
                    </div>
                    <div class="proveedor-info">
                        <p><i class="fas fa-user"></i> ${p.contacto || 'Sin contacto'}</p>
                        <p><i class="fas fa-envelope"></i> ${p.email || 'No especificado'}</p>
                        <p><i class="fas fa-phone"></i> ${p.telefono || 'No especificado'}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${p.direccion || 'No especificada'}</p>
                    </div>
                    <div class="proveedor-footer">
                        <span class="badge-productos">
                            <i class="fas fa-box"></i> ${p.productos?.length || 0} productos
                        </span>
                        <button class="btn-icon" onclick="eliminarProveedor('${p._id}')" title="Eliminar">
                            <i class="fas fa-trash" style="color: var(--danger);"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error cargando proveedores:', error);
    }
}

async function guardarProveedor(event) {
    event.preventDefault();

    const proveedor = {
        nombre: document.getElementById('modal-proveedor-nombre').value,
        contacto: document.getElementById('modal-proveedor-contacto').value,
        email: document.getElementById('modal-proveedor-email').value,
        telefono: document.getElementById('modal-proveedor-telefono').value,
        direccion: document.getElementById('modal-proveedor-direccion').value
    };

    try {
        const response = await fetch(`${API_URL}/proveedores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(proveedor)
        });

        if (response.ok) {
            alert('✅ Proveedor creado');
            cerrarModal('proveedor');
            cargarProveedores();
            cargarTodosLosDatos();
            event.target.reset();
        } else {
            const error = await response.json();
            alert('❌ Error: ' + error.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al crear proveedor');
    }
}

async function eliminarProveedor(id) {
    if (confirm('¿Eliminar proveedor?')) {
        try {
            const response = await fetch(`${API_URL}/proveedores/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                cargarProveedores();
                cargarTodosLosDatos();
            } else {
                alert('❌ Error al eliminar proveedor');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

async function filtrarProveedores() {
    try {
        const busqueda = document.getElementById('buscar-proveedor').value.toLowerCase();
        const response = await fetch(`${API_URL}/proveedores`);
        const proveedores = await response.json();

        const filtrados = proveedores.filter(p =>
            p.nombre.toLowerCase().includes(busqueda) ||
            (p.contacto && p.contacto.toLowerCase().includes(busqueda)) ||
            (p.email && p.email.toLowerCase().includes(busqueda))
        );

        const grid = document.getElementById('proveedores-grid');
        grid.innerHTML = filtrados.map(p => `
            <div class="proveedor-card">
                <div class="proveedor-header">
                    <i class="fas fa-building"></i>
                    <h4>${p.nombre}</h4>
                </div>
                <div class="proveedor-info">
                    <p><i class="fas fa-user"></i> ${p.contacto || 'Sin contacto'}</p>
                    <p><i class="fas fa-envelope"></i> ${p.email || 'No especificado'}</p>
                    <p><i class="fas fa-phone"></i> ${p.telefono || 'No especificado'}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${p.direccion || 'No especificada'}</p>
                </div>
                <div class="proveedor-footer">
                    <span class="badge-productos">
                        <i class="fas fa-box"></i> ${p.productos?.length || 0} productos
                    </span>
                    <button class="btn-icon" onclick="eliminarProveedor('${p._id}')">
                        <i class="fas fa-trash" style="color: var(--danger);"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

// ============= PEDIDOS =============
async function cargarPedidos() {
    try {
        const response = await fetch(`${API_URL}/pedidos`);
        const pedidos = await response.json();
        
        const tbody = document.getElementById('pedidos-body');
        if (tbody) {
            tbody.innerHTML = pedidos.map(p => `
                <tr>
                    <td>#${p._id?.slice(-8) || 'N/A'}</td>
                    <td>${p.clienteId?.nombre || 'N/A'}</td>
                    <td>${p.fecha ? new Date(p.fecha).toLocaleDateString() : 'N/A'}</td>
                    <td>$${p.total?.toFixed(2) || '0.00'}</td>
                    <td><span class="status-badge status-${p.estado || 'pendiente'}">${p.estado || 'pendiente'}</span></td>
                    <td>${p.productos?.length || 0} productos</td>
                    <td>
                        <button class="btn-icon" onclick="eliminarPedido('${p._id}')">
                            <i class="fas fa-trash" style="color: var(--danger);"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error cargando pedidos:', error);
    }
}

async function eliminarPedido(id) {
    if (confirm('¿Eliminar pedido?')) {
        try {
            await fetch(`${API_URL}/pedidos/${id}`, { method: 'DELETE' });
            cargarPedidos();
            cargarTodosLosDatos();
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// ============= FILTROS =============
async function filtrarClientes() {
    try {
        const response = await fetch(`${API_URL}/clientes`);
        const clientes = await response.json();
        
        const busqueda = document.getElementById('buscar-cliente').value.toLowerCase();
        const ciudad = document.getElementById('filtro-ciudad').value;
        
        const filtrados = clientes.filter(c => {
            const nombreMatch = c.nombre.toLowerCase().includes(busqueda);
            const ciudadMatch = !ciudad || c.direccion?.ciudad === ciudad;
            return nombreMatch && ciudadMatch;
        });
        
        const tbody = document.getElementById('clientes-body');
        tbody.innerHTML = filtrados.map(c => `
            <tr>
                <td>${c.nombre}</td>
                <td>${c.email}</td>
                <td>${c.telefono || 'N/A'}</td>
                <td>${c.direccion?.ciudad || 'N/A'}</td>
                <td>${c.edad || 'N/A'}</td>
                <td>
                    <button class="btn-icon" onclick="eliminarCliente('${c._id}')">
                        <i class="fas fa-trash" style="color: var(--danger);"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

async function filtrarProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        let productos = await response.json();
        
        const busqueda = document.getElementById('buscar-producto').value.toLowerCase();
        const categoria = document.getElementById('filtro-categoria').value;
        const precioMax = document.getElementById('precio-max').value;
        
        if (busqueda) {
            productos = productos.filter(p => p.nombre.toLowerCase().includes(busqueda));
        }
        if (categoria) {
            productos = productos.filter(p => p.categoria === categoria);
        }
        if (precioMax) {
            productos = productos.filter(p => p.precio <= parseFloat(precioMax));
        }
        
        const grid = document.getElementById('productos-grid');
        grid.innerHTML = productos.map(p => `
            <div class="producto-card">
                <h4>${p.nombre}</h4>
                <p>${p.descripcion || 'Sin descripción'}</p>
                <div class="producto-precio">$${p.precio?.toFixed(2) || '0.00'}</div>
                <span class="producto-categoria">${p.categoria || 'Sin categoría'}</span>
                <p>📦 Stock: ${p.stock || 0}</p>
                <button class="btn-filter" onclick="eliminarProducto('${p._id}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

async function filtrarPedidos() {
    try {
        const response = await fetch(`${API_URL}/pedidos`);
        let pedidos = await response.json();
        
        const estado = document.getElementById('filtro-estado').value;
        const totalMin = document.getElementById('total-min').value;
        
        if (estado) {
            pedidos = pedidos.filter(p => p.estado === estado);
        }
        if (totalMin) {
            pedidos = pedidos.filter(p => p.total >= parseFloat(totalMin));
        }
        
        const tbody = document.getElementById('pedidos-body');
        tbody.innerHTML = pedidos.map(p => `
            <tr>
                <td>#${p._id?.slice(-8) || 'N/A'}</td>
                <td>${p.clienteId?.nombre || 'N/A'}</td>
                <td>${p.fecha ? new Date(p.fecha).toLocaleDateString() : 'N/A'}</td>
                <td>$${p.total?.toFixed(2) || '0.00'}</td>
                <td><span class="status-badge status-${p.estado || 'pendiente'}">${p.estado || 'pendiente'}</span></td>
                <td>${p.productos?.length || 0} productos</td>
                <td>
                    <button class="btn-icon" onclick="eliminarPedido('${p._id}')">
                        <i class="fas fa-trash" style="color: var(--danger);"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

// ============= CONSULTAS =============
async function ejecutarConsulta(tipo) {
    let response;
    try {
        switch(tipo) {
            case 'clientes-mayores':
                response = await fetch(`${API_URL}/consultas/clientes-mayores-30`);
                const mayores30 = await response.json();
                mostrarResultado('resultado-clientes-mayores', mayores30.map(c => 
                    `<div class="recent-item">${c.nombre} - ${c.edad} años</div>`
                ).join('') || '<p>No hay resultados</p>');
                break;
                
            case 'clientes-ciudades':
                response = await fetch(`${API_URL}/consultas/clientes-ciudades`);
                const clientesCiudad = await response.json();
                mostrarResultado('resultado-clientes-ciudades', clientesCiudad.map(c => 
                    `<div class="recent-item">${c.nombre} - ${c.direccion?.ciudad}</div>`
                ).join('') || '<p>No hay resultados</p>');
                break;
                
            case 'accesorios-baratos':
                response = await fetch(`${API_URL}/consultas/productos-accesorios-baratos`);
                const accesorios = await response.json();
                mostrarResultado('resultado-accesorios', accesorios.map(p => 
                    `<div class="recent-item">${p.nombre} - $${p.precio}</div>`
                ).join('') || '<p>No hay resultados</p>');
                break;
                
            case 'pedidos-reto':
                response = await fetch(`${API_URL}/consultas/pedidos-reto`);
                const reto = await response.json();
                mostrarResultado('resultado-pedidos-reto', reto.map(p => 
                    `<div class="recent-item">Pedido $${p.total} - ${p.productos?.length || 0} productos</div>`
                ).join('') || '<p>No hay resultados</p>');
                break;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function mostrarResultado(elementId, contenido) {
    const elemento = document.getElementById(elementId);
    if (elemento) {
        elemento.innerHTML = contenido;
    }
}

// ============= MODALES =============
function mostrarModal(tipo) {
    const modal = document.getElementById(`modal-${tipo}`);
    if (modal) {
        modal.classList.add('active');
    }
}

function cerrarModal(tipo) {
    const modal = document.getElementById(`modal-${tipo}`);
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============= UTILIDADES =============
function actualizarDashboard() {
    cargarTodosLosDatos();
}

// Cerrar modales con click fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};