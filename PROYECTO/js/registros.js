document.addEventListener('DOMContentLoaded', function() {
    // Cargar registros existentes
    loadRegistros();
    
    // Configurar manejador del formulario
    document.getElementById('form-registro').addEventListener('submit', function(e) {
        e.preventDefault();
        addRegistro();
    });
    
    // Configurar búsqueda
    document.getElementById('buscar-registro').addEventListener('input', function(e) {
        filterRegistros(e.target.value);
    });
});

function loadRegistros() {
    const registros = loadFromLocalStorage('registros');
    displayRegistros(registros);
    
    // Calcular y mostrar resumen
    updateResumen(registros);
}

function addRegistro() {
    const tipo = document.querySelector('input[name="tipo-registro"]:checked').value;
    const monto = parseFloat(document.getElementById('monto-registro').value);
    const descripcion = document.getElementById('descripcion-registro').value;
    const fecha = document.getElementById('fecha-registro').value;
    
    if (!monto || !fecha) {
        showAlert('Por favor complete los campos obligatorios', 'danger');
        return;
    }
    
    const nuevoRegistro = {
        id: Date.now(),
        tipo: tipo,
        monto: monto,
        descripcion: descripcion,
        fecha: fecha
    };
    
    // Guardar en localStorage
    const registros = loadFromLocalStorage('registros');
    registros.push(nuevoRegistro);
    saveToLocalStorage('registros', registros);
    
    // Actualizar lista
    displayRegistros(registros);
    
    // Actualizar resumen
    updateResumen(registros);
    
    // Resetear formulario
    document.getElementById('form-registro').reset();
    
    // Mostrar notificación
    showAlert('Registro agregado correctamente', 'success');
}

function displayRegistros(registros) {
    const tbody = document.getElementById('lista-registros');
    tbody.innerHTML = '';
    
    // Ordenar por fecha más reciente
    registros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    if (registros.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-muted">No hay registros</td></tr>';
        return;
    }
    
    registros.forEach(registro => {
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
            <td>
                <button class="btn btn-sm btn-outline-danger" data-id="${registro.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // Añadir manejador para eliminar
        tr.querySelector('button').addEventListener('click', function() {
            deleteRegistro(registro.id);
        });
        
        tbody.appendChild(tr);
    });
}

function deleteRegistro(id) {
    // Eliminar de localStorage
    let registros = loadFromLocalStorage('registros');
    registros = registros.filter(r => r.id !== id);
    saveToLocalStorage('registros', registros);
    
    // Actualizar lista
    displayRegistros(registros);
    
    // Actualizar resumen
    updateResumen(registros);
    
    // Mostrar notificación
    showAlert('Registro eliminado correctamente', 'success');
}

function filterRegistros(searchTerm) {
    const registros = loadFromLocalStorage('registros');
    
    if (!searchTerm) {
        displayRegistros(registros);
        return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = registros.filter(registro => 
        registro.descripcion?.toLowerCase().includes(term) ||
        getTipoText(registro.tipo).toLowerCase().includes(term) ||
        registro.monto.toString().includes(term) ||
        formatDate(new Date(registro.fecha)).toLowerCase().includes(term)
    );
    
    displayRegistros(filtered);
}

function updateResumen(registros) {
    const totalIngresos = registros
        .filter(r => r.tipo === 'ingreso')
        .reduce((sum, r) => sum + r.monto, 0);
    
    const totalGastos = registros
        .filter(r => r.tipo === 'gasto')
        .reduce((sum, r) => sum + r.monto, 0);
    
    const balance = totalIngresos - totalGastos;
    
    // Actualizar o crear el resumen
    let resumenContainer = document.getElementById('resumen-container');
    if (!resumenContainer) {
        resumenContainer = document.createElement('div');
        resumenContainer.id = 'resumen-container';
        resumenContainer.className = 'row mb-4';
        document.querySelector('main').prepend(resumenContainer);
    }
    
    resumenContainer.innerHTML = `
        <div class="col-md-4">
            <div class="card bg-success text-white">
                <div class="card-body">
                    <h5 class="card-title">Ingresos</h5>
                    <p class="card-text h4">${formatCurrency(totalIngresos)}</p>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card bg-danger text-white">
                <div class="card-body">
                    <h5 class="card-title">Gastos</h5>
                    <p class="card-text h4">${formatCurrency(totalGastos)}</p>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card ${balance >= 0 ? 'bg-primary' : 'bg-warning'} text-white">
                <div class="card-body">
                    <h5 class="card-title">Balance</h5>
                    <p class="card-text h4">${formatCurrency(balance)}</p>
                </div>
            </div>
        </div>
    `;
}