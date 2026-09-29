/**
 * settings-view.js — Configuración de Sales Navigator (revisión de uso).
 * Separa tres cosas que antes se mezclaban al hablar de «configuración»:
 *   · el negocio (Negocio), · el plan (Configuración de planeación) y · la propia herramienta (esta vista).
 * Solo orienta: no hay controles nuevos ni lógica nueva. Las preferencias de la herramienta que ya existen
 * siguen viviendo donde están hoy; esta vista dice dónde y deja claro que se reunirán aquí más adelante.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const H = () => FP.ui.helpers;
  const $ = (id) => document.getElementById(id);

  const ROWS = [
    { what: 'Tu negocio', desc: 'Identidad, modelo, qué vende, cómo vende y su terminología. Adapta nombres y explicaciones.', where: 'Negocio', view: 'negocio' },
    { what: 'Tu plan', desc: 'Método, periodo histórico, suavizado y comparación de métodos. Cada plan guarda los valores con los que se generó.', where: 'Configuración de planeación', view: 'configuracion' },
    { what: 'Modo de uso', desc: 'Aprendiz, Analista o Ejecutivo: cuánto detalle y ayuda se muestra.', where: 'Interruptor «Modo Aprendiz» del menú y selector de modo de cada vista', view: null },
    { what: 'Análisis con IA (Cohere)', desc: 'La API key que usan Diagnóstico, Recovery Center y Narrativa para redactar. Cohere solo redacta; no calcula.', where: '¿Por qué? Diagnóstico', view: 'diagnostico' },
    { what: 'Almacenamiento', desc: 'Dónde se guardan tus datos en este navegador, estado de la migración y pruebas de almacenamiento.', where: 'Categoría → Producto', view: 'producto' }
  ];

  function render() {
    const esc = H().esc;
    $('settings-view').innerHTML = `
      <section class="panel" aria-labelledby="t-settings">
        <div class="panel__head"><div>
          <h2 class="panel__title" id="t-settings">Configuración de Sales Navigator</h2>
          <p class="panel__desc">Preferencias de la herramienta. No describen tu negocio ni tu plan: por eso están separadas de Negocio y de Configuración de planeación.</p>
        </div></div>
        <div class="panel__body">
          <div class="table-wrap"><table class="table ds-table">
            <caption>¿Dónde se configura cada cosa?</caption>
            <thead><tr><th scope="col">Qué</th><th scope="col">Para qué sirve</th><th scope="col">Dónde está hoy</th></tr></thead>
            <tbody>${ROWS.map((r) => `<tr><th scope="row">${esc(r.what)}</th><td class="wrap">${esc(r.desc)}</td>
              <td class="wrap">${r.view ? `<a href="#${r.view}" data-nav="${r.view}">${esc(r.where)}</a>` : esc(r.where)}</td></tr>`).join('')}</tbody>
          </table></div>
          <div class="ds-empty" role="note"><p>Las preferencias de la herramienta se reunirán en esta pantalla. Esta sección se habilitará conforme se incorporen.</p></div>
        </div>
      </section>`;
  }

  FP.settingsView = { render };
})(typeof window !== 'undefined' ? window : globalThis);
