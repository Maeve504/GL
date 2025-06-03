(function () {
    'use strict';

    window.abrirModalID = function () {
        let modal = document.getElementById('modalBuscarID');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalBuscarID';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            modal.style.zIndex = '100000';

            const modalContent = document.createElement('div');
            modalContent.style.backgroundColor = '#1f1f1f';
            modalContent.style.padding = '30px 40px';
            modalContent.style.borderRadius = '2px';
            modalContent.style.minWidth = '360px';
            modalContent.style.color = '#e0e0e0';
            modalContent.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4)';
            modal.appendChild(modalContent);

            // Cerrar
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '&times;';
            Object.assign(closeBtn.style, {
                position: 'absolute',
                top: '15px',
                right: '20px',
                fontSize: '26px',
                background: 'transparent',
                color: '#888',
                border: 'none',
                cursor: 'pointer'
            });
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            modalContent.appendChild(closeBtn);

            // Título
            const titulo = document.createElement('h2');
            titulo.textContent = 'Buscar por ID';
            Object.assign(titulo.style, {
                marginBottom: '20px',
                fontSize: '22px',
                fontWeight: '600',
                textAlign: 'center',
                color: '#e0e0e0'
            });
            modalContent.appendChild(titulo);

            // Input
            const inputId = document.createElement('input');
            inputId.type = 'text';
            inputId.placeholder = 'Introduce ID numérica';
            Object.assign(inputId.style, {
                width: '100%',
                padding: '12px 15px',
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #444',
                backgroundColor: '#2a2a2a',
                color: '#eee',
                marginBottom: '20px',
                boxSizing: 'border-box'
            });
            inputId.addEventListener('input', () => {
                inputId.value = inputId.value.replace(/\D/g, '');
            });
            modalContent.appendChild(inputId);

            // Contenedor de botones secundarios
            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.display = 'none';
            buttonsContainer.style.flexDirection = 'column';
            buttonsContainer.style.gap = '10px';
            buttonsContainer.style.marginBottom = '15px';
            modalContent.appendChild(buttonsContainer);

            const names = ['Arena', 'CT', 'Expedición', 'Mazmorra', 'All'];
            names.forEach(name => {
                const btn = document.createElement('button');
                btn.textContent = name;
                Object.assign(btn.style, {
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #555',
                    backgroundColor: '#333',
                    color: '#ccc',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease-in-out'
                });
                btn.addEventListener('mouseenter', () => {
                    btn.style.backgroundColor = '#444';
                    btn.style.color = '#fff';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.backgroundColor = '#333';
                    btn.style.color = '#ccc';
                });

                btn.addEventListener('click', () => {
                    // Aquí ejecutas la acción deseada
                    console.log(`Botón pulsado: ${name}, ID: ${inputId.value.trim()}`);
                });

                buttonsContainer.appendChild(btn);
            });

            // Botón aceptar
            const acceptBtn = document.createElement('button');
            acceptBtn.textContent = 'Aceptar';
            Object.assign(acceptBtn.style, {
                display: 'block',
                margin: '0 auto 20px auto',
                padding: '10px 20px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#007acc',
                color: '#fff',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
            });
            acceptBtn.addEventListener('mouseenter', () => {
                acceptBtn.style.backgroundColor = '#005fa3';
            });
            acceptBtn.addEventListener('mouseleave', () => {
                acceptBtn.style.backgroundColor = '#007acc';
            });
            acceptBtn.addEventListener('click', () => {
                const idValue = inputId.value.trim();
                if (idValue !== '') {
                    buttonsContainer.style.display = 'flex';
                }
            });
            modalContent.appendChild(acceptBtn);

            document.body.appendChild(modal);

            window._modalBuscarID = {
                modal,
                inputId,
                buttonsContainer
            };
        } else {
            modal.style.display = 'flex';
        }

        window._modalBuscarID.inputId.value = '';
        window._modalBuscarID.buttonsContainer.style.display = 'none';
        window._modalBuscarID.inputId.focus();
    };
})();
