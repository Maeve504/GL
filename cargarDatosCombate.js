// ==UserScript==
// @name         CombatLog Recopilador + Modal con Cancelación
// @namespace    Gladiatus Tools
// @version      1.2
// @description  Recopila todas las horas de combate y las muestra en un modal con progreso y botón de cerrar
// @match        https://s*-es.gladiatus.gameforge.com/admin/index.php?action=module&modName=CombatLog&mode=showUser*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  /******************** 1. LÓGICA DE CARGA ************************/

  let cancelarPeticion = false;           // ← bandera global para abortar

  async function buscarCombatePorIDConProgreso(userId, tipoCombate, onProgress) {
    const base = 'https://s55-es.gladiatus.gameforge.com/admin/index.php?action=module&modName=CombatLog&mode=showUser';
    const horas = [];
    let offset = 0;
    let pagina = 0;

    cancelarPeticion = false;             // reiniciamos bandera

    while (true) {
      if (cancelarPeticion) throw new Error('Proceso cancelado por el usuario');

      const url = `${base}&user_id=${userId}&cType=${tipoCombate}&offset=${offset}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const html = await resp.text();

      // Fin si no hay más combates
      if (html.includes('No hay informes de combate disponibles.')) break;

      const doc = new DOMParser().parseFromString(html, 'text/html');
      const filas = Array.from(doc.querySelectorAll('table tr')).slice(1); // omitimos cabecera
      if (!filas.length) break;

      filas.forEach(tr => {
        const hora = tr.querySelector('td')?.textContent.trim();
        if (hora) horas.push(hora);
      });

      pagina++;
      if (onProgress) onProgress(`Página ${pagina}…`);

      // ¿existe «Siguiente»?
      if (!html.includes('Siguiente &raquo;')) break;

      offset += 30;
    }

    if (onProgress) onProgress('Completado.');
    return horas;
  }

  /******************** 2. INTERFAZ – BOTÓN LATERAL ************************/

  const boton = document.createElement('button');
  boton.textContent = 'Recopilar Combates';
  Object.assign(boton.style, {
    position: 'fixed', top: '90px', right: '20px',
    padding: '8px 14px', zIndex: 9999,
    background: '#c61ddf', color: '#fff',
    border: 'none', borderRadius: '6px', cursor: 'pointer'
  });
  document.body.appendChild(boton);

  boton.onclick = () => crearModal();

  /******************** 3. MODAL ************************/

  function crearModal() {
    // --- estructura principal
    const modal = document.createElement('div');
    Object.assign(modal.style, {
      position: 'fixed', top: '15%', left: '27%', width: '46%', height: '360px',
      background: '#1f1f1f', color: '#eee', borderRadius: '10px',
      boxShadow: '0 0 15px rgba(0,0,0,.6)', display: 'flex',
      zIndex: 10000, overflow: 'hidden'
    });

    // --- botón X (cierra y cancela)
    const btnX = document.createElement('button');
    btnX.textContent = '×';
    Object.assign(btnX.style, {
      position: 'absolute', top: '6px', right: '10px',
      fontSize: '26px', background: 'transparent',
      border: 'none', color: '#ccc', cursor: 'pointer'
    });
    btnX.onclick = () => {
      cancelarPeticion = true;
      modal.remove();
    };
    modal.appendChild(btnX);

    // --- contenedor tabla (scroll interno)
    const contTabla = document.createElement('div');
    Object.assign(contTabla.style, {
      flex: '3', overflowY: 'auto', padding: '10px'
    });
    const tabla = document.createElement('table');
    tabla.style.width = '100%';
    tabla.style.borderCollapse = 'collapse';
    contTabla.appendChild(tabla);
    modal.appendChild(contTabla);

    // --- panel información
    const info = document.createElement('div');
    Object.assign(info.style, {
      flex: '2', borderLeft: '1px solid #444', padding: '10px',
      display: 'flex', flexDirection: 'column', fontSize: '13px'
    });
    info.innerHTML = `<strong>INFORMACIÓN:</strong><br><br><span id="gl-estado">Preparado…</span>`;
    modal.appendChild(info);

    document.body.appendChild(modal);

    // --- lanzar descarga
    iniciarDescarga(tabla, document.getElementById('gl-estado'));
  }

  /******************** 4. DESCARGA Y RELLENO DE TABLA ************************/

  async function iniciarDescarga(tabla, estadoEl) {
    try {
      const params = new URLSearchParams(location.search);
      const userId = params.get('user_id') || prompt('ID de usuario');
      const tipo   = params.get('cType')   || 2; // default Arena
      if (!userId) { estadoEl.textContent = 'Sin ID'; return; }

      estadoEl.textContent = 'Iniciando…';

      const horas = await buscarCombatePorIDConProgreso(
        userId, tipo,
        (msg) => estadoEl.textContent = msg
      );

      // Vaciar tabla
      tabla.innerHTML = '';
      // Rellenar solo la columna de hora
      horas.forEach(h => {
        const tr = tabla.insertRow();
        const td = tr.insertCell();
        td.textContent = h;
        td.style.borderBottom = '1px solid #333';
        td.style.padding = '4px 6px';
      });

      estadoEl.innerHTML = `<span style="color:#6fc46f">Listo: ${horas.length} registros</span>`;
    } catch (e) {
      estadoEl.innerHTML = `<span style="color:#e66">Error: ${e.message}</span>`;
    }
  }

  // Exponemos la función global por si se necesitara externamente
  window.buscarCombatePorIDConProgreso = buscarCombatePorIDConProgreso;
})();
