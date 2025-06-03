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

    // Para calcular progreso debemos estimar un máximo de páginas.
    // No hay info directa, así que vamos a asumir un máximo de 10 páginas.
    // Si quieres, cambia este valor a otro mayor o ajustable.
    const maxPaginasEstimadas = 10;

    while (continuar) {
      const url = `${baseUrl}&user_id=${userId}&cType=${tipoCombate}&offset=${offset}`;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const table = doc.querySelector('table');
        if (!table) {
          console.warn('No se encontró tabla en la página:', url);
          break;
        }

        const filas = table.querySelectorAll('tr');
        if (filas.length <= 1) {
          // No hay filas con datos, fin de páginas
          break;
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
          continuar = false;
        } else {
          offset += 30;
          paginasProcesadas++;

          // Llamar callback progreso si existe
          if (callbackProgreso && typeof callbackProgreso === 'function') {
            // Progreso calculado en porcentaje (máximo maxPaginasEstimadas páginas)
            let porcentaje = Math.min(100, Math.floor((paginasProcesadas / maxPaginasEstimadas) * 100));
            callbackProgreso(porcentaje);
          }
        }

        // Si llegamos a max páginas estimadas forzamos fin para no infinite loop
        if (paginasProcesadas >= maxPaginasEstimadas) {
          continuar = false;
        }

      } catch (error) {
        console.error('Error al cargar la página:', url, error);
        continuar = false;
      }
    }

    // Finalizamos con 100% para asegurarnos
    if (callbackProgreso && typeof callbackProgreso === 'function') {
      callbackProgreso(100);
    }

    return horasRecopiladas;
  }

  // Exportamos esta función para usar con progreso
  window.buscarCombatePorIDConProgreso = cargarDatosCombateConProgreso;

})();
