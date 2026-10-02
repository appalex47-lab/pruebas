/**
 * health.js — Fase A · Data Health: un puntaje 0–100 por colección que SIEMPRE se puede desglosar.
 * Cada componente dice cuánto vale, cuántos casos lo bajaron y por qué. El total es el promedio de los componentes que aplican
 * (no hay pesos escondidos). Se calcula desde lo ya guardado (registros, celdas en cuarentena y lotes); no modifica nada.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const C = () => FP.config;
  const pct = (bad, total) => (total > 0 ? Math.max(0, Math.round(100 * (1 - bad / total))) : null);

  function collection(store, dataType) {
    const recs = FP.dataStore.records(store, dataType);
    const bats = FP.dataStore.batches(store, dataType);
    if (!recs.length && !bats.length) return { dataType, empty: true, score: null, components: [] };
    const s = FP.coverage.summarizeCollection(store, dataType);
    const issues = bats.flatMap((b) => b.issues || []).filter((i) => i.rowImported !== false);
    const count = (types) => new Set(issues.filter((i) => types.includes(i.type)).map((i) => `${i.batchId}:${i.row}`)).size;
    const metricKeys = C().metricKeys;
    const required = (C().dataTypes[dataType].required || []).filter((k) => metricKeys.includes(k));
    let reqCells = 0, reqMissing = 0, cells = 0, badType = 0, qCells = 0;
    recs.forEach((r) => {
      required.forEach((k) => { reqCells++; const c = r.metrics && r.metrics[k]; if (!c || c.source === 'missing') reqMissing++; });
      Object.values(r.metrics || {}).forEach((c) => {
        if (!c || (c.source !== 'observed' && c.source !== 'quarantined')) return;
        cells++;
        if (c.source === 'quarantined') { qCells++; if (/^INVALID_/.test(c.rule || '')) badType++; }
      });
    });
    const malformed = count(['MALFORMED_ROW']);
    const inconsistent = count(['MATHEMATICAL_INCONSISTENCY', 'NEGATIVE_REVENUE', 'NEGATIVE_ORDERS', 'NEGATIVE_TRAFFIC']);
    const future = count(['FUTURE_DATE']);
    const cov = s.coverage || {};
    const rangeDays = cov.expectedDays || cov.days || 0;
    const comps = [
      { key: 'structure', label: 'Estructura', score: pct(malformed + s.rejected, s.rowsRead),
        detail: `${s.rejected} filas rechazadas (sin fecha o canal válidos) y ${malformed} con columnas de más o de menos, de ${s.rowsRead} leídas.` },
      { key: 'completeness', label: 'Completitud', score: pct(reqMissing, reqCells),
        detail: reqCells ? `${reqMissing} de ${reqCells} celdas obligatorias vacías (${required.map((k) => C().metrics[k].label).join(', ')}).` : 'Sin métricas obligatorias en este tipo de archivo.' },
      { key: 'types', label: 'Tipos', score: pct(badType, cells), detail: `${badType} celdas no numéricas en cuarentena, de ${cells} celdas de métricas.` },
      { key: 'consistency', label: 'Consistencia', score: pct(inconsistent, recs.length), detail: `${inconsistent} registros con negativos o métricas incompatibles (por ejemplo, más pedidos que tráfico), de ${recs.length}.` },
      dataType === 'segments' || !rangeDays ? null : { key: 'temporal', label: 'Temporalidad', score: pct((s.datesWithMissingChannels || 0) + (s.missingDates || 0) + future, rangeDays),
        detail: `${s.datesWithMissingChannels || 0} fechas con algún canal faltante, ${s.missingDates || 0} sin ningún registro y ${future} fechas futuras, en ${rangeDays} días.` },
      { key: 'duplicates', label: 'Duplicados', score: pct(s.duplicateRecords || 0, recs.length), detail: `${s.duplicateRecords || 0} registros repetidos (misma fecha y canal), de ${recs.length}.` },
      { key: 'valid', label: 'Registros válidos', score: pct(s.quarantined + s.error, recs.length),
        detail: `${s.quarantined} registros con un valor en cuarentena y ${s.error} con errores, de ${recs.length} importados.` }
    ].filter(Boolean);
    const used = comps.filter((c) => c.score !== null);
    const score = used.length ? Math.round(used.reduce((a, c) => a + c.score, 0) / used.length) : null;
    return { dataType, label: C().dataTypes[dataType].label, empty: false, score, components: comps, quarantinedCells: qCells, quarantinedRecords: s.quarantined };
  }

  function overview(store) {
    const list = C().dataTypeIds.map((t) => collection(store, t)).filter((x) => !x.empty);
    const scored = list.filter((x) => x.score !== null);
    return { score: scored.length ? Math.round(scored.reduce((a, x) => a + x.score, 0) / scored.length) : null, collections: list };
  }

  FP.dataHealth = { collection, overview };
})(typeof window !== 'undefined' ? window : globalThis);
