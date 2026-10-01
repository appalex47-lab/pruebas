/**
 * ga4Segments.js — Fase 11 · pieza 2: traductor del CSV exportado de GA4 al formato de Segmentos.
 * Decisiones del usuario: web y app en la misma propiedad (Plataforma: web → Ecommerce; Android / iOS → App); «(not set)» se muestra como
 * «Sin dato (not set)»; los usuarios no se usan (no se pueden sumar entre filas), solo Sesiones, Compras e Ingresos; el archivo es CSV.
 * Cada fila de GA4 combina varias dimensiones (dispositivo, fuente/medio, campaña, landing, nuevo/recurrente): se genera una fila de
 * Segmentos por dimensión y se SUMAN las filas que caen en el mismo día, canal, dimensión y segmento. WhatsApp y Llamadas no vienen de GA4.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});

  const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9/+]+/g, ' ').trim();
  /** Encabezados reconocidos (GA4 en español y en inglés), ya normalizados. */
  const COLS = {
    date: ['fecha', 'date'],
    platform: ['plataforma', 'platform'],
    device: ['categoria de dispositivo', 'device category'],
    sourceMedium: ['fuente/medio de la sesion', 'session source/medium', 'fuente / medio de la sesion', 'session source / medium'],
    campaign: ['campana de la sesion', 'session campaign'],
    landing: ['pagina de destino y cadena de consulta', 'pagina de destino + cadena de consulta', 'landing page + query string', 'landing page'],
    customerType: ['nuevo/recurrente', 'nuevo / recurrente', 'new/returning', 'new / returning'],
    sessions: ['sesiones', 'sessions'],
    purchases: ['compras en comercio electronico', 'compras de comercio electronico', 'transacciones', 'ecommerce purchases', 'transactions'],
    revenue: ['ingresos derivados de las compras', 'ingresos por compras', 'purchase revenue']
  };
  const PLATFORM = { web: 'ecommerce', android: 'app', ios: 'app' };
  const DEVICE = { mobile: 'Móvil', desktop: 'Escritorio', tablet: 'Tableta', 'smart tv': 'Smart TV' };
  const CUSTOMER = { new: 'Nuevo', nuevo: 'Nuevo', returning: 'Recurrente', recurrente: 'Recurrente', established: 'Recurrente' };

  /** Separa una línea CSV respetando comillas. */
  function splitLine(line, sep) {
    const out = []; let cur = ''; let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
      else if (c === sep && !q) { out.push(cur); cur = ''; }
      else cur += c;
    }
    out.push(cur);
    return out.map((x) => x.trim());
  }

  /** Líneas útiles: sin comentarios «#» de GA4 ni líneas vacías. */
  function dataLines(text) {
    return String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim() && !/^\s*#/.test(l));
  }

  function headerMap(headers) {
    const h = headers.map(norm); const map = {};
    Object.entries(COLS).forEach(([k, names]) => { const i = h.findIndex((x) => names.includes(x)); if (i >= 0) map[k] = i; });
    return map;
  }

  /** ¿El texto parece un export de GA4? (fecha + plataforma + sesiones) */
  function detect(text) {
    const lines = dataLines(text); if (!lines.length) return false;
    const sep = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ';' : ',';
    const m = headerMap(splitLine(lines[0], sep));
    return m.date !== undefined && m.platform !== undefined && m.sessions !== undefined;
  }

  function parseDate(v) {
    const s = String(v || '').trim();
    if (/^\d{8}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    return null;   // filas de totales u otras sin fecha
  }

  /** Números de GA4: «1,234», «$1,234.56», «1234.56». */
  function parseNumber(v) {
    let s = String(v === undefined || v === null ? '' : v).replace(/[$\s"]/g, '');
    if (s === '') return 0;
    if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, '');
    const n = Number(s);
    return isFinite(n) ? n : NaN;
  }

  const label = (v, dict) => {
    const raw = String(v || '').trim();
    if (!raw || norm(raw) === 'not set' || raw === '(not set)') return 'Sin dato (not set)';
    return (dict && dict[norm(raw)]) || raw;
  };

  /**
   * Convierte el CSV de GA4 al CSV de Segmentos de la app.
   * @returns {{ csv: string, stats: { rowsIn, rowsOut, skipped, platforms:{}, dimensions:[] } }}
   */
  function translate(text) {
    const lines = dataLines(text);
    const sep = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ';' : ',';
    const m = headerMap(splitLine(lines[0], sep));
    const dims = [
      ['device', 'dispositivo', (r) => label(r[m.device], DEVICE)],
      ['sourceMedium', 'fuente', (r) => { const v = String(r[m.sourceMedium] || ''); return norm(v) === 'not set' || v === '(not set)' ? 'Sin dato (not set)' : label(v.split('/')[0].trim()); }],
      ['sourceMedium', 'medio', (r) => { const v = String(r[m.sourceMedium] || ''); const p = v.split('/'); return norm(v) === 'not set' || v === '(not set)' || p.length < 2 ? 'Sin dato (not set)' : label(p.slice(1).join('/').trim()); }],
      ['campaign', 'campaña', (r) => label(r[m.campaign])],
      ['landing', 'landing', (r) => label(r[m.landing])],
      ['customerType', 'tipo_cliente', (r) => label(r[m.customerType], CUSTOMER)]
    ].filter(([k]) => m[k] !== undefined);
    const agg = new Map(); const stats = { rowsIn: 0, rowsOut: 0, skipped: 0, platforms: {}, dimensions: [...new Set(dims.map((d) => d[1]))] };
    for (const line of lines.slice(1)) {
      const r = splitLine(line, sep);
      const date = parseDate(r[m.date]);
      const plat = norm(r[m.platform]);
      const canal = PLATFORM[plat];
      const ses = parseNumber(r[m.sessions]), ped = m.purchases !== undefined ? parseNumber(r[m.purchases]) : 0, ven = m.revenue !== undefined ? parseNumber(r[m.revenue]) : 0;
      if (!date || !canal || [ses, ped, ven].some((x) => isNaN(x))) { stats.skipped++; continue; }
      stats.rowsIn++; stats.platforms[plat] = (stats.platforms[plat] || 0) + 1;
      dims.forEach(([, dim, fn]) => {
        const seg = fn(r); const k = `${date}|${canal}|${dim}|${seg}`;
        const a = agg.get(k) || { date, canal, dim, seg, venta: 0, pedidos: 0, sesiones: 0 };
        a.venta += ven; a.pedidos += ped; a.sesiones += ses; agg.set(k, a);
      });
    }
    const q = (s) => (/[",;\n]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : s);
    const out = ['fecha,canal,dimension,segmento,venta,pedidos,traffic_volume'];
    [...agg.values()].sort((a, b) => (a.date + a.canal + a.dim + a.seg).localeCompare(b.date + b.canal + b.dim + b.seg))
      .forEach((a) => out.push([a.date, a.canal, a.dim, q(a.seg), Math.round(a.venta * 100) / 100, a.pedidos, a.sesiones].join(',')));
    stats.rowsOut = out.length - 1;
    return { csv: out.join('\n') + '\n', stats };
  }

  FP.ga4Segments = { detect, translate, parseNumber, parseDate };
})(typeof window !== 'undefined' ? window : globalThis);
