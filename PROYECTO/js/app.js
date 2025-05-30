// Funciones de utilidad compartidas entre todas las páginas

/**
 * Formatea una fecha a texto legible
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

/**
 * Obtiene el texto descriptivo para un tipo de evento/contacto
 * @param {string} tipo - Tipo a traducir
 * @returns {string} Texto descriptivo
 */
function getTipoText(tipo) {
    const tipos = {
        'iva': 'Declaración IVA',
        'renta': 'Impuesto Renta',
        'iss': 'Pago ISS',
        'afp': 'Pago AFP',
        'cierre': 'Cierre Contable',
        'auditoria': 'Auditoría',
        'contador': 'Contador',
        'auditor': 'Auditor',
        'proveedor': 'Proveedor',
        'cliente': 'Cliente',
        'otro': 'Otro',
        'ingreso': 'Ingreso',
        'gasto': 'Gasto'
    };
    
    return tipos[tipo] || tipo;
}

/**
 * Obtiene el color de badge para un tipo
 * @param {string} tipo - Tipo a evaluar
 * @returns {string} Clase de color Bootstrap
 */
function getBadgeColor(tipo) {
    const colores = {
        'iva': 'danger',
        'renta': 'warning',
        'iss': 'success',
        'afp': 'primary',
        'cierre': 'info',
        'auditoria': 'dark',
        'contador': 'primary',
        'auditor': 'info',
        'proveedor': 'success',
        'cliente': 'warning',
        'otro': 'secondary',
        'ingreso': 'success',
        'gasto': 'danger'
    };
    
    return colores[tipo] || 'secondary';
}

/**
 * Muestra una alerta temporal
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de alerta (success, danger, etc.)
 */
function showAlert(message, type) {
    const alertPlaceholder = document.createElement('div');
    alertPlaceholder.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    document.body.prepend(alertPlaceholder.firstChild);
    
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance(alertPlaceholder.querySelector('.alert'));
        alert.close();
    }, 3000);
}

/**
 * Guarda datos en localStorage
 * @param {string} key - Clave de almacenamiento
 * @param {Array} data - Datos a guardar
 */
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Carga datos desde localStorage
 * @param {string} key - Clave de almacenamiento
 * @returns {Array} Datos recuperados o array vacío si no existen
 */
function loadFromLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

/**
 * Formatea un número como moneda
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Cantidad formateada como moneda
 */
function formatCurrency(amount) {
    return amount.toLocaleString('es-ES', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    });
}