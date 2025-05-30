document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el calendario
    initCalendar();
    
    // Cargar recordatorios existentes
    loadRecordatorios();
    
    // Configurar manejador del formulario
    document.getElementById('form-recordatorio').addEventListener('submit', function(e) {
        e.preventDefault();
        addRecordatorio();
    });
});

let calendar; // Variable global para el calendario

function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        eventClick: function(info) {
            showEventDetails(info.event);
        },
        eventClassNames: function(arg) {
            // Añadir clase CSS basada en el tipo de evento
            return ['fc-event-' + arg.event.extendedProps.tipo];
        }
    });
    
    calendar.render();
}

function loadRecordatorios() {
    const recordatorios = loadFromLocalStorage('recordatorios');
    addEventsToCalendar(recordatorios);
    updateRecordatoriosList(recordatorios);
}

function addEventsToCalendar(events) {
    events.forEach(event => {
        calendar.addEvent({
            id: event.id,
            title: event.title,
            start: event.start,
            allDay: true,
            tipo: event.tipo,
            backgroundColor: getEventColor(event.tipo),
            borderColor: getEventColor(event.tipo)
        });
    });
}

function getEventColor(tipo) {
    const colores = {
        'iva': '#dc3545',
        'renta': '#fd7e14',
        'iss': '#20c997',
        'afp': '#6f42c1',
        'cierre': '#17a2b8',
        'auditoria': '#343a40',
        'otro': '#6c757d'
    };
    
    return colores[tipo] || '#6c757d';
}

function addRecordatorio() {
    const titulo = document.getElementById('titulo-recordatorio').value;
    const fecha = document.getElementById('fecha-recordatorio').value;
    const tipo = document.getElementById('tipo-recordatorio').value;
    
    if (!titulo || !fecha || !tipo) {
        showAlert('Por favor complete todos los campos', 'danger');
        return;
    }
    
    const nuevoRecordatorio = {
        id: Date.now(),
        title: titulo,
        start: fecha,
        tipo: tipo,
        allDay: true
    };
    
    // Guardar en localStorage
    const recordatorios = loadFromLocalStorage('recordatorios');
    recordatorios.push(nuevoRecordatorio);
    saveToLocalStorage('recordatorios', recordatorios);
    
    // Añadir al calendario
    calendar.addEvent({
        id: nuevoRecordatorio.id,
        title: nuevoRecordatorio.title,
        start: nuevoRecordatorio.start,
        allDay: true,
        tipo: nuevoRecordatorio.tipo,
        backgroundColor: getEventColor(nuevoRecordatorio.tipo),
        borderColor: getEventColor(nuevoRecordatorio.tipo)
    });
    
    // Actualizar lista
    updateRecordatoriosList(recordatorios);
    
    // Resetear formulario
    document.getElementById('form-recordatorio').reset();
    
    // Mostrar notificación
    showAlert('Recordatorio agregado correctamente', 'success');
}

function updateRecordatoriosList(recordatorios) {
    const lista = document.getElementById('lista-recordatorios');
    lista.innerHTML = '';
    
    // Ordenar por fecha más cercana
    recordatorios.sort((a, b) => new Date(a.start) - new Date(b.start));
    
    if (recordatorios.length === 0) {
        lista.innerHTML = '<li class="list-group-item text-muted">No hay recordatorios</li>';
        return;
    }
    
    recordatorios.forEach(recordatorio => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        const fechaFormateada = formatDate(new Date(recordatorio.start));
        
        li.innerHTML = `
            <div>
                <strong>${recordatorio.title}</strong>
                <small class="d-block text-muted">${fechaFormateada}</small>
            </div>
            <div>
                <span class="badge bg-${getBadgeColor(recordatorio.tipo)} rounded-pill me-2">
                    ${getTipoText(recordatorio.tipo)}
                </span>
                <button class="btn btn-sm btn-outline-danger" data-id="${recordatorio.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Añadir manejador de evento para eliminar
        li.querySelector('button').addEventListener('click', function() {
            deleteRecordatorio(recordatorio.id);
        });
        
        lista.appendChild(li);
    });
}

function deleteRecordatorio(id) {
    // Eliminar de localStorage
    let recordatorios = loadFromLocalStorage('recordatorios');
    recordatorios = recordatorios.filter(r => r.id !== id);
    saveToLocalStorage('recordatorios', recordatorios);
    
    // Eliminar del calendario
    const event = calendar.getEventById(id);
    if (event) {
        event.remove();
    }
    
    // Actualizar lista
    updateRecordatoriosList(recordatorios);
    
    // Mostrar notificación
    showAlert('Recordatorio eliminado correctamente', 'success');
}

function showEventDetails(event) {
    const fechaFormateada = formatDate(new Date(event.start));
    const tipo = getTipoText(event.extendedProps.tipo);
    
    // Crear modal de detalles
    const modalHtml = `
        <div class="modal fade" id="eventModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${event.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Tipo:</strong> <span class="badge bg-${getBadgeColor(event.extendedProps.tipo)}">
                            ${tipo}
                        </span></p>
                        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-danger" id="deleteEventBtn">
                            <i class="fas fa-trash me-1"></i>Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Añadir modal al DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
    
    // Configurar botón de eliminar
    document.getElementById('deleteEventBtn').addEventListener('click', function() {
        modal.hide();
        deleteRecordatorio(event.id);
        modalContainer.remove();
    });
    
    // Eliminar modal del DOM cuando se cierre
    document.getElementById('eventModal').addEventListener('hidden.bs.modal', function() {
        modalContainer.remove();
    });
}