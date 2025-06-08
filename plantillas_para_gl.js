// ==UserScript==
// @name         plantillas_para_gl
// @namespace    https://github.com/tuusuario/plantillas-para-gl
// @version      1.0
// @description  Plantillas para Gladiatus con título y URL para el panel
// @match        https://forum.gladiatus.gameforge.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/tuusuario/plantillas-para-gl/main/plantillas_para_gl.user.js
// @downloadURL  https://raw.githubusercontent.com/tuusuario/plantillas-para-gl/main/plantillas_para_gl.user.js
// ==/UserScript==

(function() {
  'use strict';

  window.plantillasParaGL = {
    templates: {
      "evento_happy_day": {
        title: "Happy Day Event",
        url: "https://forum.gladiatus.gameforge.com/forums/announcements",
        EN: `
<p>Ave Gladiators!</p>
<p>On <strong>{{date1}}</strong> - <strong>{{date2}}</strong> server time we will have a Happy Day Event!</p>
<p>During this day you will receive <strong>{{percentage}}%</strong> more rubies on all ruby purchases!</p>
<p>Kind regards,<br>Your Gladiatus Team</p>
        `,
        ES: `
<p>¡Saludos Gladiadores!</p>
<p>Desde <strong>{{date1}}</strong> hasta <strong>{{date2}}</strong> hora del servidor, tendremos un evento Happy Day!</p>
<p>Durante este día recibirás un <strong>{{percentage}}%</strong> más de rubíes en todas las compras de rubíes.</p>
<p>Un saludo,<br>Tu equipo de Gladiatus</p>
        `
      },
      "evento_special_offer": {
        title: "Special Offer",
        url: "https://forum.gladiatus.gameforge.com/forums/events",
        EN: `
<p>Special Offer is live!</p>
<p>Don't miss it from <strong>{{date1}}</strong> to <strong>{{date2}}</strong>!</p>
        `,
        ES: `
<p>¡Oferta Especial activa!</p>
<p>No te la pierdas del <strong>{{date1}}</strong> al <strong>{{date2}}</strong>!</p>
        `
      }
    },

    getTemplate: function(eventKey, lang, data) {
      const event = this.templates[eventKey];
      if (!event) return `No existe la plantilla para el evento "${eventKey}"`;
      const template = event[lang] || event['EN'] || '';
      return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return (data && data[key] !== undefined) ? data[key] : '';
      });
    }
  };

})();
