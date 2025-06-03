// ==UserScript==
// @name         Gladiatus Combate Recopilador
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Recopila horas de combate y muestra promedio diario en Gladiatus.
// @match        https://s*-es.gladiatus.gameforge.com/admin/index.php?action=module&modName=CombatLog&mode=showUser*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // Cargar datos de combate con detección de última página
  async function cargarDatosCombateConProgreso(userId, tipoCombate, callbackProgreso) {
    const baseUrl = 'https://s55-es.gladiatus.gameforge.com/admin/index.php?action=module&modName=CombatLog&mode=showUser';
    const horasRecopiladas = [];
    let offset = 0;
    let continuar = true;
    let paginasProcesadas = 0;

    while (continuar) {
      const url = `${baseUrl}&user_id=${userId}&cType=${tipoCombate}&offset=${offset}`;
      try {
        const response = await fetch(url);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const table = doc.querySelector('table');
        if (!table) break;

        const filas = table.querySelectorAll('tr');
        if (filas.length <= 1) break;

        let filasConDatos = 0;
        for (let i = 1; i < filas.length; i++) {
          const celda = filas[i].querySelector('td');
          if (celda && celda.textContent.includes('No hay informes')) {
            continuar = false;
            break;
          }
          if (celda && celda.textContent.trim()) {
            horasRecopiladas.push(celda.textContent.trim());
            filasConDatos++;
          }
        }

        if (filasConDatos === 0) break;

        offset += 30;
        paginasProcesadas++;
        if (callbackProgreso) callbackProgreso(null); // progreso real no estimado

        const siguiente = doc.querySelector('a:contains("Siguiente »")');
        if (!siguiente && !html.includes('Siguiente »')) {
          continuar = false;
        }

      } catch (e) {
        console.error(e);
        continuar = false;
      }
    }

    if (callbackProgreso) callbackProgreso(100);
    return horasRecopiladas;
  }

  function crearVentanaModal(horas) {
    let modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '10%';
    modal.style.left = '20%';
    modal.style.width = '60%';
    modal.style.height = '60%';
    modal.style.backgroundColor = '#f4f4f4';
    modal.style.border = '2px solid #333';
    modal.style.zIndex = 9999;
    modal.style.display = 'flex';
    modal.style.flexDirection = 'row';

    let close = document.createElement('div');
    close.textContent = '✖';
    close.style.position = 'absolute';
    close.style.top = '5px';
    close.style.right = '10px';
    close.style.cursor = 'pointer';
    close.style.fontSize = '18px';
    close.onclick = () => modal.remove();

    let contTabla = document.createElement('div');
    contTabla.style.flex = '2';
    contTabla.style.overflow = 'auto';
    contTabla.style.padding = '10px';
    contTabla.innerHTML = `
      <table style="width:100%; font-size: 12px;">
        <thead><tr><th>Fecha y hora</th></tr></thead>
        <tbody>${horas.map(h => `<tr><td>${h}</td></tr>`).join('')}</tbody>
      </table>
    `;

    let contInfo = document.createElement('div');
    contInfo.style.flex = '1';
    contInfo.style.padding = '10px';
    contInfo.style.borderLeft = '1px solid #ccc';
    contInfo.style.fontWeight = 'bold';
    contInfo.innerHTML = '<div>INFORMACIÓN:</div>';

    const promedio = calcularPromedio(horas);
    contInfo.innerHTML += `<div style="margin-top:10px; font-weight:normal;">
      Promedio diario:<br><b>${promedio}</b>
    </div>`;

    modal.appendChild(close);
    modal.appendChild(contTabla);
    modal.appendChild(contInfo);
    document.body.appendChild(modal);
  }

  function calcularPromedio(horas) {
    if (horas.length < 2) return 'No disponible';
    let fechas = horas.map(h => parsearFecha(h)).sort((a, b) => a - b);
    const tiempoTotalMs = fechas[fechas.length - 1] - fechas[0];
    const dias = tiempoTotalMs / (1000 * 60 * 60 * 24);
    const promedioDiario = horas.length / dias;
    const msPorDia = tiempoTotalMs / dias;
    const tiempoPorDia = msADuracion(msPorDia / horas.length);
    return tiempoPorDia;
  }

  function msADuracion(ms) {
    const totalSegundos = Math.floor(ms / 1000);
    const h = Math.floor(totalSegundos / 3600);
    const m = Math.floor((totalSegundos % 3600) / 60);
    const s = totalSegundos % 60;
    return `${h}h ${m}m ${s}s`;
  }

  function parsearFecha(texto) {
    // formato esperado: "03.06.2024 20:15"
    const [fecha, hora] = texto.split(' ');
    const [d, m, y] = fecha.split('.').map(Number);
    const [hh, mm] = hora.split(':').map(Number);
    return new Date(y, m - 1, d, hh, mm);
  }

  // USO RÁPIDO
  window.buscarCombatePorIDConProgreso = async function(userId, tipoCombate) {
    const horas = await cargarDatosCombateConProgreso(userId, tipoCombate);
    crearVentanaModal(horas);
  };

})();
