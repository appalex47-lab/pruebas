/**
 * settings-view.js — Configuración de Sales Navigator.
 * Reúne en un solo lugar lo que se configura una vez y vale para toda la app:
 *   · Estado de la herramienta (año, meta, canales, datos y motor: el detalle de las píldoras del encabezado) · Modo de uso · Análisis con IA (Cohere) · Almacenamiento · Negocio (Business Setup, más abajo en la misma vista).
 * No hay lógica nueva: cada control conserva su acción de siempre (ux-mode, dx-key, dx-remember, dx-model, storage-tests, storage-retry, bc-*).
 * Configuración de planeación NO está aquí: sigue en Planear porque afecta al plan, no a la herramienta.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const H = () => FP.ui.helpers;
  const $ = (id) => document.getElementById(id);

  // Preferencias que siguen en su vista (se enlazan; no se movieron)
  const ELSEWHERE = [
    { what: 'Configuración de planeación', desc: 'Método, periodo histórico, suavizado y comparación de métodos. Afecta a tu plan, no a la herramienta.', view: 'configuracion', where: 'Planear' },
    { what: 'Opciones de lectura de archivos', desc: 'Formato de fecha, formato numérico y tolerancia de CR y AOV al importar.', view: 'carga', where: 'Carga de datos' },
    { what: 'Parámetros del forecast', desc: 'Método y umbrales de alertas del pacing.', view: 'pacing', where: 'Pacing & Forecast' },
    { what: 'Recorrido guiado y glosario', desc: 'Guía opcional para aprender la herramienta.', view: 'ayuda', where: '¿Cómo funciona?' }
  ];

  function render(state) {
    const esc = H().esc;
    const ai = state.dx;
    $('settings-view').innerHTML = `
      <section class="panel" aria-labelledby="t-settings">
        <div class="panel__head"><div>
          <h2 class="panel__title" id="t-settings">Configuración de Sales Navigator</h2>
          <p class="panel__desc">Lo que configuras una vez y vale para toda la herramienta. Tu plan se configura aparte, en Configuración de planeación.</p>
        </div></div>
        <div class="panel__body">
          <nav aria-label="Secciones de esta pantalla"><ul class="plain-list">
            <li><a href="#st-estado" data-jump="st-estado">Estado de la herramienta</a></li>
            <li><a href="#st-modo" data-jump="st-modo">Modo de uso</a></li>
            <li><a href="#st-ia" data-jump="st-ia">Análisis con IA (Cohere)</a></li>
            <li><a href="#st-almacenamiento" data-jump="st-almacenamiento">Almacenamiento</a></li>
            <li><a href="#st-negocio" data-jump="st-negocio">Negocio (Business Setup)</a></li>
          </ul></nav>
        </div>
      </section>

      <section class="panel" id="st-estado" tabindex="-1" aria-labelledby="t-st-estado">
        <div class="panel__head"><div>
          <h3 class="panel__title" id="t-st-estado">Estado de la herramienta</h3>
          <p class="panel__desc">El detalle de las píldoras del encabezado: año, meta anual, canales, estado de los datos y estado del motor.</p>
        </div></div>
        <div class="panel__body"><dl class="status-bar__list" id="status-bar"></dl></div>
      </section>

      <section class="panel" id="st-modo" tabindex="-1" aria-labelledby="t-st-modo">
        <div class="panel__head"><div>
          <h3 class="panel__title" id="t-st-modo">Modo de uso</h3>
          <p class="panel__desc">Cuánto detalle y ayuda se muestra en cada vista. Aprendiz explica más y te guía paso a paso; Analista muestra el detalle completo.</p>
        </div></div>
        <div class="panel__body">${H().segmented('ux-mode', FP.guidanceConfig.MODES, state.ux.mode)}</div>
      </section>

      <section class="panel" id="st-ia" tabindex="-1" aria-labelledby="t-st-ia">
        <div class="panel__head"><div>
          <h3 class="panel__title" id="t-st-ia">Análisis con IA (Cohere)</h3>
          <p class="panel__desc">La usan Diagnóstico, Recovery Center y Narrativa. Cohere solo redacta a partir de datos ya calculados: no calcula ni cambia cifras.</p>
        </div></div>
        <div class="panel__body stack">
          <div class="field"><label for="dx-key-input" class="field__hint">API key de Cohere</label>
            <input id="dx-key-input" type="password" autocomplete="off" value="${esc(ai.apiKey || '')}" data-action="dx-key" placeholder="Pega tu API key"></div>
          <div class="field field--check"><label><input type="checkbox" data-action="dx-remember" ${ai.rememberKey ? 'checked' : ''}> Recordar la key en este navegador</label>
            <span class="field__hint">Se guarda en localStorage de este navegador y nunca se exporta. Cualquiera con acceso a este navegador podría verla.</span></div>
          <div class="field"><label for="dx-model" class="field__hint">Modelo</label>
            <input id="dx-model" type="text" value="${esc(ai.model)}" data-action="dx-model"></div>
        </div>
      </section>

      <section class="panel" id="st-almacenamiento" tabindex="-1" aria-labelledby="t-st-alm">
        <div class="panel__head"><div>
          <h3 class="panel__title" id="t-st-alm">Almacenamiento</h3>
          <p class="panel__desc">Dónde se guardan tus datos en este navegador.</p>
        </div></div>
        <div class="panel__body">${FP.productView.storageBlock(state, { heading: false })}</div>
      </section>

      <section class="panel" aria-labelledby="t-st-else">
        <div class="panel__head"><div>
          <h3 class="panel__title" id="t-st-else">Otras preferencias, en su vista</h3>
          <p class="panel__desc">Siguen donde se usan: cambian el resultado de esa vista.</p>
        </div></div>
        <div class="panel__body panel__body--flush"><div class="table-wrap"><table class="table ds-table">
          <thead><tr><th scope="col">Qué</th><th scope="col">Para qué sirve</th><th scope="col">Dónde está</th></tr></thead>
          <tbody>${ELSEWHERE.map((r) => `<tr><th scope="row">${esc(r.what)}</th><td class="wrap">${esc(r.desc)}</td><td class="wrap"><a href="#${r.view}" data-nav="${r.view}">${esc(r.where)}</a></td></tr>`).join('')}</tbody>
        </table></div></div>
      </section>`;
  }

  // Los vínculos internos de esta pantalla llevan a su sección sin cambiar de vista
  if (typeof document !== 'undefined') {
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[data-jump]');
      if (!a) return;
      e.preventDefault();
      const el = document.getElementById(a.dataset.jump);
      if (el) { el.scrollIntoView({ block: 'start' }); try { el.focus({ preventScroll: true }); } catch (err) { /* sin foco */ } }
    });
  }

  FP.settingsView = { render };
})(typeof window !== 'undefined' ? window : globalThis);
