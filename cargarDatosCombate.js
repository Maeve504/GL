(function() {
  // Barra de progreso visual
  function crearBarraProgreso() {
    const existente = document.getElementById('barraProgresoCombate');
    if (existente) return existente;

    const barra = document.createElement('div');
    barra.id = 'barraProgresoCombate';
    barra.style.position = 'fixed';
    barra.style.top = '0';
    barra.style.left = '0';
    barra.style.width = '0%';
    barra.style.height = '6px';
    barra.style.backgroundColor = '#4caf50';
    barra.style.zIndex = '99999';
    barra.style.transition = 'width 0.3s ease';
    document.body.appendChild(barra);
    return barra;
  }

  function actualizarBarraProgreso(porcentaje) {
    const barra = crearBarraProgreso();
    barra.style.width = `${porcentaje}%`;
    if (porcentaje >= 100) {
      setTimeout(() => barra.remove(), 1000);
    }
  }

  // Función principal para cargar datos
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

        const table = doc.querySelector('table');
        if (!table || table.textContent.includes('No hay informes de combate disponibles.')) break;

        const filas = table.querySelectorAll('tr');
        if (filas.length <= 1) break;

        let filasConDatos = 0;
        for (let i = 1; i < filas.length; i++) {
          const celdas = filas[i].querySelectorAll('td');
          if (celdas.length === 0) continue;
          const horaTexto = celdas[0].textContent.trim();
          if (horaTexto) {
            horasRecopiladas.push(horaTexto);
            filasConDatos++;
          }
        }

        if (filasConDatos === 0) break;

        paginasProcesadas++;
        offset += 30;

        const btnSiguiente = Array.from(doc.querySelectorAll('a,button')).find(el => el.textContent.trim() === 'Siguiente »');
        if (!btnSiguiente) continuar = false;

        if (callbackProgreso && typeof callbackProgreso === 'function') {
          const maxPaginas = 50;
          const progreso = Math.min(90, Math.floor((paginasProcesadas / maxPaginas) * 100));
          callbackProgreso(progreso);
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

  // Modal de resultados ajustado
  function mostrarModalResultados(datos) {
    const existente = document.getElementById('modalResultadosCombate');
    if (existente) existente.remove();

    const overlay = document.createElement('div');
    overlay.id = 'modalResultadosCombate';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';

    const modal = document.createElement('div');
    modal.style.backgroundColor = '#fff';
    modal.style.borderRadius = '8px';
    modal.style.padding = '15px';
    modal.style.width = '500px';
    modal.style.maxHeight = '60vh';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'row';
    modal.style.boxShadow = '0 2px 12px rgba(0,0,0,0.4)';
    modal.style.fontFamily = 'Arial, sans-serif';
    modal.style.fontSize = '13px';
    modal.style.color = '#333';

    const ladoIzquierdo = document.createElement('div');
    ladoIzquierdo.style.flex = '1';
    ladoIzquierdo.style.maxHeight = '55vh';
    ladoIzquierdo.style.overflowY = 'auto';
    ladoIzquierdo.style.marginRight = '10px';
    ladoIzquierdo.style.whiteSpace = 'pre-wrap';
    ladoIzquierdo.style.border = '1px solid #ccc';
    ladoIzquierdo.style.padding = '10px';
    ladoIzquierdo.style.backgroundColor = '#f9f9f9';

    const contenido = datos
      .map(str => str.replace(/#/g, '').trim())
      .filter(str => str.length > 0)
      .join('\n');

    const pre = document.createElement('pre');
    pre.textContent = contenido;
    ladoIzquierdo.appendChild(pre);

    const ladoDerecho = document.createElement('div');
    ladoDerecho.style.width = '130px';
    ladoDerecho.style.textAlign = 'left';
    ladoDerecho.innerHTML = `<strong>INFORMACIÓN:</strong>`;

    const cerrar = document.createElement('button');
    cerrar.textContent = 'Cerrar';
    cerrar.style.marginTop = '10px';
    cerrar.style.cursor = 'pointer';
    cerrar.onclick = () => overlay.remove();

    const contenedor = document.createElement('div');
    contenedor.style.display = 'flex';
    contenedor.style.flexDirection = 'column';
    contenedor.appendChild(ladoDerecho);
    contenedor.appendChild(cerrar);

    modal.appendChild(ladoIzquierdo);
    modal.appendChild(contenedor);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  // Ejecutar
  async function recopilarYMostrar(userId, tipoCombate) {
    actualizarBarraProgreso(0);
    const datos = await cargarDatosCombateConProgreso(userId, tipoCombate, actualizarBarraProgreso);
    mostrarModalResultados(datos);
  }

  // Exponer funciones
  window.buscarCombatePorIDConProgreso = cargarDatosCombateConProgreso;
  window.mostrarModalResultadosCombate = mostrarModalResultados;
  window.recopilarYMostrarCombates = recopilarYMostrar;

})();
