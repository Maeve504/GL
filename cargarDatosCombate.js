(function() {
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

        for (let i = 1; i < filas.length; i++) {
          const celdas = filas[i].querySelectorAll('td');
          if (celdas.length === 0) continue;
          const horaTexto = celdas[0].textContent.trim();
          if (horaTexto) horasRecopiladas.push(horaTexto);
        }

        paginasProcesadas++;
        offset += 30;

        const btnSiguiente = Array.from(doc.querySelectorAll('a,button')).find(el => el.textContent.trim() === 'Siguiente »');
        if (!btnSiguiente) continuar = false;

        if (callbackProgreso) {
          const progresoEstimado = Math.min(95, Math.floor((paginasProcesadas / 50) * 100));
          callbackProgreso(progresoEstimado);
        }

      } catch (error) {
        console.error('Error al cargar:', url, error);
        break;
      }
    }

    if (callbackProgreso) callbackProgreso(100);
    return horasRecopiladas;
  }

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
    modal.style.padding = '12px';
    modal.style.width = '550px';
    modal.style.maxHeight = '70vh';
    modal.style.display = 'flex';
    modal.style.gap = '10px';
    modal.style.boxShadow = '0 2px 12px rgba(0,0,0,0.4)';
    modal.style.fontFamily = 'Arial, sans-serif';
    modal.style.fontSize = '13px';
    modal.style.color = '#333';

    const resultados = document.createElement('div');
    resultados.style.flex = '1';
    resultados.style.maxHeight = '58vh';
    resultados.style.overflowY = 'auto';
    resultados.style.border = '1px solid #ccc';
    resultados.style.padding = '8px';
    resultados.style.backgroundColor = '#f9f9f9';
    resultados.style.whiteSpace = 'pre-wrap';

    const limpio = datos
      .map(str => str.replace(/#\d+\s*/, '').trim())
      .filter(str => str.length > 0)
      .join('\n');

    resultados.textContent = limpio;

    const lateral = document.createElement('div');
    lateral.style.width = '130px';
    lateral.style.display = 'flex';
    lateral.style.flexDirection = 'column';
    lateral.style.justifyContent = 'space-between';

    const info = document.createElement('div');
    info.innerHTML = `<strong>INFORMACIÓN:</strong>`;

    const cerrar = document.createElement('button');
    cerrar.textContent = 'Cerrar';
    cerrar.style.marginTop = '10px';
    cerrar.style.padding = '4px';
    cerrar.style.cursor = 'pointer';
    cerrar.onclick = () => overlay.remove();

    lateral.appendChild(info);
    lateral.appendChild(cerrar);

    modal.appendChild(resultados);
    modal.appendChild(lateral);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  async function recopilarYMostrar(userId, tipoCombate) {
    actualizarBarraProgreso(0);
    const datos = await cargarDatosCombateConProgreso(userId, tipoCombate, actualizarBarraProgreso);
    mostrarModalResultados(datos);
  }
  window.buscarCombatePorIDConProgreso = async function(userId, tipoCombate, callbackProgreso) {
    actualizarBarraProgreso(0);
    const datos = await cargarDatosCombateConProgreso(userId, tipoCombate, callbackProgreso);
    return datos;
  };

  window.recopilarYMostrarCombates = recopilarYMostrar;
})();
