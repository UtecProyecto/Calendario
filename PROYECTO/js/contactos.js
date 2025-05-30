document.addEventListener('DOMContentLoaded', function() {
    // Cargar contactos existentes
    loadContactos();
    
    // Configurar manejador del formulario
    document.getElementById('form-contacto').addEventListener('submit', function(e) {
        e.preventDefault();
        addContacto();
    });
    
    // Configurar búsqueda
    document.getElementById('buscar-contacto').addEventListener('input', function(e) {
        filterContactos(e.target.value);
    });
});

let editingContactId = null; // Para controlar edición

function loadContactos() {
    const contactos = loadFromLocalStorage('contactos');
    displayContactos(contactos);
}

function addContacto() {
    const nombre = document.getElementById('nombre-contacto').value;
    const tipo = document.getElementById('tipo-contacto').value;
    const telefono = document.getElementById('telefono-contacto').value;
    const email = document.getElementById('email-contacto').value;
    const notas = document.getElementById('notas-contacto').value;
    
    if (!nombre || !tipo) {
        showAlert('Por favor complete los campos obligatorios', 'danger');
        return;
    }
    
    let contactos = loadFromLocalStorage('contactos');
    
    if (editingContactId) {
        // Modo edición
        const index = contactos.findIndex(c => c.id === editingContactId);
        if (index !== -1) {
            contactos[index] = {
                id: editingContactId,
                nombre,
                tipo,
                telefono,
                email,
                notas
            };
            
            showAlert('Contacto actualizado correctamente', 'success');
        }
        editingContactId = null;
    } else {
        // Modo creación
        const nuevoContacto = {
            id: Date.now(),
            nombre,
            tipo,
            telefono,
            email,
            notas
        };
        
        contactos.push(nuevoContacto);
        showAlert('Contacto agregado correctamente', 'success');
    }
    
    // Guardar en localStorage
    saveToLocalStorage('contactos', contactos);
    
    // Actualizar lista
    displayContactos(contactos);
    
    // Resetear formulario
    document.getElementById('form-contacto').reset();
    
    // Cambiar texto del botón si estaba en edición
    const submitBtn = document.querySelector('#form-contacto button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save me-1"></i>Guardar';
}

function displayContactos(contactos) {
    const tbody = document.getElementById('lista-contactos');
    tbody.innerHTML = '';
    
    // Ordenar por nombre
    contactos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    if (contactos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted">No hay contactos</td></tr>';
        return;
    }
    
    contactos.forEach(contacto => {
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
                <button class="btn btn-sm btn-outline-primary me-1 edit-btn" data-id="${contacto.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${contacto.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // Añadir manejadores de eventos
        tr.querySelector('.edit-btn').addEventListener('click', function() {
            editContacto(contacto.id);
        });
        
        tr.querySelector('.delete-btn').addEventListener('click', function() {
            deleteContacto(contacto.id);
        });
        
        tbody.appendChild(tr);
    });
}

function editContacto(id) {
    const contactos = loadFromLocalStorage('contactos');
    const contacto = contactos.find(c => c.id === id);
    
    if (!contacto) return;
    
    // Llenar formulario con datos del contacto
    document.getElementById('nombre-contacto').value = contacto.nombre;
    document.getElementById('tipo-contacto').value = contacto.tipo;
    document.getElementById('telefono-contacto').value = contacto.telefono || '';
    document.getElementById('email-contacto').value = contacto.email || '';
    document.getElementById('notas-contacto').value = contacto.notas || '';
    
    // Cambiar a modo edición
    editingContactId = id;
    
    // Cambiar texto del botón
    const submitBtn = document.querySelector('#form-contacto button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save me-1"></i>Actualizar';
    
    // Desplazarse al formulario
    document.getElementById('form-contacto').scrollIntoView({ behavior: 'smooth' });
}

function deleteContacto(id) {
    if (!confirm('¿Está seguro que desea eliminar este contacto?')) return;
    
    // Eliminar de localStorage
    let contactos = loadFromLocalStorage('contactos');
    contactos = contactos.filter(c => c.id !== id);
    saveToLocalStorage('contactos', contactos);
    
    // Actualizar lista
    displayContactos(contactos);
    
    // Mostrar notificación
    showAlert('Contacto eliminado correctamente', 'success');
}

function filterContactos(searchTerm) {
    const contactos = loadFromLocalStorage('contactos');
    
    if (!searchTerm) {
        displayContactos(contactos);
        return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = contactos.filter(contacto => 
        contacto.nombre.toLowerCase().includes(term) ||
        getTipoText(contacto.tipo).toLowerCase().includes(term) ||
        (contacto.email && contacto.email.toLowerCase().includes(term)) ||
        (contacto.telefono && contacto.telefono.includes(term)) ||
        (contacto.notas && contacto.notas.toLowerCase().includes(term))
    );
    
    displayContactos(filtered);
}