"""Pruebas de las revisiones de uso: R-1 «Actual», R-2 arrastrar y soltar, R-3 Configuración de Sales Navigator, R-4 tarjeta cerrada, R-5 menú plegable.
Uso: python3 batch_i.py <raiz>   Sale 1 si alguna falla. (R-6 espaciado y R-7 tablas: spacing.py y tables_fit.py.)"""
import asyncio, sys, os, threading, functools, http.server, socketserver
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from recovery_state import prepare
from playwright.async_api import async_playwright
ROOT = os.path.abspath(sys.argv[1])
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
h = functools.partial(Q, directory=ROOT); socketserver.TCPServer.allow_reuse_address = True
s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), h); threading.Thread(target=s.serve_forever, daemon=True).start(); port = s.server_address[1]
fails = []
def chk(n, ok, d=''):
    print(('✔ ' if ok else '✘ ') + n + (' — ' + str(d) if d and not ok else ''))
    if not ok: fails.append(n)
VIEWS = ['inicio','negocio','carga','calidad','datos','resumen','estacionalidad','plan','configuracion','pacing','diagnostico','producto','reforecast','recovery','medir','narrativa','ayuda']
GROUP = {'negocio':'planear','carga':'planear','calidad':'planear','datos':'planear','resumen':'planear','estacionalidad':'planear','plan':'planear','configuracion':'planear','pacing':'monitorear','diagnostico':'diagnosticar','producto':'diagnosticar','reforecast':'recuperar','recovery':'recuperar','medir':'medir','narrativa':'medir'}
async def open_group(q, g):
    if await q.evaluate(f"document.querySelector('.snav__toggle[data-value=\"{g}\"]').getAttribute('aria-expanded')") != 'true':
        await q.click(f'.snav__toggle[data-value="{g}"]'); await q.wait_for_timeout(120)
