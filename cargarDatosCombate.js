// ==UserScript==
// @name         Gladiatus Combate Recopilador Mejorado
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Recopila horas de combate y muestra promedio diario con tabla ajustada.
// @match        https://s*-es.gladiatus.gameforge.com/admin/index.php?action=module&modName=CombatLog&mode=showUser*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  async function cargarDatosCombateConProgreso(userId, tipoCombate) {
    const baseUrl = location.href.split('?')[0];
    const horasRecopiladas = [];
    let offset = 0;
    let continuar = true;

    while (continuar) {
      const url = `${baseUrl}?action=module&modName=CombatLog&mode=showUser&user_id=${userId}&cType=${tipoCombate}&offset=${offset}`;
      try {
        const response = await fetch(url);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const tabla = doc.querySelector('table');
        if (!tabla) break;

        const filas = tabla.querySelectorAll('tr');
        let datosNuevos = 0;

        for (let i = 1; i < filas.length; i++) {
          const celdas = filas[i].querySelectorAll('td');
          if (celdas.length && !celdas[0].textContent.includes('No hay informes')) {
            const texto = celdas[0].textContent.trim();
            if (texto) {
              horasRecopiladas.push(texto);
              datosNuevos++;
            }
          }
        }

        if (datosNuevos === 0 || !html.includes('Siguiente »')) {
          continuar = false;
        } else {
          offset += 30;
        }
      } catch (e) {
        console.error(e);
        continuar = false;
      }
    }

    return horasRecopiladas;
  }

  function crearVentanaModal(horas) {
    let modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '10%';
    modal.style.left = '25%';
    modal.style.width = '50%';
    modal.style.height = '60%';
    modal.style.backgroundColor = '#f4f4f4';
    modal.style.border = '2px solid #333';
    modal.style.zIndex = 9999;
    modal.style.display = 'flex';
    modal.style.flexDirection = 'row';
    modal.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';

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
    contTabla.style.overflowY = 'auto';
    contTabla.style.maxHeight = '100%';
    contTabla.style.padding = '10px';
    contTabla.innerHTML = `
      <table style="width:100%; font-size: 12px; border-collapse: collapse;">
        <thead><tr><th style="text-align:left; border-bottom: 1px solid #ccc;">Fecha y hora</th></tr></thead>
        <tbody>${horas.map(h => `<tr><td style="padding:4px 0;">${h}</td></tr>`).join('')}</tbody>
      </table>
    `;

    let contInfo = document.createElement('div');
    contInfo.style.flex = '1';
    contInfo.style.padding = '15px 10px';
    contInfo.style.borderLeft = '1px solid #ccc';
    contInfo.style.display = 'flex';
    contInfo.style.flexDirection = 'column';
    contInfo.style.fontSize = '14px';

    const promedio = calcularPromedio(horas);
    contInfo.innerHTML = `
      <div style="font-weight: bold; font-size: 16px; margin-bottom: 10px;">INFORMACIÓN:</div>
      <div><b>Promedio diario:</b><br>${promedio}</div>
    `;

    modal.appendChild(close);
    modal.appendChild(contTabla);
    modal.appendChild(contInfo);
    document.body.appendChild(modal);
  }

  function calcularPromedio(horas) {
    if (horas.length < 2) return 'No disponible';
    let fechas = horas.map(parsearFecha).sort((a, b) => a - b);
    const tiempoTotalMs = fechas[fechas.length - 1] - fechas[0];
    const dias = tiempoTotalMs / (1000 * 60 * 60 * 24);
    const msPorDia = tiempoTotalMs / dias / horas.length;
    return msADuracion(msPorDia);
  }

  function msADuracion(ms) {
    const totalSegundos = Math.floor(ms / 1000);
    const h = Math.floor(totalSegundos / 3600);
    const m = Math.floor((totalSegundos % 3600) / 60);
    const s = totalSegundos % 60;
    return `${h}h ${m}m ${s}s`;
  }

  function parsearFecha(texto) {
    const [fecha, hora] = texto.split(' ');
    const [d, m, y] = fecha.split('.').map(Number);
    const [hh, mm] = hora.split(':').map(Number);
    return new Date(y, m - 1, d, hh, mm);
  }

  // USO RÁPIDO EN CONSOLA
  window.buscarCombatePorIDConProgreso = async function(userId, tipoCombate) {
    const horas = await cargarDatosCombateConProgreso(userId, tipoCombate);
    crearVentanaModal(horas);
  };
})();
