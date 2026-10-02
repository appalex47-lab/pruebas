/**
 * rules.js — Fase A · motor de calidad: catálogo de reglas con acción, y cuarentena por celda.
 *
 * Cada tipo de incidencia que ya detecta validation.js (catálogo en config.errorTypes) recibe aquí su ACCIÓN:
 *   - reject_row      la fila no se puede ubicar (sin fecha o canal válidos): no entra, como antes.
 *   - quarantine_cell la fila entra, pero ESA celda queda en cuarentena: se conserva el valor original (raw) y el interpretado,
 *                     la regla y el motivo; no participa en sumas ni ratios. Antes, la fila completa se rechazaba (o, con
 *                     «importar filas con errores», el negativo se sumaba).
 *   - flag            se registra como advertencia y no se excluye nada.
 * Política de negativos (decisión del usuario, con la recomendación): nunca se transforman (ni −500 → 500 ni → 0); van a
 * cuarentena con su valor original. En datos diarios por canal un total negativo casi siempre es un error, no una devolución;
 * si una fuente trae devoluciones netas, la excepción se agregará como política explícita por fuente (Fase B), no en silencio.
 * Reglas determinísticas: Cohere no participa en ninguna decisión de calidad.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const C = () => FP.config;

  const RULES = {
    INVALID_DATE: { action: 'reject_row', overridable: false, why: 'Sin fecha válida la fila no se puede ubicar en el calendario.' },
    AMBIGUOUS_DATE: { action: 'reject_row', overridable: true, why: 'La fecha admite dos lecturas (DD/MM o MM/DD); elige el formato en la carga.' },
    MISSING_DATE: { action: 'reject_row', overridable: false, why: 'Sin fecha la fila no se puede ubicar.' },
    INVALID_CHANNEL: { action: 'reject_row', overridable: true, why: 'Canal no reconocido; se puede homologar en Configuración → Equivalencias.' },
    MISSING_CHANNEL: { action: 'reject_row', overridable: false, why: 'Sin canal la fila no se puede ubicar.' },
    INVALID_REVENUE: { action: 'quarantine_cell', field: 'revenue', overridable: false, why: 'Valor no numérico: se conserva el original y no entra a los KPIs.' },
    INVALID_ORDERS: { action: 'quarantine_cell', field: 'orders', overridable: false, why: 'Valor no numérico: se conserva el original y no entra a los KPIs.' },
    INVALID_TRAFFIC: { action: 'quarantine_cell', field: 'trafficVolume', overridable: false, why: 'Valor no numérico: se conserva el original y no entra a los KPIs.' },
    INVALID_CONVERSION_RATE: { action: 'quarantine_cell', field: 'conversionRate', overridable: false, why: 'CR fuera de rango o no numérico.' },
    INVALID_AOV: { action: 'quarantine_cell', field: 'aov', overridable: false, why: 'AOV no numérico o incompatible.' },
    NEGATIVE_REVENUE: { action: 'quarantine_cell', field: 'revenue', overridable: true, why: 'Venta negativa: puede ser devolución, ajuste o error; no se cambia ni se suma.' },
    NEGATIVE_ORDERS: { action: 'quarantine_cell', field: 'orders', overridable: true, why: 'Pedidos negativos: no se cambian ni se suman.' },
    NEGATIVE_TRAFFIC: { action: 'quarantine_cell', field: 'trafficVolume', overridable: true, why: 'Volumen negativo: no se cambia ni se suma.' },
    FUTURE_DATE: { action: 'flag', overridable: false, why: 'Un dato real con fecha futura suele ser una fila adelantada o en 0.' },
    NON_ISO_DATE: { action: 'flag', overridable: false, why: 'La fecha se interpretó con el formato elegido.' },
    MISSING_VALUE: { action: 'flag', overridable: false, why: 'Celda vacía: no se trata como cero.' },
    MATHEMATICAL_INCONSISTENCY: { action: 'flag', overridable: false, why: 'Métricas incompatibles entre sí (por ejemplo, más pedidos que tráfico).' },
    DUPLICATE_RECORD: { action: 'flag', overridable: false, why: 'Misma fecha y canal que otro registro.' },
    INVALID_DAY_TYPE: { action: 'flag', overridable: false, why: 'Tipo de día no reconocido.' },
    INVALID_NUMBER: { action: 'flag', overridable: false, why: 'Número inválido en un campo secundario.' },
    MALFORMED_ROW: { action: 'flag', overridable: false, why: 'La fila trae más o menos columnas que el encabezado.' },
    MISSING_REQUIRED_COLUMN: { action: 'reject_file', overridable: false, why: 'Falta una columna obligatoria en el mapeo.' },
    DUPLICATE_MAPPING: { action: 'reject_file', overridable: false, why: 'Dos columnas van al mismo campo.' }
  };

  /** Catálogo completo para la UI y las pruebas: código, severidad, etiqueta, acción y motivo. */
  function catalog() {
    return Object.entries(C().errorTypes || {}).map(([code, t]) => ({ code, severity: t.severity, label: t.label, ...(RULES[code] || { action: 'flag', overridable: false, why: '' }) }));
  }
  const actionOf = (type) => (RULES[type] || { action: 'flag' }).action;

  /** De qué métricas depende cada calculada: si una entrada queda en cuarentena, la calculada no se puede usar. */
  const DEPENDS = { conversionRate: ['orders', 'trafficVolume'], aov: ['revenue', 'orders'] };

  /**
   * Aplica la cuarentena a las filas procesadas por import.process. Muta rows: status 'quarantined' cuando TODOS sus errores son
   * de celda (la llave es válida); marca cada celda { value: null, source: 'quarantined', raw, parsedValue, rule } y deja sin
   * valor las calculadas que dependían de ella. Devuelve cuántas filas y celdas quedaron en cuarentena.
   */
  function applyQuarantine(rows) {
    let qRows = 0, qCells = 0;
    rows.forEach((r) => {
      if (!r.keyValid) return;
      const errs = r.issues.filter((i) => i.severity === 'error');
      if (!errs.length || !errs.every((i) => actionOf(i.type) === 'quarantine_cell')) return;
      const m = r.record.metrics;
      errs.forEach((i) => {
        const k = RULES[i.type].field; const cell = m[k] || {};
        if (cell.source === 'quarantined') return;
        m[k] = { value: null, source: 'quarantined', raw: i.value === undefined ? cell.raw : i.value, parsedValue: typeof cell.value === 'number' ? cell.value : null, rule: i.type, note: RULES[i.type].why };
        qCells++;
        i.action = 'quarantine_cell';
      });
      Object.entries(DEPENDS).forEach(([k, deps]) => {
        if (m[k] && m[k].source === 'calculated' && deps.some((d) => m[d] && m[d].source === 'quarantined')) m[k] = { value: null, source: 'missing', note: 'No se calcula: una de sus entradas está en cuarentena.' };
      });
      r.status = 'quarantined'; r.record.status = 'quarantined'; qRows++;
    });
    return { rows: qRows, cells: qCells };
  }

  /** Lista de cuarentena (auditoría) a partir de lo guardado: registro, celda, valor original, regla, archivo y fila. */
  function quarantineList(store, dataTypes = C().dataTypeIds) {
    const out = [];
    dataTypes.forEach((t) => {
      const bats = new Map((FP.dataStore.batches(store, t) || []).map((b) => [b.id, b]));
      FP.dataStore.records(store, t).forEach((rec) => Object.entries(rec.metrics || {}).forEach(([k, c]) => {
        if (!c || c.source !== 'quarantined') return;
        const b = bats.get(rec.provenance && rec.provenance.batchId) || {};
        out.push({ dataType: t, date: rec.date, channel: rec.channel, field: k, rawValue: c.raw, parsedValue: c.parsedValue, rule: c.rule,
          action: 'quarantine_cell', fileName: (rec.provenance && rec.provenance.fileName) || b.fileName || null, row: rec.provenance ? rec.provenance.row : null,
          importedAt: b.importedAt || null, why: c.note || '' });
      }));
    });
    return out;
  }

  FP.qualityRules = { RULES, catalog, actionOf, applyQuarantine, quarantineList };
})(typeof window !== 'undefined' ? window : globalThis);