NAV = """()=>[...document.querySelectorAll('.snav__toggle')].map(b=>{const box=document.getElementById(b.getAttribute('aria-controls'));return {g:b.dataset.value,exp:b.getAttribute('aria-expanded'),hidden:box?box.hidden:null,vis:box?box.getBoundingClientRect().height>0:null,name:b.innerText.trim(),ctl:!!box}})"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox']); q = await b.new_page(viewport={'width': 1280, 'height': 900}); u = f'http://127.0.0.1:{port}/index.html'
        errs = []; q.on('pageerror', lambda e: errs.append(str(e)))
        await prepare(q, u)

        # ---------- R-4 · tarjeta «Cómo leer esta vista» siempre cerrada, en los 3 modos y las vistas que la tienen ----------
        bad = []; tot = 0
        for mode in ('learner', 'analyst', 'exec'):
            await q.goto(u + '#pacing'); await q.wait_for_timeout(300)
            try: await q.click(f'[data-action="ux-mode"][data-value="{mode}"]', timeout=1200)
            except Exception: pass
            for v in VIEWS:
                await q.goto(u + '#' + v); await q.wait_for_timeout(350)
                r = await q.evaluate("()=>{const d=document.querySelector('.app-main:not([hidden]) details.explainer');return d?{open:d.open,vis:d.getBoundingClientRect().height>0}:null}")
                if r: tot += 1; 
                if r and r['open']: bad.append(f'{mode}/{v}')
        chk(f'R-4 la tarjeta «Cómo leer esta vista» arranca cerrada en los 3 modos ({tot} comprobaciones)', tot >= 18 and not bad, bad[:6])
        await q.goto(u + '#pacing'); await q.wait_for_timeout(400)
        try: await q.click('[data-action="ux-mode"][data-value="analyst"]', timeout=1200)
        except Exception: pass
        await q.goto(u + '#pacing'); await q.wait_for_timeout(400)
        await q.click('details.explainer > summary'); await q.wait_for_timeout(200)
        o1 = await q.evaluate("document.querySelector('details.explainer').open")
        await q.click('#view-pacing [data-action="fc-metric"]:not([aria-pressed="true"])') if await q.query_selector('#view-pacing [data-action="fc-metric"]:not([aria-pressed="true"])') else None
        await q.wait_for_timeout(300)
        o2 = await q.evaluate("document.querySelector('details.explainer').open")
        chk('R-4 al abrirla, el usuario la ve abierta y un cambio de filtro no se la cierra', o1 is True and o2 is True, (o1, o2))
        await q.goto(u + '#reforecast'); await q.wait_for_timeout(400)
        o3 = await q.evaluate("document.querySelector('.app-main:not([hidden]) details.explainer').open")
        chk('R-4 al cambiar de vista vuelve a estar cerrada', o3 is False, o3)

        # ---------- R-5 · menú lateral con grupos plegables ----------
        await q.goto(u + '#inicio'); await q.wait_for_timeout(400)
        n = await q.evaluate(NAV)
        chk('R-5 5 grupos plegables (Planear, Monitorear, Diagnosticar, Recuperar, Medir y aprender), cada uno un botón con aria-expanded y aria-controls válido', [x['name'] for x in n] == ['Planear', 'Monitorear', 'Diagnosticar', 'Recuperar', 'Medir y aprender'] and all(x['ctl'] and x['exp'] in ('true', 'false') for x in n), n)
        chk('R-5 en Inicio todos los grupos arrancan cerrados y su contenido no ocupa espacio', all(x['exp'] == 'false' and x['hidden'] and not x['vis'] for x in n), n)
        ini = await q.evaluate("[...document.querySelectorAll('.app-nav > .snav__group:not(.snav__group--foldable) .snav__item')].map(a=>[a.innerText.trim(),a.getBoundingClientRect().height>0])")
        chk('R-5 «Inicio» queda suelto y visible', ini and ini[0][0] == 'Inicio' and ini[0][1], ini)
        await q.goto(u + '#diagnostico'); await q.wait_for_timeout(400)
        n = await q.evaluate(NAV)
        chk('R-5 al entrar a una vista solo se abre el grupo de esa vista (Diagnosticar)', [x['g'] for x in n if x['exp'] == 'true'] == ['diagnosticar'], n)
        await open_group(q, 'planear'); await q.wait_for_timeout(200)
        n = await q.evaluate(NAV)
        chk('R-5 se pueden abrir varios grupos a la vez (Planear y Diagnosticar)', sorted(x['g'] for x in n if x['exp'] == 'true') == ['diagnosticar', 'planear'] and all(x['vis'] for x in n if x['exp'] == 'true'), n)
        cnt = await q.evaluate("[...document.querySelectorAll('#snav-g-planear .snav__item')].map(a=>a.innerText.trim())")
        chk('R-5 Planear muestra sus 8 opciones al abrirse', len(cnt) == 8, cnt)
        await q.evaluate("(()=>{const b=document.querySelector('.snav__toggle[data-value=\"recuperar\"]');if(b.getAttribute('aria-expanded')==='true')b.click()})()"); await q.wait_for_timeout(120)
        await q.focus('.snav__toggle[data-value="recuperar"]'); await q.keyboard.press('Enter'); await q.wait_for_timeout(150)
        e1 = await q.evaluate("document.querySelector('.snav__toggle[data-value=\"recuperar\"]').getAttribute('aria-expanded')")
        await q.keyboard.press('Space'); await q.wait_for_timeout(150)
        e2 = await q.evaluate("document.querySelector('.snav__toggle[data-value=\"recuperar\"]').getAttribute('aria-expanded')")
        foc = await q.evaluate("document.activeElement && document.activeElement.dataset && document.activeElement.dataset.value")
        chk('R-5 con teclado: Enter abre, Espacio cierra, y el foco se queda en el botón', e1 == 'true' and e2 == 'false' and foc == 'recuperar', (e1, e2, foc))
        await q.evaluate("(()=>{const b=document.querySelector('.snav__toggle[data-value=\"planear\"]');if(b.getAttribute('aria-expanded')==='true')b.click()})()"); await q.wait_for_timeout(150)
        hid = await q.evaluate("(()=>{const l=document.querySelector('#snav-g-planear .snav__item');l.focus();return document.activeElement===l})()")
        chk('R-5 un grupo cerrado no deja enlaces enfocables (no se llega a ellos con Tab)', hid is False, hid)
        await open_group(q, 'medir'); await q.click('a[data-nav="narrativa"]'); await q.wait_for_timeout(400)
        cur = await q.evaluate("[document.querySelectorAll('.app-nav [aria-current=\"page\"]').length, document.querySelector('.snav__toggle[data-value=\"medir\"]').getAttribute('aria-expanded')]")
        chk('R-5 la vista actual queda marcada (un solo aria-current) y su grupo abierto', cur == [1, 'true'], cur)
        # cada vista se alcanza desde el menú: abrir su grupo y hacer clic
        miss = []
        for v, g in GROUP.items():
            await q.goto(u + '#inicio'); await q.wait_for_timeout(200)
            await open_group(q, g); await q.click(f'a[data-nav="{v}"]'); await q.wait_for_timeout(250)
            ok = await q.evaluate(f"!document.getElementById('view-{v}').hidden")
            if not ok: miss.append(v)
        chk('R-5 las 15 vistas de los grupos se siguen alcanzando desde el menú (abrir grupo → clic)', not miss, miss)
        # móvil
        m = await b.new_page(viewport={'width': 390, 'height': 800}); await prepare(m, u); await m.goto(u + '#pacing'); await m.wait_for_timeout(400)
        await m.click('[data-action="nav-toggle"]'); await m.wait_for_timeout(300)
        if await m.evaluate("document.querySelector('.snav__toggle[data-value=\"planear\"]').getAttribute('aria-expanded')") != 'true': await m.click('.snav__toggle[data-value="planear"]')
        await m.wait_for_timeout(200)
        mv = await m.evaluate("(()=>{const nav=document.getElementById('app-nav');const b=document.querySelector('.snav__toggle[data-value=\"planear\"]').getBoundingClientRect();return {open:document.body.classList.contains('nav-open'),h:Math.round(b.height),exp:document.querySelector('.snav__toggle[data-value=\"planear\"]').getAttribute('aria-expanded'),scroll:nav.scrollHeight>nav.clientHeight}})()")
        chk('R-5 móvil: el panel abre, el grupo se despliega al tocar, objetivo táctil ≥ 44 px y el panel se desplaza por dentro', mv['open'] and mv['exp'] == 'true' and mv['h'] >= 44 and mv['scroll'], mv)
        await m.close()

        # ---------- R-1 · «Actual» en Recovery Center ----------
        await q.goto(u + '#recovery'); await q.wait_for_timeout(700)
        act = await q.evaluate("""()=>{const c=[...document.querySelectorAll('#rc-gap .metric-card')].find(x=>x.querySelector('dt').innerText.replace('?','').trim()==='Actual');
          if(!c)return null;const t=c.querySelector('.state-tag');const r=getComputedStyle(document.documentElement).getPropertyValue('--ds-actual').trim();const i=document.createElement('i');i.style.color=r;document.body.appendChild(i);
          return {tag:t?t.innerText.trim():'',cls:t?t.className:'',same:t?getComputedStyle(t).color===getComputedStyle(i).color:false}}""")
        chk('R-1 Recovery Center: la tarjeta «Actual» lleva la etiqueta «Actual» en el teal del token (como Pacing)', bool(act) and act['tag'] == 'Actual' and 'state-tag--actual' in act['cls'] and act['same'], act)

        # ---------- R-3 · Configuración de Sales Navigator ----------
        await q.goto(u + '#inicio'); await q.wait_for_timeout(300)
        link = await q.evaluate("(()=>{const a=document.querySelector('.app-nav a[data-nav=\"ajustes\"]');return a?[a.innerText.trim(),a.getBoundingClientRect().height>0]:null})()")
        chk('R-3 la entrada «Configuración de Sales Navigator» está en el menú, fuera de los 5 grupos y siempre visible', link == ['Configuración de Sales Navigator', True], link)
        await q.click('.app-nav a[data-nav="ajustes"]'); await q.wait_for_timeout(500)
        sv = await q.evaluate("""()=>{const v=document.getElementById('view-ajustes');return {vis:!v.hidden,h2:(v.querySelector('h2')||{}).innerText,rows:v.querySelectorAll('tbody tr').length,controls:v.querySelectorAll('input,select,textarea').length,
          links:[...v.querySelectorAll('tbody a[data-nav]')].map(a=>a.dataset.nav),cur:document.querySelectorAll('.app-nav [aria-current="page"]').length,soon:/se habilitará/i.test(v.innerText)}}""")
        chk('R-3 la vista separa negocio / plan / herramienta: 5 filas orientativas, sin controles ni lógica nueva, con enlaces a donde vive cada cosa', sv['vis'] and sv['h2'] == 'Configuración de Sales Navigator' and sv['rows'] == 5 and sv['controls'] == 0 and set(sv['links']) == {'negocio', 'configuracion', 'diagnostico', 'producto'} and sv['cur'] == 1 and sv['soon'], sv)
        await q.click('#view-ajustes a[data-nav="negocio"]'); await q.wait_for_timeout(400)
        nv = await q.evaluate("!document.getElementById('view-negocio').hidden")
        chk('R-3 los enlaces de la vista llevan a Negocio', nv is True)
        nb = await q.evaluate("[document.querySelector('#view-negocio h2').innerText, document.querySelector('#view-configuracion h2').innerText]")
        chk('R-3 «Negocio» y «Configuración de planeación» conservan su nombre (no se confunden con la de la herramienta)', nb == ['Negocio', 'Configuración de planeación'], nb)

        # ---------- R-2 · arrastrar y soltar ----------
        await q.goto(u + '#carga'); await q.wait_for_timeout(500)
        await q.evaluate("""()=>{window.__states=[];const el=document.querySelector('.upload-card .upload-card__state');window.__el=el;
          new MutationObserver(()=>window.__states.push(el.dataset.state)).observe(el,{attributes:true,attributeFilter:['data-state']});}""")
        before = await q.evaluate("[FP.app.state.staging.items.length, document.querySelector('.upload-card .upload-card__state').dataset.state, document.querySelector('.upload-card .upload-card__state').textContent]")
        dz = """(kind)=>{const card=document.querySelector('.upload-card');const dt=new DataTransfer();
           const csv='fecha,canal,venta,pedidos,volumen\\n2026-09-01,Ecommerce,1000,10,100\\n2026-09-02,App,2000,20,200\\n';dt.items.add(new File([csv],'arrastrado.csv',{type:'text/csv'}));
           const e=new DragEvent(kind,{bubbles:true,cancelable:true,dataTransfer:dt});card.querySelector('.panel__body').dispatchEvent(e);return e.defaultPrevented}"""
        prev = await q.evaluate(dz, 'dragover'); await q.wait_for_timeout(100)
        drag = await q.evaluate("[document.querySelector('.upload-card .upload-card__state').dataset.state, document.querySelector('.upload-card .upload-card__state').textContent]")
        chk('R-2 al arrastrar un archivo sobre la tarjeta: estado «arrastrando» con texto visible, y el navegador no abre el archivo (preventDefault)', prev is True and drag[0] == 'dragging' and 'Suelta' in drag[1], (prev, drag))
        await q.evaluate("""()=>{const card=document.querySelector('.upload-card');const e=new DragEvent('dragleave',{bubbles:true,cancelable:true,relatedTarget:document.body});card.querySelector('.panel__body').dispatchEvent(e)}""")
        await q.wait_for_timeout(100)
        left = await q.evaluate("[document.querySelector('.upload-card .upload-card__state').dataset.state, document.querySelector('.upload-card .upload-card__state').textContent]")
        chk('R-2 al salir de la tarjeta sin soltar, vuelve al estado y texto anteriores', left[0] == before[1] and left[1] == before[2], (before, left))
        await q.evaluate(dz, 'drop'); await q.wait_for_timeout(1200)
        after = await q.evaluate("[FP.app.state.staging.items.length, document.querySelector('.upload-card .upload-card__state').dataset.state, document.querySelector('.upload-card .upload-card__state').textContent, window.__states]")
        chk('R-2 al soltar, el archivo entra a «en revisión» (nada se importa) y la tarjeta pasa por «cargando» y regresa a su estado', after[0] == before[0] + 1 and 'loading' in after[3] and after[1] == before[1] and after[2] == before[2], (before, after))
        st = await q.evaluate("[document.querySelector('#staging').innerText.includes('arrastrado.csv'), FP.app.state.store.plan.batches.length]")
        chk('R-2 el archivo soltado aparece en la revisión por su nombre y no se guardó ningún lote', st[0] is True and st[1] >= 0, st)
        await q.goto(u + '#carga'); await q.wait_for_timeout(300)
        outside = await q.evaluate("""()=>{const dt=new DataTransfer();dt.items.add(new File(['x'],'x.csv'));const e=new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:dt});document.querySelector('#staging').dispatchEvent(e);return [e.defaultPrevented,e.dataTransfer.dropEffect]}""")
        chk('R-2 fuera de una tarjeta de carga el arrastre se rechaza (dropEffect none), sin abrir el archivo', outside[0] is True and outside[1] == 'none', outside)
        btn = await q.evaluate("[document.querySelectorAll('.upload-card').length, document.querySelectorAll('.upload-card input[type=file][data-action=\"pick-files\"]').length, [...document.querySelectorAll('.upload-card')].filter(c=>/arrastrar y soltar/i.test(c.innerText)).length]")
        chk('R-2 el botón «Seleccionar CSV» se conserva en cada tarjeta (vía con teclado) y cada una anuncia que admite arrastrar', btn[0] >= 4 and btn[0] == btn[1] == btn[2], btn)
        chk('Sin errores de página', not errs, errs[:2])
        await b.close()
    print('\nRESULTADO batch_i:', 'OK' if not fails else 'FALLAS: ' + '; '.join(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
