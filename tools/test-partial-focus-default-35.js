const fs = require('fs'), vm = require('vm');
const ctx = { console, globalThis: null };
ctx.globalThis = ctx;
ctx.FP = { config: { calendar: {
  fortnightSplitDay: 15,
  dayNames: ['L','M','X','J','V','S','D'],
  dayNamesEs: ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'],
  monthNamesEs: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
} } };
vm.createContext(ctx);
for (const f of ['js/calendar/calendar.js','js/analytics/temporalEngine.js']) {
  vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
}
const T = ctx.FP.temporalEngine;
let passed = 0;
function t(name, ok, details='') { if (!ok) throw new Error(`FAIL ${name}${details ? `: ${details}` : ''}`); passed++; console.log(`PASS ${name}`); }
const opts = T.options('2026-01-01','2026-10-05','month',24);
const latest = opts.at(-1);
t('último período disponible es octubre 2026', latest?.key === '2026-10');
t('octubre 2026 está marcado parcial', latest?.partial === true);
const focus = T.focusRange('month','2026-10','2026-10-05');
const comps = T.comparisonRanges(focus,'month','2026-10-05');
const mom = comps.find(x=>x.id==='mom')?.range;
const yoy = comps.find(x=>x.id==='yoy')?.range;
t('MoM exacto 1–5', mom?.from==='2026-09-01' && mom?.to==='2026-09-05', JSON.stringify(mom));
t('YoY exacto 1–5', yoy?.from==='2025-10-01' && yoy?.to==='2025-10-05' && yoy?.key==='2025-10', JSON.stringify(yoy));
console.log(`${passed}/4 PASS`);
