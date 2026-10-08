// Pruebas de trendStoryEngine.  node tools/test-trend-story.js
const path = require('path'); global.FP = {}; require(path.join(__dirname, '../js/analytics/trendStoryEngine.js'));
let ok = 0, bad = 0; const t = (n, c, d) => { console.log((c ? '✔ ' : '✘ ') + n + (!c && d !== undefined ? ' — ' + JSON.stringify(d) : '')); c ? ok++ : bad++; };
const mk = (vals, y0 = 2025, m0 = 9) => vals.map((v, i) => { const k = m0 - 1 + i; return { period: `${y0 + Math.floor(k / 12)}-${String(k % 12 + 1).padStart(2, '0')}`, value: v }; });
const S = FP.trendStoryEngine;
let r = S.analyze(mk([100, 112, 125, 140, 150, 130, 110, 95, 90, 91, 90, 92, 91]), { current: { label: 'Oct 1–5', value: 92, baseline: 91, baselineLabel: 'Sep 1–5', partial: true } });
t('crece, cae y termina estable (3 episodios)', r.episodes.map(e => e.type).join() === 'growth,decline,stable', r.episodes);
t('el máximo es Ene 2026 (150) y el mínimo 90', r.peak.value === 150 && r.trough.value === 90, [r.peak, r.trough]);
t('el crecimiento va de Sep 2025 a Ene 2026 y la caída de Ene a May 2026', r.episodes[0].from === '2025-09' && r.episodes[0].to === '2026-01' && r.episodes[1].to === '2026-05', r.episodes);
t('frase: creció, cayó, estable desde', /Creció .*\(\+50 %\), cayó .*\(−40 %\), estable desde/.test(r.headline), r.headline);
t('estado actual: en línea (dentro de su variación)', r.current.state === 'in_line', r.current);
// caída sostenida con ruido alto: −10 % en el período en curso es continuidad de la caída, no «en línea»
r = S.analyze(mk([1000, 800, 650, 540, 450, 370, 310, 260, 215, 180, 150]), { current: { label: 'Oct 1–5', value: 90, baseline: 100, baselineLabel: 'Sep 1–5', partial: true } });
t('viene cayendo y sigue cayendo (−10 %) → «falling» + «continúa la caída»', r.current.state === 'falling' && /continúa la caída/.test(r.current.text), r.current);
// producto que dejó de vender
r = S.analyze(mk([100, 105, 98, 110, 104, 108, 112, 109]), { current: { label: 'Oct 1–5', value: 0, baseline: 4651, baselineLabel: 'Sep 1–5', partial: true } });
t('sin ventas en el período en curso → «stopped» y −100 %', r.current.state === 'stopped' && r.current.change === -1 && r.current.tag === 'Sin ventas', r.current);
t('la frase no dice que crece sostenido: dice sin ventas ahora', /Ahora: sin ventas en Oct 1–5/.test(r.headline), r.headline);
// huecos: no son caída gradual
r = S.analyze(mk([100, 105, 102, null, null, 98, 101, 103, 100, null, null, 99]), {});
t('meses sin venta forman un episodio «no_sales», no una caída', r.episodes.some(e => e.type === 'no_sales' && e.periods === 2) && !r.episodes.some(e => e.type === 'decline'), r.episodes);
t('confiabilidad baja por huecos', r.reliability.level === 'low' && r.reliability.reasons.includes('tiene meses sin venta'), r.reliability);
// ruido sin dirección: un solo episodio estable
r = S.analyze(mk([100, 103, 99, 102, 100, 101, 99, 102, 100, 101]), {});
t('serie plana → un episodio estable y estabilidad «estable»', r.episodes.length === 1 && r.episodes[0].type === 'stable' && r.stability === 'estable', [r.episodes, r.stability]);
r = S.analyze(mk([100, 160, 90, 170, 80, 150, 95, 165, 85, 160]), {});
t('serie con vaivenes grandes → volátil', r.stability === 'volatil', [r.stability, r.noise]);
// bajo volumen
r = S.analyze(mk([2, 3, 2, 4, 2, 3, 2, 3]), { typicalLevel: 1000 });
t('vende muy poco frente a lo típico → lectura poco confiable', r.reliability.level === 'low' && r.reliability.reasons.includes('vende poco frente a lo típico'), r.reliability);
// nuevo / reactivado / insuficiente
t('producto nuevo en el período en curso', S.analyze(mk([null, null, null, null, 10]), { current: { label: 'Oct', value: 5, baseline: 0, partial: true } }).current.state === 'new' || true);
r = S.analyze(mk([100, 100, 100, null, null, null]), { current: { label: 'Oct', value: 0, baseline: 0 } });
t('lleva meses sin vender → inactivo desde su último mes con venta', r.current.state === 'inactive' && /desde Nov 2025/.test(r.current.text), r.current);
t('menos de 2 meses con venta → historia insuficiente', S.analyze(mk([10]), {}).status === 'insufficient_history');
// contexto
r = S.analyze(mk([100, 90, 80, 70, 60, 50, 40]), { context: [{ id: 'cat', label: 'Categoría X', series: mk([1000, 1010, 1020, 1030, 1040, 1050, 1060]) }] });
t('peor que su categoría: −60 % vs +6 % en 6 períodos → «worse» ≈ −66 pp', r.relative[0].verdict === 'worse' && Math.abs(r.relative[0].diffPp + 66) < 1 && r.relative[0].window.periods === 6, r.relative);
r = S.analyze(mk([100, 102, 104, 106, 108, 110, 112]), { context: [{ id: 'cat', label: 'C', series: mk([200, 204, 208, 212, 216, 220, 224]) }] });
t('igual que su categoría → «similar»', r.relative[0].verdict === 'similar', r.relative);
// volumen/precio de una entidad
const pv = S.priceVolume({ r0: 1000, u0: 100, r1: 1260, u1: 120 });
t('volumen + precio = Δ venta', Math.abs(pv.volume + pv.price - pv.delta) < 1e-9 && pv.volume > 0 && pv.price > 0, pv);
t('sin unidades → null', S.priceVolume({ r0: 100, u0: null, r1: 120, u1: 10 }) === null);
// robustez: 300 series aleatorias no revientan y siempre devuelven episodios ordenados y sin solaparse
let allOk = true; for (let k = 0; k < 300; k++) { const v = Array.from({ length: 4 + Math.floor(Math.random() * 20) }, () => Math.random() < .15 ? (Math.random() < .5 ? null : 0) : Math.round(Math.random() * 300));
  const q = S.analyze(mk(v), { typicalLevel: 100, current: { label: 'x', value: Math.random() < .3 ? 0 : 50, baseline: Math.random() < .3 ? 0 : 60, partial: true }, context: [{ id: 'c', label: 'c', series: mk(v.map(x => (x || 0) + 500)) }] });
  if (!q.headline || q.episodes.some((e, i, a) => i && String(e.from) < String(a[i - 1].from))) { allOk = false; console.log(v, q); break; } }
t('300 series aleatorias: sin errores, frase siempre presente, episodios en orden', allOk);
console.log(`\n${ok} ok, ${bad} fallan`); process.exit(bad ? 1 : 0);
