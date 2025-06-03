// ==UserScript==
// @name         Modal ID con botón centrado y borde naranja dorado
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Modal con fondo gris medio y naranja dorado #b37f34, X en círculo, opciones verticales
// @author       ChatGPT
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if (document.getElementById('openModalBtn')) return;

    const openModalBtn = document.createElement('button');
    openModalBtn.id = 'openModalBtn';
    openModalBtn.textContent = 'Abrir ventana ID';
    openModalBtn.style.position = 'fixed';
    openModalBtn.style.top = '10px';
    openModalBtn.style.right = '10px';
    openModalBtn.style.zIndex = 99999;
    document.body.appendChild(openModalBtn);

    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'none';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = 100000;

    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#b3b3b3'; // fondo gris medio
    modalContent.style.padding = '30px 40px';
    modalContent.style.borderRadius = '12px';
    modalContent.style.position = 'relative';
    modalContent.style.minWidth = '360px';
    modalContent.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
    modalContent.style.border = '3px solid #b37f34'; // naranja dorado
    modal.appendChild(modalContent);

    // Botón cerrar: círculo naranja dorado con X blanca
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '15px';
    closeBtn.style.right = '20px';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.backgroundColor = '#b37f34'; // naranja dorado
    closeBtn.style.border = 'none';
    closeBtn.style.color = '#fff';
    closeBtn.style.fontWeight = '700';
    closeBtn.style.lineHeight = '1';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.width = '34px';
    closeBtn.style.height = '34px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.display = 'flex';
    closeBtn.style.alignItems = 'center';
    closeBtn.style.justifyContent = 'center';
    closeBtn.style.transition = 'background-color 0.3s';
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.backgroundColor = '#8e6730');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.backgroundColor = '#b37f34');
    modalContent.appendChild(closeBtn);

    // Título con icono lupa naranja dorado
    const titulo = document.createElement('h2');
    titulo.style.display = 'flex';
    titulo.style.alignItems = 'center';
    titulo.style.gap = '10px';
    titulo.style.margin = '0 0 20px 0';
    titulo.style.color = '#b37f34'; // naranja dorado
    titulo.style.fontWeight = '700';
    titulo.style.fontSize = '24px';

    const iconLupa = document.createElement('span');
    iconLupa.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 0 24 24" width="28" fill="#b37f34">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
    `;
    titulo.appendChild(iconLupa);
    titulo.appendChild(document.createTextNode('Buscador'));
    modalContent.appendChild(titulo);

    // Input con borde naranja dorado
    const inputId = document.createElement('input');
    inputId.type = 'text';
    inputId.placeholder = 'Introducir ID del usuario';
    inputId.style.width = '100%';
    inputId.style.padding = '12px 15px';
    inputId.style.fontSize = '18px';
    inputId.style.borderRadius = '8px';
    inputId.style.border = '2px solid #b37f34';
    inputId.style.marginBottom = '25px';
    inputId.style.boxSizing = 'border-box';
    inputId.style.fontWeight = '600';
    inputId.style.color = '#b37f34';
    inputId.style.transition = 'border-color 0.3s';
    inputId.addEventListener('focus', () => inputId.style.borderColor = '#8e6730');
    inputId.addEventListener('blur', () => inputId.style.borderColor = '#b37f34');
    modalContent.appendChild(inputId);

    // Contenedor botones en columna vertical
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'none';
    buttonsContainer.style.flexDirection = 'column';
    buttonsContainer.style.gap = '12px';
    buttonsContainer.style.marginBottom = '25px';
    modalContent.appendChild(buttonsContainer);

    const names = ['Arena', 'CT', 'Expedición', 'Mazmorra', 'All'];
    names.forEach(name => {
        const btn = document.createElement('button');
        btn.textContent = name;
        btn.style.padding = '10px 0';
        btn.style.borderRadius = '8px';
        btn.style.border = '2px solid #b37f34';
        btn.style.backgroundColor = 'transparent';
        btn.style.color = '#b37f34';
        btn.style.cursor = 'pointer';
        btn.style.fontWeight = '700';
        btn.style.fontSize = '16px';
        btn.style.width = '100%';
        btn.style.transition = 'background-color 0.3s, color 0.3s';
        btn.addEventListener('mouseenter', () => {
            btn.style.backgroundColor = '#b37f34';
            btn.style.color = '#fff';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.backgroundColor = 'transparent';
            btn.style.color = '#b37f34';
        });
        buttonsContainer.appendChild(btn);
    });

    // Botón aceptar centrado y ajustado
    const acceptBtn = document.createElement('button');
    acceptBtn.textContent = 'Aceptar';
    acceptBtn.style.display = 'block';
    acceptBtn.style.margin = '0 auto';
    acceptBtn.style.padding = '10px 25px';
    acceptBtn.style.fontSize = '18px';
    acceptBtn.style.fontWeight = '700';
    acceptBtn.style.borderRadius = '12px';
    acceptBtn.style.border = 'none';
    acceptBtn.style.color = '#fff';
    acceptBtn.style.background = 'linear-gradient(45deg, #b37f34, #8e6730)';
    acceptBtn.style.boxShadow = '0 4px 12px rgba(179, 127, 52, 0.6)';
    acceptBtn.style.cursor = 'pointer';
    acceptBtn.style.transition = 'transform 0.2s ease-in-out, box-shadow 0.3s';

    acceptBtn.addEventListener('mouseenter', () => {
        acceptBtn.style.transform = 'scale(1.05)';
        acceptBtn.style.boxShadow = '0 6px 16px rgba(179, 127, 52, 0.9)';
    });
    acceptBtn.addEventListener('mouseleave', () => {
        acceptBtn.style.transform = 'scale(1)';
        acceptBtn.style.boxShadow = '0 4px 12px rgba(179, 127, 52, 0.6)';
    });

    modalContent.appendChild(acceptBtn);

    // Solo números en input
    inputId.addEventListener('input', () => {
        inputId.value = inputId.value.replace(/\D/g, '');
    });

    acceptBtn.addEventListener('click', () => {
        if(inputId.value.trim() === '') {
            alert('Por favor, introduce una ID válida (solo números).');
            return;
        }
        buttonsContainer.style.display = 'flex';
    });

    openModalBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        inputId.value = '';
        buttonsContainer.style.display = 'none';
        inputId.focus();
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    document.body.appendChild(modal);

})();

window.buscarUsuario = function() {
    // código de búsqueda de usuario
};


