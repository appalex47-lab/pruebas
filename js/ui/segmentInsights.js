/**
 * segmentInsights.js — «Tráfico y conversión», parte 1 de descubrimiento (en orden de valor):
 *   1) hallazgos en frases, 2) mapa tráfico × CR (cuadrantes), 3) oportunidad estimada en pesos, 4) rankings con umbral.
 * Solo usa lo que ya calcula la vista (sesiones, pedidos y venta por segmento, periodo actual y anterior). Nada de IA: frases deterministas.
 * Reglas para no engañar: CR y AOV por razón de sumas; volumen mínimo para rankings y cuadrantes; una diferencia de CR que puede ser ruido
 * (el CR del total cae dentro del intervalo de Wilson al 95 % del segmento) se marca «no concluyente» y no genera oportunidad.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const fin = (v) => typeof v === 'number' && isFinite(v);

  /** Umbral de volumen: el mayor entre 500 sesiones y el 1 % del tráfico del periodo. */
  const MIN_SESSIONS = 500, MIN_SHARE = 0.01;

  /** Intervalo de Wilson al 95 % para una proporción. */
  function wilson(k, n, z = 1.96) {
    if (!(n > 0)) return null;
    const p = k / n, d = 1 + (z * z) / n, c = p + (z * z) / (2 * n), m = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
    return { lo: (c - m) / d, hi: (c + m) / d };
  }

  /**
   * @param {object} res  resultado de segmentsView.summarize
   * @returns {{ totals, threshold, rows: [{...row, relevant, quadrant, conclusive, opportunity}], highlights: string[], opportunities, rankings }}
   */
  function analyze(res) {
    const cur = res.rows.filter((r) => r.current && r.current.has.traffic && r.current.traffic > 0);
    const T = cur.reduce((s, r) => s + r.current.traffic, 0);
    const O = cur.reduce((s, r) => s + (r.current.has.orders ? r.current.orders : 0), 0);
    const V = cur.reduce((s, r) => s + (r.current.has.revenue ? r.current.revenue : 0), 0);
    const crT = T > 0 ? O / T : null, aovT = O > 0 ? V / O : null;
    const threshold = Math.max(MIN_SESSIONS, Math.ceil(MIN_SHARE * T));
    const relevantN = cur.filter((r) => r.current.traffic >= threshold).length;
    const avgShare = relevantN ? 1 / relevantN : 1;
    const rows = res.rows.map((r) => {
      const c = r.current;
      const out = { ...r, relevant: false, quadrant: null, conclusive: null, opportunity: null, revenuePerSession: c && c.traffic > 0 && c.has.revenue ? c.revenue / c.traffic : null };
      if (!c || !(c.traffic > 0)) return out;
      out.relevant = c.traffic >= threshold;
      if (!out.relevant) { out.quadrant = 'low'; return out; }
      if (!fin(c.cr) || !fin(crT)) return out;
      const w = wilson(c.orders, c.traffic);
      out.conclusive = !!w && (crT < w.lo || crT > w.hi);
      const highTraffic = r.trafficShare >= avgShare, highCr = c.cr >= crT;
      out.quadrant = highTraffic ? (highCr ? 'star' : 'conversion') : (highCr ? 'scale' : 'review');
      if (out.conclusive && c.cr < crT) out.opportunity = c.traffic * (crT - c.cr) * (fin(c.aov) ? c.aov : (aovT || 0));
      return out;
    });
    const rel = rows.filter((r) => r.relevant && fin(r.current.cr));
    const top = (arr, f, n = 5, asc = false) => [...arr].filter((r) => fin(f(r))).sort((a, b) => (asc ? f(a) - f(b) : f(b) - f(a))).slice(0, n);
    const rankings = {
      revenue: top(rows.filter((r) => r.current && r.current.has.revenue), (r) => r.current.revenue),
      bestCr: top(rel, (r) => r.current.cr),
      // «Menor CR» y «Menor AOV»: solo los que están por debajo del total (con pocos segmentos, el fondo no repite a los mejores)
      worstCr: top(rel.filter((r) => r.current.cr < crT), (r) => r.current.cr, 5, true),
      worstAov: top(rel.filter((r) => fin(r.current.aov) && fin(aovT) && r.current.aov < aovT), (r) => r.current.aov, 5, true)
    };
    const opportunities = top(rows.filter((r) => fin(r.opportunity) && r.opportunity > 0), (r) => r.opportunity);

    // ---------- hallazgos (frases) ----------
    const F = FP.format, money = (v) => F.currency(v, 0), pct = (v, d = 1) => `${(v * 100).toFixed(d)} %`;
    const H = [];
    if (opportunities.length) {
      const o = opportunities[0];
      H.push({ kind: 'conversion', text: `Mayor oportunidad de conversión: «${o.label}» trae ${pct(o.trafficShare)} del tráfico y convierte ${pct(o.current.cr, 2)} contra ${pct(crT, 2)} del total. Al CR del total serían ${money(o.opportunity)} más (escenario matemático, no promesa).` });
    }
    const scale = rows.filter((r) => r.quadrant === 'scale' && r.conclusive).sort((a, b) => (b.revenuePerSession || 0) - (a.revenuePerSession || 0))[0];
    if (scale) H.push({ kind: 'scale', text: `Oportunidad de escalar: «${scale.label}» convierte ${pct(scale.current.cr, 2)} (el total, ${pct(crT, 2)}) con solo ${pct(scale.trafficShare)} del tráfico.` });
    const withBase = rows.filter((r) => r.baseline && r.baseline.has.revenue && (r.relevant || (r.baseline.traffic >= threshold)));
    const drop = [...withBase].sort((a, b) => a.revenueDelta - b.revenueDelta)[0];
    const rise = [...withBase].sort((a, b) => b.revenueDelta - a.revenueDelta)[0];
    if (drop && drop.revenueDelta < 0) H.push({ kind: 'drop', text: `Mayor caída contra el periodo anterior: «${drop.label}», −${money(Math.abs(drop.revenueDelta))} en venta.` });
    if (rise && rise.revenueDelta > 0) H.push({ kind: 'rise', text: `Mayor alza contra el periodo anterior: «${rise.label}», +${money(rise.revenueDelta)} en venta.` });
    const byRev = rankings.revenue;
    if (byRev.length >= 3 && V > 0) {
      const share2 = (byRev[0].current.revenue + byRev[1].current.revenue) / V;
      H.push({ kind: 'concentration', text: `Concentración: «${byRev[0].label}» y «${byRev[1].label}» traen ${pct(share2)} de la venta${share2 >= 0.6 ? ' (muy concentrada)' : ''}.` });
    }
    const lowN = rows.filter((r) => r.quadrant === 'low').length;
    if (lowN) H.push({ kind: 'low', text: `${lowN} segmento${lowN === 1 ? '' : 's'} con menos de ${F.integer(threshold)} sesiones: se muestran como «poco volumen» y no entran a rankings ni oportunidades.` });
    return { totals: { traffic: T, orders: O, revenue: V, cr: crT, aov: aovT }, threshold, rows, highlights: H, opportunities, rankings };
  }

  const QUADRANT = {
    conversion: { label: 'Oportunidad de conversión', short: 'Convertir mejor' },
    scale: { label: 'Oportunidad de escalar', short: 'Escalar tráfico' },
    star: { label: 'Estrella', short: 'Estrella' },
    review: { label: 'Revisar o despriorizar', short: 'Revisar' },
    low: { label: 'Poco volumen', short: 'Poco volumen' }
  };

  FP.segmentInsights = { analyze, wilson, QUADRANT, MIN_SESSIONS, MIN_SHARE };
})(typeof window !== 'undefined' ? window : globalThis);
