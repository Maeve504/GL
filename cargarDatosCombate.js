// ==UserScript==
// @name         CombatLog Recopilador Mejorado
// @namespace    Violentmonkey Scripts
// @version      1.1
// @description  Recopila combates con progreso e información
// @match        https://s*-es.gladiatus.gameforge.com/admin/index.php?action=module&modName=CombatLog&mode=showUser*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

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

        if (html.includes('No hay informes de combate disponibles.')) break;

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

        const siguienteExiste = html.includes('Siguiente &raquo;');
        if (!siguienteExiste) continuar = false;

        if (callbackProgreso) callbackProgreso(`Recopilando página ${paginasProcesadas}...`);
      } catch (error) {
        console.error('Error al cargar:', url, error);
        continuar = false;
      }
    }

    if (callbackProgreso) callbackProgreso('Completado.');
    return horasRecopiladas;
  }

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
        celda.style.padding = '4px 8px';
        fila.appendChild(celda);
        tabla.appendChild(fila);
      });
    });
  }

  function mostrarModal() {
    const modal = document.createElement('div');
    modal.id = 'gl-modal';
    modal.style.position = 'fixed';
    modal.style.top = '15%';
    modal.style.left = '25%';
    modal.style.width = '50%';
    modal.style.height = '400px';
    modal.style.backgroundColor = '#fff';
    modal.style.border = '2px solid #333';
    modal.style.borderRadius = '8px';
    modal.style.zIndex = 10000;
    modal.style.display = 'flex';
    modal.style.flexDirection = 'row';
    modal.style.padding = '10px';
    modal.style.boxShadow = '0 0 15px rgba(0,0,0,0.3)';

    const contenido = document.createElement('div');
    contenido.style.flex = '3';
    contenido.style.maxHeight = '100%';
    contenido.style.overflowY = 'auto';
    contenido.style.borderRight = '1px solid #ccc';
    contenido.style.paddingRight = '10px';

    const tabla = document.createElement('table');
    tabla.id = 'gl-tabla-resultados';
    tabla.style.width = '100%';
    tabla.style.borderCollapse = 'collapse';
    tabla.style.fontSize = '14px';
    contenido.appendChild(tabla);

    const info = document.createElement('div');
    info.style.flex = '2';
    info.style.paddingLeft = '10px';
    info.innerHTML = `<strong>INFORMACIÓN:</strong><br><br>ahsufhansf`;

    const pie = document.createElement('div');
    pie.style.position = 'absolute';
    pie.style.bottom = '10px';
    pie.style.left = '0';
    pie.style.width = '100%';
    pie.innerHTML = `<div id="gl-estado" style="text-align:center; font-weight:bold;">Iniciando...</div>`;

    modal.appendChild(contenido);
    modal.appendChild(info);
    modal.appendChild(pie);
    document.body.appendChild(modal);
  }

  window.buscarCombatePorIDConProgreso = buscarCombatePorIDConProgreso;
  crearInterfaz();
})();
