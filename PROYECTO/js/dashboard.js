document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos para el dashboard
    loadDashboardData();
});

function loadDashboardData() {
    // Cargar próximos recordatorios
    const recordatorios = loadFromLocalStorage('recordatorios');
    displayProximosRecordatorios(recordatorios);
    
    // Cargar últimos registros
    const registros = loadFromLocalStorage('registros');
    displayUltimosRegistros(registros);
    
    // Cargar contactos recientes
    const contactos = loadFromLocalStorage('contactos');
    displayContactosRecientes(contactos);
}

function displayProximosRecordatorios(recordatorios) {
    const lista = document.getElementById('proximos-recordatorios');
    lista.innerHTML = '';
    
    // Filtrar solo futuros y ordenar por fecha
    const ahora = new Date();
    const futuros = recordatorios
        .filter(r => new Date(r.start) >= ahora)
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .slice(0, 5); // Mostrar solo 5
    
    if (futuros.length === 0) {
        lista.innerHTML = '<li class="list-group-item text-muted">No hay recordatorios próximos</li>';
        return;
    }
    
    futuros.forEach(recordatorio => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        const fechaFormateada = formatDate(new Date(recordatorio.start));
        
        li.innerHTML = `
            <div>
                <strong>${recordatorio.title}</strong>
                <small class="d-block text-muted">${fechaFormateada}</small>
            </div>
            <span class="badge bg-${getBadgeColor(recordatorio.tipo)} rounded-pill">
                ${getTipoText(recordatorio.tipo)}
            </span>
        `;
        
        lista.appendChild(li);
    });
}

function displayUltimosRegistros(registros) {
    const tbody = document.getElementById('lista-registros');
    tbody.innerHTML = '';
    
    // Ordenar por fecha más reciente y mostrar solo 5
    const recientes = registros
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5);
    
    if (recientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted">No hay registros recientes</td></tr>';
        return;
    }
    
    recientes.forEach(registro => {
        const tr = document.createElement('tr');
        
        const fechaFormateada = formatDate(new Date(registro.fecha));
        const montoFormateado = formatCurrency(registro.monto);
        
        tr.innerHTML = `
            <td>${fechaFormateada}</td>
            <td><span class="badge bg-${getBadgeColor(registro.tipo)}">
                ${getTipoText(registro.tipo)}
            </span></td>
            <td>${registro.descripcion || 'Sin descripción'}</td>
            <td class="${registro.tipo === 'ingreso' ? 'text-success' : 'text-danger'} fw-bold">
                ${montoFormateado}
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

function displayContactosRecientes(contactos) {
    const tbody = document.getElementById('lista-contactos');
    tbody.innerHTML = '';
    
    // Ordenar por más recientes (asumiendo ID es timestamp) y mostrar solo 5
    const recientes = contactos
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);
    
    if (recientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted">No hay contactos recientes</td></tr>';
        return;
    }
    
    recientes.forEach(contacto => {
        const tr = document.createElement('tr');
        
        // Determinar el mejor método de contacto
        let metodoContacto = '';
        if (contacto.email && contacto.telefono) {
            metodoContacto = `${contacto.telefono} / ${contacto.email}`;
        } else if (contacto.email) {
            metodoContacto = contacto.email;
        } else if (contacto.telefono) {
            metodoContacto = contacto.telefono;
        } else {
            metodoContacto = 'Sin contacto';
        }
        
        tr.innerHTML = `
            <td>${contacto.nombre}</td>
            <td><span class="badge bg-${getBadgeColor(contacto.tipo)}">
                ${getTipoText(contacto.tipo)}
            </span></td>
            <td>${metodoContacto}</td>
            <td>
                <a href="contactos.html" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-eye"></i>
                </a>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}