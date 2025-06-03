(function () {
    'use strict';

    window.abrirModalID = function () {
        let modal = document.getElementById('modalBuscarID');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalBuscarID';
            Object.assign(modal.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: '100000'
            });

            const modalContent = document.createElement('div');
            Object.assign(modalContent.style, {
                backgroundColor: '#1f1f1f',
                padding: '30px 40px',
                borderRadius: '12px',
                minWidth: '360px',
                maxHeight: '80vh',
                overflowY: 'auto',
                color: '#e0e0e0',
                boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                position: 'relative'
            });

            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '&times;';
            Object.assign(closeBtn.style, {
                position: 'absolute',
                top: '12px',
                right: '16px',
                fontSize: '28px',
                background: 'transparent',
                color: '#aaa',
                border: 'none',
                cursor: 'pointer'
            });
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            modalContent.appendChild(closeBtn);

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

            const inputId = document.createElement('input');
            inputId.type = 'text';
            inputId.placeholder = 'Introduce ID numérica';
            Object.assign(inputId.style, {
                width: '100%',
                padding: '12px 15px',
                fontSize: '16px',
                borderRadius: '6px',
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

            const buttonsContainer = document.createElement('div');
            Object.assign(buttonsContainer.style, {
                display: 'none',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '20px'
            });
            modalContent.appendChild(buttonsContainer);

            // Crear contenedor para mensaje de carga y tabla (vacío al inicio)
            const mensajeCarga = document.createElement('div');
            mensajeCarga.id = 'mensajeCarga';
            Object.assign(mensajeCarga.style, {
                color: '#eee',
                fontSize: '18px',
                textAlign: 'center',
                marginBottom: '15px',
                display: 'none'
            });
            modalContent.appendChild(mensajeCarga);

            const tablaDatos = document.createElement('table');
            tablaDatos.id = 'tablaDatos';
            Object.assign(tablaDatos.style, {
                width: '100%',
                maxHeight: '300px',
                overflowY: 'auto',
                display: 'none',
                backgroundColor: '#222',
                color: '#eee',
                borderCollapse: 'collapse',
                marginTop: '10px',
                tableLayout: 'fixed'
            });
            modalContent.appendChild(tablaDatos);

            const names = ['Arena', 'CT', 'Expedición', 'Mazmorra', 'All'];
            names.forEach(name => {
                const btn = document.createElement('button');
                btn.textContent = name;
                Object.assign(btn.style, {
                    padding: '10px',
                    borderRadius: '6px',
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
                    const idValue = inputId.value.trim();
                    if (!idValue) {
                        alert('Introduce un ID válido');
                        return;
                    }

                    console.log(`Botón pulsado: ${name}, ID: ${idValue}`);

                    if (name === 'Arena') {
                        buttonsContainer.style.display = 'none';
                        mensajeCarga.style.display = 'block';
                        tablaDatos.style.display = 'none';
                        mensajeCarga.textContent = 'Cargando... 0%';

                        const scriptUrl = 'https://raw.githubusercontent.com/Maeve504/GL/main/cargarDatosCombate.js';

                        function iniciarCarga() {
                            if (typeof window.buscarCombatePorIDConProgreso === 'function') {
                                window.buscarCombatePorIDConProgreso(idValue, 2, (progreso) => {
                                    mensajeCarga.textContent = `Cargando... ${progreso}%`;
                                }).then((horas) => {
                                    mensajeCarga.textContent = `Carga finalizada. ${horas.length} registros encontrados.`;
                                    tablaDatos.style.display = 'table';

                                    // Construir tabla
                                    tablaDatos.innerHTML = '';
                                    const thead = document.createElement('thead');
                                    thead.innerHTML = `<tr>
                                        <th style="border: 1px solid #444; padding: 6px; width: 10%;">#</th>
                                        <th style="border: 1px solid #444; padding: 6px;">Hora</th>
                                    </tr>`;
                                    tablaDatos.appendChild(thead);

                                    const tbody = document.createElement('tbody');
                                    horas.forEach((hora, i) => {
                                        const fila = document.createElement('tr');
                                        fila.innerHTML = `
                                            <td style="border: 1px solid #444; padding: 6px; text-align: center;">${i + 1}</td>
                                            <td style="border: 1px solid #444; padding: 6px; word-break: break-word;">${hora}</td>
                                        `;
                                        tbody.appendChild(fila);
                                    });
                                    tablaDatos.appendChild(tbody);
                                }).catch(err => {
                                    alert('Error al cargar datos de combate.');
                                    console.error(err);
                                    buttonsContainer.style.display = 'flex';
                                    mensajeCarga.style.display = 'none';
                                });
                            } else {
                                alert('Función buscarCombatePorIDConProgreso no encontrada.');
                                buttonsContainer.style.display = 'flex';
                                mensajeCarga.style.display = 'none';
                            }
                        }

                        if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
                            const script = document.createElement('script');
                            script.src = scriptUrl;
                            script.onload = iniciarCarga;
                            script.onerror = () => {
                                alert('Error al cargar cargarDatosCombate.js');
                                buttonsContainer.style.display = 'flex';
                                mensajeCarga.style.display = 'none';
                            };
                            document.body.appendChild(script);
                        } else {
                            iniciarCarga();
                        }
                    }
                    // Aquí puedes añadir más condiciones para CT, Expedición, Mazmorra, All
                });
                buttonsContainer.appendChild(btn);
            });

            const acceptBtn = document.createElement('button');
            acceptBtn.textContent = 'Aceptar';
            Object.assign(acceptBtn.style, {
                display: 'block',
                margin: '0 auto 0 auto',
                padding: '10px 20px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#007acc',
                color: '#fff',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
            });
            acceptBtn.addEventListener('mouseenter', () => {
                acceptBtn.style.backgroundColor = (acceptBtn.textContent === 'Cerrar') ? '#992222' : '#005fa3';
            });
            acceptBtn.addEventListener('mouseleave', () => {
                acceptBtn.style.backgroundColor = (acceptBtn.textContent === 'Cerrar') ? '#cc3333' : '#007acc';
            });
            acceptBtn.addEventListener('click', () => {
                const idValue = inputId.value.trim();
                if (acceptBtn.textContent === 'Cerrar') {
                    modal.style.display = 'none';
                } else if (idValue !== '') {
                    buttonsContainer.style.display = 'flex';
                    acceptBtn.textContent = 'Cerrar';
                    acceptBtn.style.backgroundColor = '#cc3333';

                    // Al abrir botones, ocultar mensaje y tabla si hay
                    mensajeCarga.style.display = 'none';
                    tablaDatos.style.display = 'none';
                }
            });
            modalContent.appendChild(acceptBtn);

            modal.appendChild(modalContent);
            document.body.appendChild(modal);

            window._modalBuscarID = {
                modal,
                inputId,
                buttonsContainer,
                acceptBtn,
                mensajeCarga,
                tablaDatos
            };
        } else {
            modal.style.display = 'flex';
        }

        const { inputId, buttonsContainer, acceptBtn, mensajeCarga, tablaDatos } = window._modalBuscarID;
        inputId.value = '';
        buttonsContainer.style.display = 'none';
        mensajeCarga.style.display = 'none';
        tablaDatos.style.display = 'none';
        acceptBtn.textContent = 'Aceptar';
        acceptBtn.style.backgroundColor = '#007acc';
    };
})();
