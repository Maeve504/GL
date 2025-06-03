// ==UserScript==
// @name         Gestión de Multicuentas GL
// @namespace    https://tu.namespace.aqui
// @version      1.6
// @description  Modal persistente para gestionar multicuentas con advertencias en Gladiatus
// @author       Tú
// @match        https://s55-es.gladiatus.gameforge.com/admin*
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use strict';

    if (window.multiModalCreated) return;
    window.multiModalCreated = true;

    const storageKey = 'gestionMulticuentasDatos';

    function guardarTodosDatos() {
        const datos = {
            ids: document.getElementById('idsInput').value,
            infraccion: document.getElementById('infraccionSelect').value,
            idioma: document.getElementById('idiomaSelect').value,
            posLeft: modal.style.left,
            posTop: modal.style.top
        };
        localStorage.setItem(storageKey, JSON.stringify(datos));
    }

    function cargarTodosDatos() {
        const datosStr = localStorage.getItem(storageKey);
        if (!datosStr) return;
        try {
            const datos = JSON.parse(datosStr);
            if (datos.ids !== undefined) document.getElementById('idsInput').value = datos.ids;
            if (datos.infraccion !== undefined) document.getElementById('infraccionSelect').value = datos.infraccion;
            if (datos.idioma !== undefined) document.getElementById('idiomaSelect').value = datos.idioma;
            if (datos.posLeft !== undefined) modal.style.left = datos.posLeft;
            if (datos.posTop !== undefined) modal.style.top = datos.posTop;
        } catch (e) {
            console.error('Error cargando datos guardados:', e);
        }
    }

    function mostrarFeedbackCopiado(boton) {
        const textoOriginal = boton.textContent;
        boton.textContent = 'Copiado';
        boton.style.background = '#4CAF50';
        setTimeout(() => {
            boton.textContent = textoOriginal;
            boton.style.background = '';
        }, 2000);
    }

    const modal = document.createElement('div');
    modal.id = 'multiModal';
    modal.style.position = 'fixed';
    modal.style.top = '100px';
    modal.style.left = '100px';
    modal.style.width = '500px';
    modal.style.backgroundColor = '#e0e0e0';
    modal.style.border = '2px solid #444';
    modal.style.zIndex = '9999';
    modal.style.padding = '15px';
    modal.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    modal.style.borderRadius = '10px';
    modal.style.cursor = 'move';
    modal.style.fontFamily = 'Arial, sans-serif';
    modal.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2 style="margin:0; font-size:24px;">Gestión de multicuentas</h2>
            <span id="cerrarModal" style="cursor:pointer; font-weight:bold;">❌</span>
        </div>
        <hr>

        <div style="margin-bottom:10px;">
            <label style="color:#222; font-weight:bold; display:block; width:100%;">IDs (separadas por coma):</label>
            <div style="display:flex; gap:10px; align-items:center;">
                <input type="text" id="idsInput" style="flex:1; padding:5px;">
                <button id="detectarBtn" style="padding:6px 12px;">Detectar</button>
            </div>
        </div>

        <div style="margin-bottom:10px;">
            <label style="color:#222; font-weight:bold; display:block; width:100%;">Nota interna (recurrencia):</label>
            <div style="display:flex; gap:10px; align-items:center;">
                <select id="infraccionSelect" style="flex:1; padding:5px;">
                    <option value="1">1ra Infracción</option>
                    <option value="2">2da Infracción</option>
                    <option value="3">3ra Infracción</option>
                    <option value="4">4ta Infracción</option>
                    <option value="5">5ta Infracción</option>
                </select>
                <button id="generarBtn" style="padding:6px 12px;">Generar</button>
            </div>
        </div>

        <div style="margin-bottom:10px;">
            <label style="color:#222; font-weight:bold; display:block; width:100%;">Aviso al jugador:</label>
            <div style="display:flex; gap:10px; align-items:center;">
                <select id="idiomaSelect" style="flex:1; padding:5px;">
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                </select>
                <button id="advertenciaBtn" style="padding:6px 12px;">Generar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('cerrarModal').addEventListener('click', () => {
        modal.remove();
        localStorage.removeItem(storageKey);
    });

    let isDragging = false;
    let offsetX, offsetY;
    modal.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - modal.getBoundingClientRect().left;
        offsetY = e.clientY - modal.getBoundingClientRect().top;
    });
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            modal.style.left = (e.clientX - offsetX) + 'px';
            modal.style.top = (e.clientY - offsetY) + 'px';
        }
    });
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            guardarTodosDatos();
        }
    });

    // Función para normalizar texto y comparar
    function normalizarTexto(texto) {
        return texto.toLowerCase().replace(/\s+/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // Botón DETECTAR corregido
    document.getElementById('detectarBtn').addEventListener('click', () => {
        const btn = document.getElementById('detectarBtn');
        const table = document.getElementById('userList');
        if (!table) {
            alert('No se encontró la tabla con id="userList".');
            return;
        }

        // Buscar fila con encabezados (<th>) dentro de <thead> o primera fila de la tabla
        let headerRow = null;
        const thead = table.querySelector('thead');
        if (thead) {
            headerRow = thead.querySelector('tr');
        }
        if (!headerRow) {
            // Buscar la primera fila con <th> dentro de <tbody> o directamente en <table>
            const rows = table.querySelectorAll('tr');
            for (const row of rows) {
                if (row.querySelector('th')) {
                    headerRow = row;
                    break;
                }
            }
        }

        if (!headerRow) {
            alert('No se encontró ninguna fila con encabezados (<th>) en la tabla.');
            return;
        }

        const ths = headerRow.querySelectorAll('th');
        let idCol = -1;
        for (let i = 0; i < ths.length; i++) {
            const textoNorm = normalizarTexto(ths[i].textContent);
            if (textoNorm === 'iddeljugador') { // coincidencia exacta normalizada
                idCol = i;
                break;
            }
        }

        if (idCol === -1) {
            alert('No se encontró la columna "ID del Jugador".');
            return;
        }

        const ids = [];
        // Para las filas con datos, buscamos todas las que tienen celdas <td>
        const dataRows = table.querySelectorAll('tr');
        for (const row of dataRows) {
            const tds = row.querySelectorAll('td');
            if (tds.length > idCol) {
                const id = tds[idCol].textContent.trim();
if (id && !isNaN(id) && id !== '0') {
    ids.push(id);
}

            }
        }

        if (ids.length === 0) {
            alert('No se encontraron IDs en la columna "ID del Jugador".');
            return;
        }

        document.getElementById('idsInput').value = ids.join(', ');
        guardarTodosDatos();
        mostrarFeedbackCopiado(btn);
    });

    // Botón GENERAR nota interna
    document.getElementById('generarBtn').addEventListener('click', () => {
        const btn = document.getElementById('generarBtn');
        const ids = document.getElementById('idsInput').value.split(',').map(s => s.trim()).filter(Boolean).join(', ');
        const nivel = parseInt(document.getElementById('infraccionSelect').value);
        let texto = `Multi accounts found: [${ids}]\n\n`;

        const sanciones = {
            1: "Issued 1st offense for unannounced multies (Warning).",
            2: "Issued 2nd offense for unannounced multies (3 days).",
            3: "Issued 3rd offense for unannounced multies (5 days).",
            4: "Issued 4th offense for unannounced multies (7 days).",
            5: "Issued 5th offense for unannounced multies (14 days)."
        };

        texto += `${sanciones[nivel]}\nLinked by the support team.`;

        GM_setClipboard(texto);

        mostrarFeedbackCopiado(btn);
        guardarTodosDatos();
    });

    // Botón ADVERTENCIA (mensaje en español, inglés, francés)
    document.getElementById('advertenciaBtn').addEventListener('click', () => {
        const btn = document.getElementById('advertenciaBtn');
        const idioma = document.getElementById('idiomaSelect').value;
        const ids = document.getElementById('idsInput').value.split(',').map(s => s.trim()).filter(Boolean).join(', ');

        if (!ids) {
            alert('Por favor, ingresa o detecta IDs primero.');
            return;
        }

        let textoAviso = '';

        if (idioma === 'es') {
            textoAviso = `Querido jugador,

Nuestros datos del juego nos indican que tienes varias cuentas que no están vinculadas en nuestro sistema. Las reglas del juego requieren la vinculación de dichas cuentas para evitar ser sancionado. Al ser ésta la primera vez, no recibirás ninguna penalización. En próximas ocasiones, si persistes en tener multicuentas sin vincular podrías enfrentarte a un bloqueo temporal o permanente.

Equipo de Gladiatus`;
        } else if (idioma === 'en') {
            textoAviso = `Dear player,

Our game data has shown that you have multiple accounts that are not linked in our system. Our game rules require the linking of these accounts. Since this is your first time doing this, you will not face any penalty. If you don't announce the accounts again, you could face either a temporary or permanent ban.

Gladiatus team`;
        } else if (idioma === 'fr') {
            textoAviso = `Cher joueur,

Nos données de jeu indiquent que vous possédez plusieurs comptes qui ne sont pas liés dans notre système. Selon les règles du jeu, il est obligatoire de les déclarer.

Puisqu’il s’agit de votre première infraction, aucune sanction ne sera appliquée. Cependant, si vous ne déclarez pas vos comptes à nouveau, vous risquez une suspension temporaire ou définitive.

L’équipe de Gladiatus.`;
        }

        GM_setClipboard(textoAviso);

        mostrarFeedbackCopiado(btn);
        guardarTodosDatos();
    });

    // Cargar datos al inicio
    cargarTodosDatos();

})();
