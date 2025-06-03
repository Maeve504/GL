// ==UserScript==
// @name         Cargar Datos Combate Gladiatus
// @description  Recopila horas de combate de todas las páginas de un usuario en Gladiatus (Arena, CT, Expedición, Mazmorra).
// @version      1.0
// @author       TuNombre
// ==/UserScript==

(function() {
  /**
   * Función principal que recopila las horas de combate.
   * @param {number|string} userId - ID del usuario.
   * @param {number|string} tipoCombate - Tipo de combate (2=Arena, 3=CT, 0=Expedición, 1=Mazmorra).
   * @returns {Promise<string[]>} - Promesa que resuelve con un array de horas (strings).
   */
  async function cargarDatosCombate(userId, tipoCombate) {
    const baseUrl = 'https://s55-es.gladiatus.gameforge.com/admin/index.php?action=module&modName=CombatLog&mode=showUser';
    const horasRecopiladas = [];
    let offset = 0;
    let continuar = true;

    // Imagen de carga en consola (puedes cambiar o eliminar si no quieres)
    console.log('Cargando datos...');

    while (continuar) {
      const url = `${baseUrl}&user_id=${userId}&cType=${tipoCombate}&offset=${offset}`;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Buscar tabla y extraer horas debajo de <th>
        const table = doc.querySelector('table');
        if (!table) {
          console.warn('No se encontró tabla en la página:', url);
          break;
        }

        // Encontrar la fila que contiene las horas (debajo del encabezado <th>)
        // Asumo que las horas están en la segunda columna de cada fila (ajusta si es necesario)
        const filas = table.querySelectorAll('tr');
        if (filas.length <= 1) {
          // No hay filas con datos, fin de páginas
          break;
        }

        let filasConDatos = 0;
        for (let i = 1; i < filas.length; i++) { // i=1 para saltar el encabezado
          const celdas = filas[i].querySelectorAll('td');
          if (celdas.length === 0) continue;

          // Aquí asumimos que la hora está en la primera celda o en la que corresponda
          // Si la hora está justo debajo de <th> en la primera columna:
          const horaTexto = celdas[0].textContent.trim();
          if (horaTexto) {
            horasRecopiladas.push(horaTexto);
            filasConDatos++;
          }
        }

        if (filasConDatos === 0) {
          // No se encontraron datos en esta página, fin
          continuar = false;
        } else {
          offset += 30; // Avanzar a la siguiente página
        }

      } catch (error) {
        console.error('Error al cargar la página:', url, error);
        continuar = false;
      }
    }

    console.log('Datos cargados:', horasRecopiladas);
    return horasRecopiladas;
  }

  // Exportar globalmente
  window.cargarDatosCombate = cargarDatosCombate;

})();
