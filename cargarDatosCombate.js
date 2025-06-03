(function() {
  /**
   * Función que recopila horas de combate e informa progreso.
   * @param {number|string} userId - ID del usuario.
   * @param {number|string} tipoCombate - Tipo de combate (2=Arena, 3=CT, 0=Expedición, 1=Mazmorra).
   * @param {(porcentaje:number)=>void} [callbackProgreso] - Función opcional para progreso (0-100).
   * @returns {Promise<string[]>} - Promesa que resuelve con un array de horas.
   */
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
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Buscar tabla y filas
        const table = doc.querySelector('table');
        if (!table) {
          console.warn('No se encontró tabla en la página:', url);
          break;
        }

        // Detectar texto "No hay informes de combate disponibles."
        if (table.textContent.includes('No hay informes de combate disponibles.')) {
          break; // Fin de datos
        }

        const filas = table.querySelectorAll('tr');
        if (filas.length <= 1) {
          break; // Sin datos
        }

        let filasConDatos = 0;
        for (let i = 1; i < filas.length; i++) { // saltar encabezado
          const celdas = filas[i].querySelectorAll('td');
          if (celdas.length === 0) continue;
          const horaTexto = celdas[0].textContent.trim();
          if (horaTexto) {
            horasRecopiladas.push(horaTexto);
            filasConDatos++;
          }
        }

        if (filasConDatos === 0) {
          break; // Sin datos en página
        }

        paginasProcesadas++;
        offset += 30;

        // Comprobar si existe botón "Siguiente »"
        const btnSiguiente = Array.from(doc.querySelectorAll('a,button')).find(el => el.textContent.trim() === 'Siguiente »');
        if (!btnSiguiente) {
          continuar = false; // Última página
        }

        if (callbackProgreso && typeof callbackProgreso === 'function') {
          // Progreso arbitrario, solo como ejemplo
          callbackProgreso(Math.min(100, paginasProcesadas * 10));
        }

      } catch (error) {
        console.error('Error al cargar la página:', url, error);
        break;
      }
    }

    if (callbackProgreso && typeof callbackProgreso === 'function') {
      callbackProgreso(100);
    }

    return horasRecopiladas;
  }

  // Exportar función global para uso externo
  window.buscarCombatePorIDConProgreso = cargarDatosCombateConProgreso;

})();
