// ==UserScript==
// @name         CombatLog Recopilador
// @namespace    Violentmonkey Scripts
// @version      1.0
// @description  Recopila combates de Gladiatus con progreso e información
// @match        https://s*-es.gladiatus.gameforge.com/admin/index.php?action=module&modName=CombatLog&mode=showUser*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // ---- FUNCIÓN PRINCIPAL PARA RECOPILAR COMBATES CON PROGRESO ----
  async function buscarCombatePorIDConProgreso(userId, tipoCombate, callbackProgreso) {
    const baseUrl = 'https://s55-es.gladiatus.gameforge.com/admin/index.php?action=module&modName=CombatLog&mode=showUser';
    const horasRecopiladas = [];
    let offset = 0;
    let continuar = true;
    let paginasProcesadas = 0;

    while (continuar) {
      const url = `${baseUrl}&user_id=${userId}&cType=${tipoCombate}&offset=${offset}`;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Verificar fin por texto
        if (html.includes('No hay informes de combate disponibles.')) {
          continuar = false;
          break;
        }

        // Verificar existencia de la tabla y filas
        const table = doc.querySelector('table');
        if (!table) break;

        const filas = table.querySelectorAll('tr');
        if (filas.length <= 1) break;

        for (let i = 1; i < filas.length; i++) {
          const celdas = filas[i].querySelectorAll('td');
          if (celdas.length === 0) continue;
          const horaTexto = celdas[0].textContent.trim();
          if (horaTexto) horasRecopiladas.push(horaTexto);
        }

        paginasProcesadas++;
        offset += 30;

        // Comprobar si hay botón siguiente
        const siguienteExiste = html.includes('Siguiente &raquo;');
        if (!siguienteExiste) continuar = false;

        // Llamar progreso real
        if (callbackProgreso && typeof callbackProgreso === 'function') {
          callbackProgreso(`Recopilando página ${paginasProcesadas}...`);
        }

      } catch (error) {
        console.error('Error al cargar:', url, error);
        continuar = false;
      }
    }

    callbackProgreso('Completado.');
    return horasRecopiladas;
  }

  // ---- INTERFAZ DE BOTÓN Y MODAL ----
  function crearInterfaz() {
    const boton = document.createElement('button');
    boton.textContent = 'Recopilar Combates';
    boton.style.position = 'fixed';
    boton.style.top = '100px';
    boton.style.right = '20px';
    boton.style.zIndex = 1000;
    boton.style.padding = '8px 12px';
    boton.style.backgroundColor = '#c61ddf';
    boton.style.color = '#fff';
    boton.style.border = 'none';
    boton.style.borderRadius = '6px';
    boton.style.cursor = 'pointer';
    document.body.appendChild(boton);

    boton.addEventListener('click', async () => {
      const userId = new URLSearchParams(window.location.search).get('user_id') || '';
      const tipoCombate = new URLSearchParams(window.location.search).get('cType') || 0;

      mostrarModal();

      const resultados = await buscarCombatePorIDConProgreso(userId, tipoCombate, (progreso) => {
        document.getElementById('gl-estado').textContent = progreso;
      });

      const tabla = document.getElementById('gl-tabla-resultados');
      resultados.forEach(hora => {
        const fila = document.createElement('tr');
        const celda = document.createElement('td');
        celda.textContent = hora;
        fila.appendChild(celda);
        tabla.appendChild(fila);
      });
    });
  }

  function mostrarModal() {
    const modal = document.createElement('div');
    modal.id = 'gl-modal';
    modal.style.position = 'fixed';
    modal.style.top = '20%';
    modal.style.left = '35%';
    modal.style.width = '30%';
    modal.style.backgroundColor = '#fff';
    modal.style.border = '2px solid #333';
    modal.style.borderRadius = '8px';
    modal.style.zIndex = 10000;
    modal.style.display = 'flex';
    modal.style.flexDirection = 'row';
    modal.style.padding = '10px';

    const contenido = document.createElement('div');
    contenido.style.flex = '2';
    contenido.style.maxHeight = '300px';
    contenido.style.overflowY = 'scroll';
    contenido.style.borderRight = '1px solid #ccc';
    contenido.style.paddingRight = '10px';

    const tabla = document.createElement('table');
    tabla.id = 'gl-tabla-resultados';
    tabla.style.width = '100%';
    tabla.style.borderCollapse = 'collapse';
    contenido.appendChild(tabla);

    const info = document.createElement('div');
    info.style.flex = '1';
    info.style.paddingLeft = '10px';
    info.innerHTML = `<strong>INFORMACIÓN:</strong><br><br>ahsufhansf`;

    const pie = document.createElement('div');
    pie.style.width = '100%';
    pie.style.marginTop = '10px';
    pie.innerHTML = `<div id="gl-estado" style="text-align:center; font-weight:bold;">Iniciando...</div>`;

    modal.appendChild(contenido);
    modal.appendChild(info);
    modal.appendChild(pie);
    document.body.appendChild(modal);
  }

  // ---- INICIAR INTERFAZ ----
  window.buscarCombatePorIDConProgreso = buscarCombatePorIDConProgreso;
  crearInterfaz();

})();
