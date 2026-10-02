/**
 * segments-view.js — Fase 11 · pieza 2: «Tráfico y conversión» por segmento.
 * Lee el archivo de Segmentos que ya acepta Carga de datos (fecha, canal, dimensión, segmento, venta, pedidos, tráfico y clientes)
 * y muestra, para el periodo y canal elegidos (la misma selección de Diagnóstico), tráfico, pedidos, venta, CR y AOV por segmento,
 * contra el periodo anterior de la misma duración (los segmentos no tienen plan). CR y AOV salen de sumas, nunca de promedios.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const H = () => FP.ui.helpers;
  const $ = (id) => document.getElementById(id);
  const fin = (v) => typeof v === 'number' && isFinite(v);

  function addDays(iso, n) { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function daysBetween(a, b) { return Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / 86400000) + 1; }

  /** Suma por segmento de una dimensión, en un rango de fechas y canal. Solo valores observados o calculados. */
  function sumBy(recs, { from, to, channel, dimension }) {
    const out = new Map();
    recs.forEach((r) => {
      if (r.dimension !== dimension || r.date < from || r.date > to) return;
      if (channel !== 'total' && r.channel !== channel) return;
      const k = r.segmentKey || r.segment;
      const a = out.get(k) || { key: k, label: r.segment, revenue: 0, orders: 0, traffic: 0, customers: 0, newCustomers: 0, has: { revenue: false, orders: false, traffic: false, customers: false } };
      const v = (m) => (r.metrics[m] && (r.metrics[m].source === 'observed') && fin(r.metrics[m].value) ? r.metrics[m].value : null);
      const rv = v('revenue'), od = v('orders'), tv = v('trafficVolume');
      if (rv !== null) { a.revenue += rv; a.has.revenue = true; }
      if (od !== null) { a.orders += od; a.has.orders = true; }
      if (tv !== null) { a.traffic += tv; a.has.traffic = true; }
      if (r.extra && fin(r.extra.customers)) { a.customers += r.extra.customers; a.has.customers = true; }
      if (r.extra && fin(r.extra.newCustomers)) a.newCustomers += r.extra.newCustomers;
      out.set(k, a);
    });
    out.forEach((a) => { a.cr = a.has.orders && a.has.traffic && a.traffic > 0 ? a.orders / a.traffic : null; a.aov = a.has.revenue && a.has.orders && a.orders > 0 ? a.revenue / a.orders : null; });
    return out;
  }

  /** Resumen de una dimensión: segmentos del periodo contra el periodo anterior de la misma duración. */
  function summarize(recs, { from, to, channel, dimension }) {
    const n = daysBetween(from, to);
    const base = { from: addDays(from, -n), to: addDays(from, -1) };
    const cur = sumBy(recs, { from, to, channel, dimension }), prev = sumBy(recs, { ...base, channel, dimension });
    const totTraffic = [...cur.values()].reduce((s, a) => s + a.traffic, 0);
    const keys = new Set([...cur.keys(), ...prev.keys()]);
    const rows = [...keys].map((k) => {
      const c = cur.get(k) || null, p = prev.get(k) || null;
      return { key: k, label: (c || p).label, current: c, baseline: p, trafficShare: c && totTraffic ? c.traffic / totTraffic : null,
        trafficDeltaPct: c && p && p.traffic ? c.traffic / p.traffic - 1 : null,
        crDeltaPp: c && p && fin(c.cr) && fin(p.cr) ? (c.cr - p.cr) * 100 : null,
        revenueDelta: (c ? c.revenue : 0) - (p ? p.revenue : 0) };
    }).sort((a, b) => ((b.current && b.current.traffic) || 0) - ((a.current && a.current.traffic) || 0));
    return { period: { from, to }, baseline: base, rows, totalTraffic: totTraffic };
  }

  /** Por qué no hay filas: dice qué fechas y canales sí tienen datos de esa dimensión. */
  function emptyReason(recs, dimension, period, channel, label) {
    const own = recs.filter((r) => r.dimension === dimension);
    const chLabel = (id) => (FP.dataModel && FP.dataModel.getChannel ? FP.dataModel.getChannel(id).label : id);
    if (!own.length) return `El archivo cargado no trae ${label}.`;
    const dates = own.map((r) => r.date).sort(), chans = [...new Set(own.map((r) => r.channel))];
    const has = `${label} tiene datos del ${dates[0]} al ${dates[dates.length - 1]} en ${chans.map(chLabel).join(' y ')}`;
    if (channel !== 'total' && !chans.includes(channel)) return `No hay ${label} en el canal ${chLabel(channel)}. ${has}.`;
    return `No hay ${label} entre ${period.from} y ${period.to}${channel !== 'total' ? ` en ${chLabel(channel)}` : ''}. ${has}. Elige un periodo dentro de ese rango.`;
  }

  const PREFERRED = ['device', 'source', 'medium', 'campaign', 'landing', 'customer_type'];

  /** Mapa tráfico × CR en SVG: x = % del tráfico, y = CR; líneas en la participación promedio y el CR del total; tamaño = venta. */
  function quadrantMap(ins, esc) {
    const pts = ins.rows.filter((r) => r.relevant && r.current && typeof r.current.cr === 'number');
    if (pts.length < 2) return '';
    const W = 640, Hh = 300, L = 56, R = 16, T = 16, B = 44;
    const maxX = Math.max(...pts.map((r) => r.trafficShare)) * 1.1, maxY = Math.max(ins.totals.cr, ...pts.map((r) => r.current.cr)) * 1.15;
    const sx = (v) => L + (v / maxX) * (W - L - R), sy = (v) => T + (1 - v / maxY) * (Hh - T - B);
    const maxRev = Math.max(...pts.map((r) => r.current.revenue || 0)) || 1;
    const avg = 1 / pts.length;
    const circles = pts.map((r) => {
      const rad = 6 + 18 * Math.sqrt((r.current.revenue || 0) / maxRev);
      const name = r.label.length > 18 ? r.label.slice(0, 17) + '…' : r.label;
      return `<g class="sgmap__pt sgmap__pt--${r.quadrant}"><circle cx="${sx(r.trafficShare).toFixed(1)}" cy="${sy(r.current.cr).toFixed(1)}" r="${rad.toFixed(1)}"><title>${esc(r.label)}: ${(r.trafficShare * 100).toFixed(1)} % del tráfico, CR ${(r.current.cr * 100).toFixed(2)} %</title></circle>
        <text x="${(sx(r.trafficShare) + rad + 3).toFixed(1)}" y="${(sy(r.current.cr) + 4).toFixed(1)}">${esc(name)}</text></g>`;
    }).join('');
    return `<figure class="sgmap"><svg viewBox="0 0 ${W} ${Hh}" role="img" aria-labelledby="sgmap-t sgmap-d">
        <title id="sgmap-t">Mapa de tráfico contra CR</title><desc id="sgmap-d">Cada círculo es un segmento con volumen suficiente; el tamaño es la venta. La tabla de abajo tiene los mismos datos y su cuadrante.</desc>
        <line class="sgmap__axis" x1="${L}" y1="${Hh - B}" x2="${W - R}" y2="${Hh - B}"/><line class="sgmap__axis" x1="${L}" y1="${T}" x2="${L}" y2="${Hh - B}"/>
        <line class="sgmap__ref" x1="${sx(avg).toFixed(1)}" y1="${T}" x2="${sx(avg).toFixed(1)}" y2="${Hh - B}"/><line class="sgmap__ref" x1="${L}" y1="${sy(ins.totals.cr).toFixed(1)}" x2="${W - R}" y2="${sy(ins.totals.cr).toFixed(1)}"/>
        <text class="sgmap__q" x="${W - R - 4}" y="${T + 12}" text-anchor="end">Estrellas</text><text class="sgmap__q" x="${L + 6}" y="${T + 12}">Escalar tráfico</text>
        <text class="sgmap__q" x="${W - R - 4}" y="${Hh - B - 6}" text-anchor="end">Convertir mejor</text><text class="sgmap__q" x="${L + 6}" y="${Hh - B - 6}">Revisar</text>
        <text class="sgmap__lbl" x="${(L + W - R) / 2}" y="${Hh - 10}" text-anchor="middle">% del tráfico →</text>
        <text class="sgmap__lbl" x="14" y="${(T + Hh - B) / 2}" text-anchor="middle" transform="rotate(-90 14 ${(T + Hh - B) / 2})">CR →</text>
        ${circles}</svg>
      <figcaption class="field__hint">Línea vertical: participación promedio (${(avg * 100).toFixed(1)} %). Línea horizontal: CR del total (${(ins.totals.cr * 100).toFixed(2)} %). Tamaño: venta.</figcaption></figure>`;
  }

  /** Parte 1 de descubrimiento: hallazgos, mapa, oportunidades en pesos y rankings con umbral. */
  function discovery(ins, { esc, money, pct, F }) {
    const list = (rows, val) => rows.length ? `<ol class="sgrank__list">${rows.map((r) => `<li><span>${esc(r.label)}</span><strong>${val(r)}</strong></li>`).join('')}</ol>` : '<p class="field__hint">Sin segmentos con volumen suficiente.</p>';
    return `<div class="panel__body stack sgdisc">
        <section aria-labelledby="sg-h"><h3 class="panel__title" id="sg-h">Lo que destaca</h3>
          <ul class="sghl">${ins.highlights.map((h) => `<li class="sghl__item sghl__item--${h.kind}">${esc(h.text)}</li>`).join('')}</ul>
          <p class="field__hint">Diferencias matemáticas entre segmentos, no causas: cualquier explicación es una hipótesis por validar.</p></section>
        <section aria-labelledby="sg-m"><h3 class="panel__title" id="sg-m">Mapa de tráfico y conversión</h3>${quadrantMap(ins, esc) || '<p class="field__hint">Hacen falta al menos 2 segmentos con volumen suficiente.</p>'}</section>
        <section aria-labelledby="sg-o"><h3 class="panel__title" id="sg-o">Oportunidad estimada</h3>
          <p class="field__hint">Si el segmento convirtiera al CR del total, con su mismo tráfico y su AOV. Solo segmentos con volumen suficiente y una diferencia de CR concluyente. Escenario matemático, no promesa.</p>
          ${ins.opportunities.length ? `<div class="table-wrap"><table class="table ds-table" aria-label="Oportunidad estimada por segmento">
            <thead><tr><th scope="col">Segmento</th><th scope="col" class="num">Tráfico</th><th scope="col" class="num">CR</th><th scope="col" class="num">CR del total</th><th scope="col" class="num">AOV</th><th scope="col" class="num">Oportunidad estimada</th></tr></thead>
            <tbody>${ins.opportunities.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td class="num">${F.integer(r.current.traffic)}</td><td class="num">${pct(r.current.cr, 2)}</td><td class="num">${pct(ins.totals.cr, 2)}</td><td class="num">${money(r.current.aov)}</td><td class="num">+${money(r.opportunity)}</td></tr>`).join('')}</tbody></table></div>`
            : '<p>Ningún segmento con volumen suficiente convierte claramente por debajo del total.</p>'}</section>
        <section aria-labelledby="sg-r"><h3 class="panel__title" id="sg-r">Rankings</h3>
          <p class="field__hint">Solo segmentos con al menos ${F.integer(ins.threshold)} sesiones (el mayor entre 500 y el 1 % del tráfico), salvo «Más venta».</p>
          <div class="sgrank">
            <div><h4>Más venta</h4>${list(ins.rankings.revenue, (r) => money(r.current.revenue))}</div>
            <div><h4>Mejor CR</h4>${list(ins.rankings.bestCr, (r) => pct(r.current.cr, 2))}</div>
            <div><h4>Menor CR (bajo el total)</h4>${list(ins.rankings.worstCr, (r) => pct(r.current.cr, 2))}</div>
            <div><h4>Menor AOV (bajo el total)</h4>${list(ins.rankings.worstAov, (r) => money(r.current.aov))}</div>
          </div></section>
      </div>`;
  }

  function render(state) {
    const esc = H().esc, F = FP.format, C = FP.config;
    const recs = [...FP.dataStore.resolveLatest(state.store, 'segments').values()];
    const dimsCfg = C.diagnostics.dimensions;
    const present = [...new Set(recs.map((r) => r.dimension).filter(Boolean))];
    const dims = [...PREFERRED.filter((d) => present.includes(d)), ...present.filter((d) => !PREFERRED.includes(d))];
    const head = `<section class="panel" aria-labelledby="t-seg"><div class="panel__head"><div>
        <h2 class="panel__title" id="t-seg">Tráfico y conversión por segmento</h2>
        <p class="panel__desc">Tráfico, pedidos, venta, CR y AOV por dispositivo, fuente y medio, campaña, landing o tipo de cliente, con el archivo de Segmentos. CR y AOV salen de sumas, nunca de promedios.</p>
      </div></div>`;
    if (!recs.length) {
      $('segments-view').innerHTML = `${head}<div class="panel__body"><div class="ds-empty" role="note">
        <p><strong>Todavía no hay segmentos cargados.</strong></p>
        <p>Carga el archivo de Segmentos en <a href="#carga" data-nav="carga">Carga de datos</a> con estas columnas: ${esc(C.dataTypes.segments.template.join(', '))}.
          En «dimension» van, por ejemplo, dispositivo, fuente, medio, campaña, landing o tipo_cliente; en «segmento», su valor (Móvil, google / cpc…).</p>
        <p class="field__hint">Los mismos datos alimentan el Nivel 2 del Diagnóstico. También acepta el CSV exportado de GA4 tal cual: se convierte solo al cargarlo.</p>
      </div></div></section>`;
      return;
    }
    const sg = state.seg || (state.seg = { dimension: null });
    if (!dims.includes(sg.dimension)) sg.dimension = dims[0];
    const s = state.dx.settings;
    const range = FP.app.periodRange(s.periodType, s.periodKey) || { from: `${state.year}-01-01`, to: `${state.year}-12-31` };
    const res = summarize(recs, { from: range.from, to: range.to, channel: s.channel, dimension: sg.dimension });
    const lbl = (d) => (dimsCfg[d] && dimsCfg[d].label) || d;
    const ins = FP.segmentInsights.analyze(res);
    const byKey = new Map(ins.rows.map((r) => [r.key, r]));
    const Q = FP.segmentInsights.QUADRANT;
    const pct = (v, d = 1) => (fin(v) ? `${(v * 100).toFixed(d)} %` : '—');
    const signedPct = (v) => (fin(v) ? `${v >= 0 ? '+' : '−'}${Math.abs(v * 100).toFixed(1)} %` : '—');
    const signedPp = (v) => (fin(v) ? `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(2)} pp` : '—');
    const money = (v) => F.currency(v || 0, 0);
    const signedMoney = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + F.currency(Math.abs(v || 0), 0);
    const num = (a, k) => (a && a.has[k === 'traffic' ? 'traffic' : k] ? F.integer(a[k]) : '—');
    $('segments-view').innerHTML = `${head}
      <div class="panel__body stack">
        ${FP.narrativeView.contextControls(state, 'sg', 'dx-setting', 'dx-period-type')}
        <div class="field"><label for="sg-dim" class="field__hint">Dimensión</label>
          <select id="sg-dim" data-action="seg-dim">${dims.map((d) => `<option value="${esc(d)}" ${d === sg.dimension ? 'selected' : ''}>${esc(lbl(d))}</option>`).join('')}</select></div>
        <p class="field__hint">Periodo ${esc(res.period.from)} a ${esc(res.period.to)} contra ${esc(res.baseline.from)} a ${esc(res.baseline.to)} (periodo anterior de la misma duración: los segmentos no tienen plan). Periodo y canal son la misma selección de Diagnóstico.</p>
      </div>
      ${res.rows.length ? discovery(ins, { esc, money, pct, F }) : ''}
      <div class="panel__body panel__body--flush"><div class="table-wrap"><table class="table ds-table" aria-label="${esc(lbl(sg.dimension))}: tráfico y conversión por segmento">
        <thead><tr><th scope="col">${esc(lbl(sg.dimension))}</th><th scope="col">Cuadrante</th><th scope="col" class="num">Tráfico</th><th scope="col" class="num">% del tráfico</th><th scope="col" class="num">Δ tráfico</th>
          <th scope="col" class="num">Pedidos</th><th scope="col" class="num">CR</th><th scope="col" class="num">Δ CR</th><th scope="col" class="num">AOV</th><th scope="col" class="num">Venta</th><th scope="col" class="num">Δ venta</th></tr></thead>
        <tbody>${res.rows.length ? res.rows.map((r) => { const c = r.current;
          const x = byKey.get(r.key) || {}; const q = x.quadrant ? Q[x.quadrant] : null;
          return `<tr><th scope="row">${esc(r.label)}</th><td>${q ? `<span class="sgq sgq--${x.quadrant}">${esc(q.short)}</span>${x.conclusive === false ? '<span class="cell-sub">diferencia de CR no concluyente</span>' : ''}` : '—'}</td><td class="num">${num(c, 'traffic')}</td><td class="num">${pct(r.trafficShare)}</td><td class="num">${signedPct(r.trafficDeltaPct)}</td>
            <td class="num">${num(c, 'orders')}</td><td class="num">${c ? pct(c.cr, 2) : '—'}</td><td class="num">${signedPp(r.crDeltaPp)}</td>
            <td class="num">${c && fin(c.aov) ? money(c.aov) : '—'}</td><td class="num">${c && c.has.revenue ? money(c.revenue) : '—'}</td><td class="num">${signedMoney(r.revenueDelta)}</td></tr>`; }).join('')
          : `<tr><td colspan="11">${esc(emptyReason(recs, sg.dimension, res.period, s.channel, lbl(sg.dimension)))}</td></tr>`}</tbody>
      </table></div></div>
      <div class="panel__body"><p class="field__hint">Δ CR en puntos porcentuales (pp). WhatsApp y Llamadas no tienen datos por segmento (GA4 solo mide el sitio y la app): sus totales siguen en venta real y en las demás vistas. Los mismos datos alimentan el <a href="#diagnostico" data-nav="diagnostico">Nivel 2 del Diagnóstico</a>. También acepta el CSV exportado de GA4 tal cual: se convierte solo al cargarlo.</p></div>
    </section>`;
  }

  FP.segmentsView = { render, summarize, emptyReason };
})(typeof window !== 'undefined' ? window : globalThis);
