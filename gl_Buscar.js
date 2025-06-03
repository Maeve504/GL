(function () {
  'use strict';

  // Función principal para abrir el primer modal
  window.abrirModalID = function () {
    let modal = document.getElementById('modalBuscarID');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modalBuscarID';
      Object.assign(modal.style, {
        position: 'fixed',
        top: '0', left: '0', width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: '100000',
      });

      const modalContent = document.createElement('div');
      Object.assign(modalContent.style, {
        background: '#1e1e2f',
        padding: '30px 40px',
        borderRadius: '14px',
        minWidth: '400px',
        boxShadow: '0 12px 30px rgba(0, 255, 255, 0.3)',
        position: 'relative',
        color: '#d4f1f9',
        textAlign: 'center',
        fontFamily: 'Segoe UI, sans-serif',
      });

      // Botón de cerrar
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      Object.assign(closeBtn.style, {
        position: 'absolute',
        top: '15px', right: '20px',
        background: '#0ff',
        color: '#000',
        fontSize: '20px',
        border: 'none',
        borderRadius: '50%',
        width: '32px', height: '32px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background 0.3s',
      });
      closeBtn.addEventListener('mouseenter', () => closeBtn.style.background = '#0cc');
      closeBtn.addEventListener('mouseleave', () => closeBtn.style.background = '#0ff');
      closeBtn.onclick = () => modal.style.display = 'none';
      modalContent.appendChild(closeBtn);

      // Título
      const title = document.createElement('h2');
      title.textContent = 'Buscar Usuario por ID';
      Object.assign(title.style, {
        marginBottom: '20px',
        fontSize: '24px',
        color: '#0ff',
      });
      modalContent.appendChild(title);

      // Input de ID
      const inputId = document.createElement('input');
      inputId.type = 'text';
      inputId.placeholder = 'Escribe la ID numérica...';
      Object.assign(inputId.style, {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '2px solid #0ff',
        fontSize: '16px',
        color: '#0ff',
        background: '#121222',
        marginBottom: '20px',
        boxSizing: 'border-box',
      });
      inputId.addEventListener('input', () => {
        inputId.value = inputId.value.replace(/\D/g, '');
      });
      modalContent.appendChild(inputId);

      // Botón aceptar
      const acceptBtn = document.createElement('button');
      acceptBtn.textContent = 'Aceptar';
      Object.assign(acceptBtn.style, {
        background: 'linear-gradient(45deg, #0ff, #0aa)',
        color: '#000',
        border: 'none',
        padding: '12px 25px',
        fontSize: '16px',
        fontWeight: 'bold',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.3s',
      });
      acceptBtn.onmouseenter = () => {
        acceptBtn.style.transform = 'scale(1.05)';
        acceptBtn.style.boxShadow = '0 6px 16px rgba(0, 255, 255, 0.7)';
      };
      acceptBtn.onmouseleave = () => {
        acceptBtn.style.transform = 'scale(1)';
        acceptBtn.style.boxShadow = 'none';
      };
      acceptBtn.onclick = () => {
        const id = inputId.value.trim();
        if (!id) return;

        modal.style.display = 'none';
        mostrarModalResultado(id);
      };
      modalContent.appendChild(acceptBtn);

      modal.appendChild(modalContent);
      document.body.appendChild(modal);
    } else {
      modal.style.display = 'flex';
    }

    // Reset
    modal.querySelector('input').value = '';
    modal.querySelector('input').focus();
  };

  // Segundo modal: muestra los resultados tras aceptar la ID
  function mostrarModalResultado(id) {
    let modal = document.getElementById('modalResultadoID');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modalResultadoID';
      Object.assign(modal.style, {
        position: 'fixed',
        top: '0', left: '0', width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: '100001',
      });

      const box = document.createElement('div');
      Object.assign(box.style, {
        background: '#121222',
        padding: '30px 40px',
        borderRadius: '14px',
        color: '#0ff',
        textAlign: 'center',
        minWidth: '350px',
        boxShadow: '0 10px 25px rgba(0,255,255,0.2)',
        fontFamily: 'Segoe UI, sans-serif',
        position: 'relative',
      });

      const close = document.createElement('button');
      close.innerHTML = '&times;';
      Object.assign(close.style, {
        position: 'absolute', top: '15px', right: '20px',
        background: '#0ff',
        color: '#000',
        border: 'none',
        borderRadius: '50%',
        width: '30px', height: '30px',
        cursor: 'pointer',
        fontWeight: 'bold',
      });
      close.onclick = () => modal.style.display = 'none';
      box.appendChild(close);

      const resultText = document.createElement('div');
      resultText.id = 'resultadoBusquedaTexto';
      resultText.style.fontSize = '18px';
      box.appendChild(resultText);

      modal.appendChild(box);
      document.body.appendChild(modal);
    }

    document.getElementById('resultadoBusquedaTexto').textContent =
      `Buscando información del usuario con ID: ${id}...`;

    document.getElementById('modalResultadoID').style.display = 'flex';
  }
})();
