# UX_GUIDE.md — Cómo usar Sales Navigator

La app ya calcula; esta guía explica cómo recorrerla. Todo funciona sin IA y sin backend.

## 1. El flujo

**Planea → Compara → Proyecta → Diagnostica → Simula → Actúa → Mide.**

Cadena analítica: meta → plan → actual → brecha → driver → señal → hipótesis → escenario → acción → impacto observado → aprendizaje.

## 2. Navegación

| Grupo | Para qué | Vistas |
|---|---|---|
| Inicio | ¿Qué está pasando? | Centro de control |
| Planear | Datos y meta distribuida | Carga, Calidad, Datos, Metas y motor, Estacionalidad, Plan, Configuración |
| Monitorear | ¿Cómo vamos y dónde terminaríamos? | Pacing & Forecast |
| Diagnosticar | ¿Por qué hay brecha? | ¿Por qué? Diagnóstico |
| Recuperar | ¿Qué tendría que pasar y qué podemos hacer? | Recovery & Reforecast, Recovery Center |
| Medir y aprender | ¿Qué pasó con lo que hicimos? | Medir y aprender |

Debajo del menú, la **barra de contexto** siempre dice dónde estás (migas), qué ves, qué significa, el contexto activo
(canal · periodo · comparación), avisos de calidad de datos y el **siguiente paso** con botón "Ir".

## 3. Estados: no son lo mismo

| Etiqueta | Significa |
|---|---|
| Plan | Lo que originalmente se esperaba alcanzar (congelado). |
| Actual | Lo que realmente ocurrió. |
| Forecast | Proyección de cierre con la información disponible. No es la meta. |
| Reforecast | Lo que tendría que ocurrir en los días restantes para conservar la meta. No es un pronóstico. |
| Escenario | Simulación hipotética si cambian variables. No es predicción ni garantía. |
| Observado | Resultado registrado después de una acción. |

## 4. Cómo leer un diagnóstico

1. ¿Qué tan grande es la brecha? (hecho)
2. ¿Qué variable matemática explica parte de ella? (driver: volumen, CR, AOV)
3. ¿Qué señales aparecen? (dónde ocurre; merece investigación, no demuestra causa)
4. ¿Qué hipótesis vale investigar? (posible explicación, requiere validación)
5. ¿Qué escenario puedo simular?
6. ¿Qué acción voy a medir?

## 5. Ayuda

- **?** junto a métricas y títulos: qué es, cómo se calcula, cómo leerla, qué NO significa.
- **Glosario** (desde cualquier vista, con búsqueda): venta, pedidos, volumen, CR, AOV, plan, actual, forecast,
  reforecast, gap, pacing, driver, señal, hipótesis, escenario, acción, impacto esperado, impacto observado, baseline,
  presión de recuperación y más.
- **Ayuda de esta sección** y **¿Cómo funciona?** para el panorama.

## 6. Recorrido guiado

Botón "Recorrido guiado": 10 pasos (meta → medición). Puedes avanzar, retroceder, salir y retomar donde lo dejaste.
El progreso es de navegación, no del negocio.

## 7. Modos

- **Analista** (default): todo el detalle.
- **Ejecutivo**: oculta métodos, parámetros, auditoría y detalle técnico, y avisa cuántos bloques ocultó. Nada se borra.

## 8. Filtros

Canal, periodo y comparación se conservan al moverte entre Inicio, Pacing, Reforecast, Diagnóstico y Recovery Center.
Si una vista no admite tu selección, se ajusta y te lo dice.

## Metas desde el histórico

Planear › Metas y motor › "Calcular metas desde el histórico": elige el año base, un crecimiento % (o una meta total
fija) y, si quieres, otra mezcla por canal. La propuesta llena el formulario; revisa y pulsa "Guardar metas".

## Categoría → Producto (Diagnosticar)

Dos archivos, porque la vista de ficha ocurre antes de elegir sucursal:

1. En Carga de datos, la tarjeta "Productos" tiene dos plantillas:
   - **Venta** (tu sistema de ventas): fecha, canal, SKU, estado, sucursal y tipo de entrega son obligatorios, más
     al menos una de venta, pedidos o unidades.
   - **Funnel** (GA4 por artículo): fecha, canal, SKU y al menos una de vistas de ficha, agregados al carrito,
     inicio de checkout o compras GA4. Sin estado, sucursal ni entrega: en el checkout es cuando se define.
   El tipo de archivo se detecta solo por sus columnas; puedes corregirlo. Revisa el mapeo, la vista previa, y el
   resumen (rechazadas, duplicados exactos, conflictos, multiplicidad). Si ya había datos de esos días, elige
   conservar lo guardado o reemplazar.
2. En Diagnosticar › Categoría → Producto elige periodo, referencia (periodo anterior o año anterior) y canal.
   "Ver por" alterna entre Categoría (categoría → subcategoría → producto → SKU) y Estado y sucursal
   (estado → sucursal); un filtro aparte deja ver solo domicilio o solo recolección. En SKU usa "Trazabilidad" para
   ver venta y funnel por separado, con su archivo y fila de origen.
3. Lee participación (cuánto pesa) y contribución (cuánto explica del cambio) por separado. Las tasas del embudo
   (vista → carrito → checkout → compra) y la cobertura de tracking (compras GA4 ÷ unidades reales) muestran en qué
   paso se pierde la conversión y si GA4 está registrando todo. Los patrones son señales, no causas.
4. Al ver por estado, sucursal o tipo de entrega, el CR y el funnel se muestran "No disponible": esas dimensiones se
   definen después de la vista de ficha, así que no hay pregunta que responder ahí, no un dato faltante.
5. "Pruebas de almacenamiento" verifica IndexedDB, la migración (incluida la de versión del esquema) y el volumen en
   tu navegador y tu dominio.

## Negocio (Business Setup)

Planear › **Negocio**. Describe qué tipo de negocio analizas y cómo funciona: identidad, modelo, qué vende, cómo
vende, cómo compra el cliente, si la geografía y el catálogo importan (y sus niveles), factores relevantes,
terminología y notas. Solo el nombre es obligatorio; lo recomendado se marca sin bloquear.

1. "Proponer desde la configuración actual" arma un borrador con lo que la app ya sabe. Revísalo.
2. "Guardar contexto del negocio". Los cambios se aplican al **recargar** ("Recargar y aplicar"): moneda de las
   cifras, nombre en el encabezado y terminología disponible para fases futuras.
3. El panel "Qué alimenta y qué no" muestra exactamente qué usa la app. **No cambia** canales, métricas, fórmula,
   forecast, diagnóstico, datos cargados, plan congelado ni exports.
4. "Exportar business_context.json" guarda un respaldo portable; "Importar" lo carga como borrador en otro equipo.
5. "Quitar contexto" vuelve a los valores por defecto al recargar; tus datos no se tocan.

## Geografía de productos (Diagnosticar › Categoría → Producto)

**Qué es:** ver cómo se comportan los productos según dónde se atendió el pedido: región, estado, ciudad, sucursal y
tipo de entrega. **Para qué:** detectar diferencias entre zonas o sucursales y dónde se concentra una caída o un
crecimiento. **Qué no significa:** una diferencia geográfica no demuestra por sí misma una causa.

- **Empezar por:** Categoría, Región, Estado, Ciudad, Sucursal o Tipo de entrega (solo aparecen los que tienen datos).
- **Ver ›** baja al siguiente nivel natural (región → estado → ciudad → sucursal → categoría…); **Desglosar por** permite
  elegir otro, p. ej. de un producto a sus ciudades. Las migas permiten volver a cualquier punto.
- **Filtros de geografía** (solo en esta vista): respetan la jerarquía; al elegir un estado solo aparecen sus ciudades y
  sucursales. "Quitar filtros de geografía" los limpia.
- **Dónde se concentra la variación:** señales del tipo "Producto X cayó 25 %; el 80 % se concentra en Jalisco". Son
  señales para investigar.
- **Calidad de la geografía:** avisos como sucursal en varios estados o estado en varias regiones; la app usa el valor
  más frecuente y lo dice.
- Faltante se ve "No disponible", no cero; un estado no reconocido se ve "Inválido". CR y funnel no aplican a niveles
  geográficos porque el funnel ocurre antes del checkout.
- La geografía no cambia metas, forecast, pacing ni diagnóstico general: vive solo en el análisis de productos.

## Aprender mientras usas la herramienta (Fase 9.1)

**Modo Aprendiz** (selector de modo, junto a Analista y Ejecutivo). Agrega, sin cambiar ningún cálculo:
- Una barra que muestra dónde estás dentro de la metodología (Meta → Plan → Real → Pacing → Forecast → Diagnóstico →
  Señales → Hipótesis → Recovery → Escenarios → Acción → Observado → Narrativa), qué pregunta responde la vista, para
  qué sirve, qué decisión ayuda a tomar y **¿qué hago ahora?** (el mismo siguiente paso de siempre).
- Lecciones breves ("Lo que acabas de aprender") cuando ocurre algo real: guardar el plan, cargar datos, ver el
  forecast, cambiar de método, ver señales, simular un escenario, medir una acción. Aparecen una vez y se cierran con
  "Entendido".

Cambiar de modo conserva filtros, contexto y resultados.

**Tres niveles de explicación:**
1. Siempre visible: el título del explicador y la descripción corta.
2. "¿Cómo funciona?": el flujo de la vista y, en el ícono "?", la ayuda completa con **¿qué es?, ¿para qué sirve?,
   ¿cómo funciona?, ¿cómo se calcula?, ¿qué significa?, ¿cuándo usarlo?, ¿qué NO significa? y ¿qué decisión ayuda a
   tomar?**, más conceptos relacionados.
3. "Aprender más": método, supuestos, un ejemplo ilustrativo y los límites.

**¿Por qué este número?** Junto a forecast, gap, cumplimiento, gap forecast, venta y recuperación requerida. Muestra
los pasos con las cifras reales del motor, confirma que suman la cifra mostrada y separa qué significa de qué no.

**Métodos de forecast.** En la comparación de métodos, cada uno explica qué usa, qué supone, cuándo diverge de los
demás y su límite. Ninguno se presenta como el mejor.

**Estados vacíos** dicen qué falta, por qué hace falta y a dónde ir.

## Preparación de datos (Inicio)

Barra y checklist junto a "Siguiente paso": qué porcentaje de lo necesario para que plan, pacing y forecast
funcionen ya está listo, con semáforo verde/ámbar/rojo. Mide preparación de datos, no el desempeño del negocio.
Sin venta real cargada, queda topado en 45 % aunque el resto esté completo. Cada requisito faltante tiene un
enlace directo a dónde resolverlo.

El recorrido guiado siempre empieza en Meta (enseña la metodología completa en orden, no tu estado actual); su
primer paso aclara que tu siguiente paso real, según tus propios datos, está en Inicio. La misma barra de
preparación viaja con el recorrido, arriba a la derecha en cada paso, y se actualiza en vivo si cargas datos o
guardas el plan sin cerrar el recorrido.

## Narrativa ejecutiva (Medir y aprender › Narrativa ejecutiva)

Convierte lo que ya calculó la app en una explicación: qué pasó, por qué importa, qué lo explica
matemáticamente, dónde investigar, qué hipótesis hay y qué sigue. No es un cálculo nuevo — cada frase cita el
mismo forecast, diagnóstico, producto y recuperación que ya viste en sus propias vistas, y trae su fuente
("¿Por qué dices eso?" debajo de cada afirmación).

Se narra el mismo canal, periodo y comparación que tengas elegidos en Diagnóstico; para cambiarlos, ve ahí.

Seis tipos de afirmación, nunca mezclados: **Hecho** y **Cálculo** se afirman tal cual; **Driver** es una
atribución matemática (no una causa); **Señal** indica dónde investigar (no demuestra nada); **Hipótesis**
siempre lleva lenguaje de posibilidad; **Siguiente paso** nunca es una promesa de resultado.

- **Modo Ejecutivo**: solo el resumen, el driver principal, la señal más relevante y el siguiente paso.
- **Modo Analista**: todo el detalle — el desglose completo de drivers, todas las señales e hipótesis, producto
  y recuperación.
- Si falta información para una sección (por ejemplo, no has cargado datos de producto), lo dice de forma
  explícita en vez de omitirla en silencio o inventar contenido.
- **Redactar con Cohere** (opcional) usa la misma API key de Diagnóstico y solo redacta en prosa lo que ya está
  calculado; se verifica que no agregue ninguna cifra nueva ni lenguaje de causa no soportado. Si Cohere falla o
  no está configurado, la narrativa de arriba sigue completa.
- **Exportar narrative_export.json**: la narrativa completa, con la fuente de cada afirmación, para llevarla a
  otro lado o para una futura fase de paquete de análisis.

### Producto y Recuperación ya no requieren visitarlos primero

Antes, si no habías entrado a Categoría → Producto o a Recovery Center en la misma sesión, esas dos secciones
de la narrativa decían "no disponible" aunque los datos existieran. Ya no: al entrar a Narrativa, si hay datos
de producto cargados, se calcula automáticamente (con el mismo canal y periodo que Diagnóstico como punto de
partida); si ya lo habías calculado antes con otro canal, periodo o nivel, se respeta tal cual — nunca se
fuerza a que coincida.

Por eso cada una de las dos trae, arriba de sus afirmaciones, un aviso compacto con su propio alcance —
por ejemplo *"Ecommerce · 2026-09-01 a 2026-09-30 · vs periodo anterior · Nivel: Categoría"* o
*"Total digital · Septiembre 2026 · Horizonte: Anual"* — para que nunca se confunda con el canal/periodo
principal de Diagnóstico que ancla el resto de la narrativa.

Si no hay señales geográficas que mostrar, el texto distingue si es porque no hay datos geográficos cargados,
o porque los hay pero el nivel que se está viendo no genera ese tipo de señal (por ejemplo, ya estás viendo
por Estado) — nunca dice "sin información" cuando sí existe, solo que no aplica en ese caso.

## "¿Qué hago aquí?" — presente en todas las vistas

Debajo del propósito de cada vista (ya existía) hay ahora una segunda línea corta: qué se hace en esa
pantalla en concreto. Aparece siempre, en los tres modos, sin ocupar más espacio del necesario — una frase,
no un párrafo.

En **modo Aprendiz**, la barra de aprendizaje profundiza: agrega "¿Qué hago aquí?" y, justo después, o "¿Qué
necesito?" con el primer pendiente real (con su botón "Ir") o, si ya tienes todo lo necesario, "¿Qué
obtengo?" con el resultado de esa vista — el mismo checklist que ya usa el semáforo de "Preparación de
datos", no uno nuevo. En **modo Analista** y **Ejecutivo** esa profundidad queda disponible bajo demanda, en
"Ayuda de esta sección".

"¿Qué hago aquí?" (qué se hace en esta pantalla), "¿Qué me falta?" (qué falta para poder continuar) y "¿Qué
hago ahora?" (el siguiente paso recomendado) son tres preguntas distintas y siguen viviendo en tres lugares
distintos — no se combinaron en una sola.

## Sales Navigator

La herramienta se llama **Sales Navigator**. El nombre del negocio que configuras en Negocio (Business Setup)
es independiente: Sales Navigator es la plataforma; el nombre de tu negocio es la información que analizas
con ella. Cambiar de negocio en Business Setup nunca cambia el nombre de la herramienta, y viceversa.

---

## Fase 9.x — Sistema visual (avance: etapas A–E)

- `css/design-system.css` (se carga después de `styles.css`): tokens `--ds-*` (color, tipografía, espaciado, forma), puente que re-mapea los `--c-*` antiguos, shell (header oscuro + sidebar) y componentes `.ds-card`, `.ds-badge--*`, `.ds-accordion`, `.ds-alert`, `.ds-empty`, `.ds-loading`, `.ds-metric`.
- Header: logo/nombre, buscador **placeholder deshabilitado**, campana **placeholder deshabilitada**, avatar **placeholder** (sin lógica).
- Navegación: `renderNav` ahora pinta una sidebar con los mismos grupos/vistas de `GUIDANCE.GROUPS/VIEWS`; en móvil es un menú (`nav-toggle`). Interruptor «Modo Aprendiz» reutiliza la acción `ux-mode`.
- `help-view.js`: Centro de aprendizaje (recorrido guiado, 5 tutoriales, conceptos y referencia). Solo reorganiza contenido existente de `guidanceConfig`; «Recursos adicionales» queda «Próximamente».
- Sin cambios en cálculos, motores, IndexedDB ni exports. La ecuación Venta = Volumen × CR × AOV salió del header y vive en el tutorial 03.
- Pendiente: etapas F–J (Home, módulos analíticos, responsive fino, accesibilidad, tablas/formularios).
- Etapa F (Home): orden estado → siguiente paso → preparación → resumen → avance (stepper) → convenciones (acordeón secundario). Misma lógica de `home-view.js`; solo cambia el markup y el CSS. El «Siguiente paso» de la barra de contexto se oculta en Inicio porque ahora tiene su propia card.
- Regresión Fase 9.x (etapas A–F): `tools/regression/` (Playwright/Python; compara la app original contra la nueva). Resultado: 205/205 pruebas del motor, 17/17 vistas cargan sin errores de consola, exports de Forecast, Reforecast, Diagnóstico y Narrativa idénticos (salvo marcas de tiempo), modos Aprendiz/Analista/Ejecutivo y persistencia en IndexedDB iguales. `FP.storageTests.run()` se cuelga en headless también en la app original, por lo que no pudo verificarse ahí.

---

## Ajustes posteriores (Reforecast, Pacing e Inicio)

- **Reforecast · explicación del surplus** (`js/ui/reforecast-view.js`, `js/ui/guidance/explain.js`): cuando hay surplus, la nota explica por qué la recuperación requerida (suma de lo pendiente por canal) es mayor que la brecha neta (meta − actual): requerido = brecha neta + surplus. «¿Por qué este requerimiento?» muestra el mismo desglose y su verificación lo considera. Sin cambios en el motor.
- **Pacing & Forecast · versiones por canal** (`js/ui/forecast-view.js`): «Versiones del forecast» (forecast actual, versión anterior, cambio, tabla y accuracy) sigue el canal elegido en el selector del gráfico. Cada versión sigue guardándose completa (total + canales) para que el total cuadre con la suma de sus canales.
- **Inicio · orden según estado** (`js/ui/guidance/home-view.js`, `css/design-system.css`): sin plan ni forecast → Siguiente paso y Preparación de datos, Recorrido del sistema, ¿Qué está pasando?. Con datos → Recorrido del sistema, ¿Qué está pasando?, Preparación de datos y Siguiente paso.
- **Contexto sincronizado con el selector de canal** (`js/app.js`, `render`): el resumen superior y la barra «Contexto» ahora se actualizan al cambiar el canal dentro de la vista, sin tener que cambiar de página.

---

## Fase 9.x — Etapa I-base y Etapa G (avance)

- **I-base** (`css/design-system.css`, bloque «ETAPA I-base»): foco visible global con `outline` (no lo recorta un contenedor con `overflow`), tabla común `.ds-table` (los `.table` legacy comparten reglas), botones primario/secundario/terciario/destructivo/icono (`.ds-btn*`, alias `.btn*`), campo común `.ds-field` con estados focus/disabled/error/loading, estados de carga de archivo (`data-state`: empty/dragging/loading/error/ready) y origen del dato como badge con texto (`.src`, `.src--calc`, `.src--invalid`). `app.js` agrega `scope` a los `<th>` (solo atributos).
- **Contraste (tokens, no vistas):** `tools/regression/contrast.py` encontró 6 pares bajo AA. Se corrigieron los tokens `--ds-text-muted`, `--ds-actual`, `--ds-driver`, `--ds-forecast`, `--ds-hyp` y se agregó `--ds-control-border` (≥3:1) para el borde de controles.
- **G · migrado:** Carga de datos (tarjetas con `data-state` vacío/listo/error), Calidad de datos, Datos normalizados, Estacionalidad, Plan, Configuración de planeación y Negocio (grupos como cards) usan `.ds-table` y el sistema común. Metas y motor (`resumen`) hereda botones/campos/foco.
- **Pruebas:** `tools/regression/battery.py` (T1–T10 + capturas a 1280/768/390) + `compare.py` contra la línea base (tablas, controles y texto idénticos) + `lint_design.py` + `contrast.py`.
- **Pendiente / requiere decisión:** estados «arrastrando» y «cargando» de la carga de archivos (no existe arrastrar-y-soltar ni progreso; implicaría comportamiento nuevo); separar «Configuración de Sales Navigator» de «Business Setup» (no hay preferencias propias de la app más allá de las que ya viven en Negocio y Configuración de planeación); encabezado `.ds-page-title` + `.ds-lede` por vista (depende de compactar la barra de contexto, Etapa I-final).

---

## Fase 9.x — Etapa H (avance)

- **H-1 · Pacing & Forecast** (`js/ui/pacing-view.js`, `js/ui/forecast-view.js`, bloque «ETAPA H» de `css/design-system.css`): las 6 métricas del total pasan de `dl.kpis` a `.metric-card` (valor, variación, referencia) con etiqueta de estado con texto — Plan, Actual, Forecast — y banda superior con patrón propio (continua / punteada). Los encabezados de columna Plan / Actual / Forecast llevan `data-state` (banda con el mismo patrón). El botón «?» de cada métrica se conserva porque la etiqueta sigue siendo un `dt`.
  - Transversal (afecta a todas las vistas): `.state-tag` usa ahora la paleta de `.ds-badge` (antes «Escenario» usaba un lila casi igual a Reforecast); las líneas y leyendas de gráfica leen los tokens de estado (antes «Actual» era el azul de acción y «Reforecast» un hex propio); «Aprender más» dejó de ser un `<details>` propio con CSS emulado y pasó al componente real `ds-accordion ds-accordion--plain` (ver H-8).
  - Comparación de métodos: ninguna fila se destaca; «en uso» se indica solo con el texto.
  - Pruebas: `tools/regression/batch_h.py` (estados únicos y con patrón, métricas, encabezados, métodos sin destacar), batería T1–T10 + `compare.py --allow-add pacing` (solo aparecen las palabras de las etiquetas de estado; ninguna se elimina), `lint_design.py` (ahora incluye `pacing-view` y `forecast-view`) y `contrast.py`.
- **H-2 · Reforecast** (`js/ui/reforecast-view.js`; `PV().card` compartido desde `pacing-view.js`): las 7 métricas del resumen, las de «Qué tendría que cambiar» y las de «Evolución del reforecast» pasan a `.metric-card` con etiqueta de estado (Plan · Actual · Forecast · Reforecast). «Presión de recuperación» queda **sin etiqueta de estado ni color**: es descriptiva. Encabezados Plan/Meta/Actual/Forecast/Reforecast con `data-state` (banda continua, punteada o doble). Las barras de cierre leen los tokens de estado; la barra de «escenario» ya no usa el violeta de reforecast (rayado magenta). Se conservan los textos «el plan nunca cambia» y «lo esperado es el forecast».
  - También en este lote: las métricas de «Versiones del forecast» (Pacing) pasan a `.metric-card` (Forecast) y todas las tablas de `pacing-view`, `forecast-view` y `reforecast-view` usan `ds-table`. Modificadores de rejilla por columnas: `metric-grid--3` y `metric-grid--4`.
  - Pruebas: `batch_h.py pacing,reforecast`; batería T1–T10 + `compare.py --allow-add pacing,reforecast` (solo palabras de etiquetas de estado); `lint_design.py` (incluye `reforecast-view`); `contrast.py`.
- **H-3 · Diagnóstico** (`js/ui/diagnostic-view.js`, `js/ui/guidance/diagnostic-guide.js`): la cadena **Hecho → Driver → Señal → Hipótesis** usa `.ds-badge--chain` + `ds-badge--{fact,driver,signal,hyp}` (chip rectangular con borde izquierdo grueso, distinto de la píldora de los estados) en la cadena de controles, en los títulos de cada sección (`stage()`) y en los pasos 1–4 de «¿Por qué estamos…?» (`why-steps__n--*`). El resultado usa `.metric-card` con la etiqueta de estado de lo que se compara (Actual/Plan/Forecast/Reforecast según la comparación). Las contribuciones siguen mostrando signo **y** texto («Contribución negativa» / «Offset positivo»). Las barras del waterfall pasan de `style="left|right…;width…"` a clase de lado + solo el ancho dinámico; su geometría es idéntica (`geom.py`).
  - Pruebas: `batch_h.py diagnostico`, `geom.py` (barras idénticas), batería T1–T10 + `compare.py --allow-add diagnostico` (solo aparecen «Actual» y «Plan»), `lint_design.py` (incluye `diagnostic-view`), `contrast.py`.
- **H-4 · Categoría → Producto** (`js/ui/product-view.js`; `PV().card` admite un 5.º parámetro `extra` para el badge de estado del dato): las 9 métricas (6 + 3 del funnel) pasan a `.metric-card` conservando su estado de dato (Disponible / Parcial / Faltante…) como badge con texto; todas las tablas, incluida la revisión previa en Carga de datos, usan `ds-table`. La **geografía y operación** queda como un bloque propio (`fieldset.geo-filters`, fondo `surface-2`, borde y radio de tokens, `min-width: 0`): antes solo tenía el borde por defecto del navegador. La arquitectura Negocio → canal → categoría → … → SKU, la ruta de migas y «Empezar por» no cambian.
  - Pruebas: nuevo `tools/regression/products_snapshot.py` + `compare_products.py` cargan los archivos de producto generados (venta y funnel, esperando el guardado real) y comparan la vista con datos en 3 estados (raíz, drill, trazabilidad): tablas idénticas, controles idénticos, texto sin palabras eliminadas, export idéntico, sin scroll horizontal a 1280/768/390, sin controles sin nombre. Sondas P1–P6 (métricas, `ds-table`, bloque de geografía con tokens, geografía solo dentro de Producto, estado de cada grupo con texto, arquitectura).
  - Se normaliza en las instantáneas el ruido no funcional: marcas de tiempo, IDs de lote aleatorios (`pbat-…`) y milisegundos de cálculo. Se verificó campo por campo que el export de Producto es idéntico salvo eso, también entre dos corridas de la misma base.
  - Cierra la laguna anotada en el reporte de la etapa G («Producto: sin botón de export en el estado de prueba»): ahora sí hay paridad de export de Producto con datos.
- **H-5 · Recovery Center** (`js/ui/recovery-center.js`, `js/ui/scenario-view.js`, `js/ui/action-plan-view.js`). En esta app «Recovery & Reforecast» es la vista de Reforecast (H-2) y «Recovery Center» es `#view-recovery`, que reúne simulador, escenarios, plan de acción, seguimiento y cadena de trazabilidad; por eso el prompt lo cubre en un solo lote.
  - **Escenario ≠ Observado ≠ Baseline.** «Simulado» pasa de `tag tag--sim` (violeta casi idéntico al de Reforecast) a `ds-badge--scenario` (magenta, borde punteado, con texto). «Observado» usa `ds-badge--observed` / `state-tag--observed` (verde continuo). Baseline es neutro (`ds-badge--baseline`, banda gris en el encabezado). Los encabezados Baseline / Escenario / Observado del seguimiento llevan `data-state` con su banda.
  - El panel del simulador (`.panel--sim`) pierde el borde punteado por el orden de carga de los CSS; se restablece con `.panel.panel--sim` (punteado, token de escenario). Cierra el estilo que solo existía en `styles.css`.
  - Brecha (6), simulador (6) y escenarios guardados (3) pasan a `.metric-card` con etiqueta de estado; se conserva el `title` de cada cifra («pasa el cursor…») con un 6.º parámetro de `PV().card`. «Presión de recuperación» sigue sin etiqueta ni semáforo. Todas las tablas usan `ds-table`; el único `style=""` que queda es el ancho dinámico de las barras.
  - **Cadena de trazabilidad:** Brecha → Driver → Señal → Hipótesis usan los badges de evidencia; Escenario e Impacto simulado, el badge de escenario; Resultado observado, el de observado; Acción, neutro. Se conservan «simulación matemática, no predicción» y «consistente / no consistente», nunca «causó».
  - Pruebas: `recovery_state.py` (lleva la vista a un estado con escenario, acción y medición usando los botones reales; el escenario se guarda con `FP.scenarioEngine.saveScenario` porque los datos de prueba no generan hipótesis), `recovery_snapshot.py` + `compare_recovery.py` (paridad de tablas, controles, texto y export `action_plan_export.json` con datos + sondas R1–R13), batería T1–T10, `lint_design.py` (incluye las 3 vistas) y `contrast.py`.
- **H-6 · Seguimiento y aprendizaje (Medir)** (`js/ui/guidance/measure-view.js`, `js/ui/action-plan-view.js`; `FP.recoveryCenter.NODE_BADGE` se comparte con la cadena de Recovery Center): la cadena trazable de 10 nodos usa un mismo lenguaje que Recovery Center — Brecha / Driver / Señal / Hipótesis con los badges de evidencia, Acción neutro, y los nodos con estado (Plan, Forecast, Escenario, Impacto simulado, Resultado observado) conservan su etiqueta de estado con texto (Escenario: magenta punteado; Observado: verde continuo). «Impacto simulado» lleva encabezado `data-state="scenario"` y el valor va acompañado del badge «simulado» (texto en minúscula para conservar la paridad de celdas). Tablas con `ds-table`. La lectura sigue siendo «consistente / no consistente» y «no establece causalidad».
  - **Desborde corregido (existía desde la Fase 7):** con acciones y mediciones cargadas el documento se desbordaba 52 px a 390 px porque el detalle del escenario (JSON sin espacios) impedía que la columna de la cadena se encogiera. `.tree-node` usa `minmax(0, 1fr)` y `overflow-wrap: anywhere`; en móvil apila etiqueta y contenido. Afecta también a la cadena de Recovery Center.
  - Pruebas: `recovery_snapshot.py <raiz> <salida> <capturas|-> medir` + `compare_medir.py` (M1–M7: 10 nodos, badges de evidencia, estados Escenario/Observado/Plan/Forecast, escenario ≠ observado ≠ reforecast, encabezado y celdas de «Impacto simulado», `ds-table` sin `style=""`, lectura sin causalidad), batería T1–T10 + `compare.py --allow-add medir` (0 palabras nuevas), `lint_design.py` (ahora también busca en `js/ui/guidance/`) y `contrast.py`.
  - Observación abierta (no cambia datos): en los nodos con estado, la etiqueta de texto y la etiqueta de estado repiten la palabra («Plan · Plan», «Forecast · Forecast»). Ya era así; unificarlo eliminaría palabras y rompería la paridad de texto, por eso queda como decisión de diseño pendiente.
- **H-7 · Narrativa ejecutiva** (`js/ui/narrative-view.js`): la jerarquía **Hecho → Cálculo → Driver → Señal → Hipótesis → Siguiente paso** deja de usar la píldora de estado (`pill--ok/na/warning`, donde Hecho, Cálculo y Siguiente paso eran el mismo verde de «correcto») y pasa a la cadena de evidencia: chip rectangular `ds-badge--chain` con `fact` / `driver` / `signal` / `hyp` para los cuatro eslabones de evidencia, y `neutral` para **Cálculo** y **Siguiente paso** (no son evidencia ni estado). Se conservan «¿Por qué dices eso?» en cada afirmación, el resumen ejecutivo, los avisos «no es causa / hipótesis requieren validación» y que la narrativa determinística no dependa de Cohere.
  - Defecto propio hallado por la prueba N4 y corregido: `.ds-badge--neutral` (borde 1 px, definido después) pisaba el borde izquierdo de 4 px del chip de cadena; `.ds-badge.ds-badge--chain.ds-badge--neutral` lo restablece. Aplica a todos los chips neutros de cadena.
  - Pruebas: `recovery_snapshot.py <raiz> <out> <caps|-> narrativa` + `compare_narrativa.py` (N1–N6 y paridad de `narrative_export.json`, tablas, controles y texto), batería T1–T10 + `compare.py --allow-add narrativa` (0 palabras nuevas), `lint_design.py` (incluye `narrative-view`) y `contrast.py`.
- **H-8 · Transversal de la etapa H** (`js/ui/guidance/help.js`, `js/ui/narrative-view.js`, `css/design-system.css`):
  - **«Aprender más» = `ds-accordion--plain` real** en el explicador de las 17 vistas (chevron, cuerpo `ds-accordion__body`, `aria` nativo de `<details>`). En H-1 solo lo había emulado con CSS sobre `.explainer__learn`; el prompt pide el componente, así que se corrigió aquí. `.explainer__learn` queda como gancho de la separación y del borde, no como estilo propio.
  - **Estados de IA de Narrativa:** espera → `<p class="ds-loading" role="status">` (mismo texto «Redactando con Cohere…»); error → `ds-alert ds-alert--danger` con `role="alert"` (antes `note--warning`, ámbar); generado → se conserva «Redacción de Cohere» validada. La narrativa determinística sigue sin depender de Cohere.
  - Pruebas: `batch_h.py` (`H-X` acordeón; `H-narr` espera / error / generado y rojo de peligro del sistema, forzando cada estado con `FP.narrativeView.render`).
- **H-9 · Cierre de la etapa H** (`css/design-system.css`, `tools/regression/batch_h.py`):
  - **Chip suave sin borde definido:** `.chip--soft` (styles.css) solo declaraba `border-style: solid`, sin ancho ni color, y el navegador dibujaba un borde de 3 px del color del texto. En Narrativa hacía que «— Hipótesis» y «— Producto» (no disponible) destacaran más que los «✓»; el mismo chip se usa en Negocio («Recomendado»), vista de la etapa G, que también queda corregida. `.chip.chip--soft` usa 1 px `--ds-border-strong`.
  - **«Forecast no es reforecast»** ya era visible como título del explicador de Reforecast en los tres modos, junto al badge violeta «Reforecast». No se añadió texto; se agregó la prueba `H-reforecast` que lo protege (título exacto + color del badge = token `--ds-reforecast`).
  - **Acordeón plano en móvil:** ver H-8 (`.ds-accordion.ds-accordion--plain > summary`); también corrige las FAQ de Ayuda a ≤ 860 px.

---

## Revisiones de uso (post-etapa H)

Siete ajustes pedidos tras revisar la etapa H con datos reales. Pruebas nuevas: `batch_i.py` (R-1 a R-5), `spacing.py` (R-6), `tables_fit.py` (R-7) y la sonda P7 de `products_snapshot.py`.

- **R-1 · «Actual» en Recovery Center** (`recovery-center.js`): la tarjeta del real lleva la etiqueta «Actual» (teal, token `--ds-actual`) como en Pacing, no «Observado». «Observado» queda reservado al resultado medido de una acción (Medir y la cadena de trazabilidad).
- **R-2 · Arrastrar y soltar en Carga de datos** (`app.js`, `import-view.js`): cada tarjeta de carga acepta soltar un CSV. La línea de estado de la propia tarjeta (`.upload-card__state`, que ya tenía estilo) muestra «arrastrando» («Suelta el archivo aquí para revisarlo») y «cargando» («Leyendo N archivos…») y luego regresa a su texto anterior. El flujo no cambia: el archivo entra a «en revisión» y nada se importa hasta confirmar. Fuera de una tarjeta el arrastre se rechaza (`dropEffect: none`) para que el navegador no abra el archivo y salga de la app. El botón «Seleccionar CSV» se conserva (es la vía con teclado) y cada tarjeta anuncia que admite arrastrar.
- **R-3 · Configuración de Sales Navigator** (`settings-view.js`, `guidanceConfig.js`, `index.html`): vista especial (como «¿Cómo funciona?», fuera de los 5 grupos y siempre visible en el pie del menú) que separa tres cosas: negocio (Negocio), plan (Configuración de planeación) y herramienta. **Solo orienta**: una tabla de cinco filas con enlaces a donde vive hoy cada cosa (negocio, plan, modo de uso, API key de Cohere, almacenamiento), sin controles ni lógica nueva, y el aviso de que las preferencias de la herramienta se reunirán ahí. No se movió ningún control existente; qué preferencias viven en esa pantalla queda por definir con el usuario.
- **R-4 · Tarjeta «Cómo leer esta vista» cerrada** (`help.js`): arranca cerrada en los tres modos. Si el usuario la abre se queda abierta mientras siga en esa vista (un filtro vuelve a pintar la vista y no debe cerrársela); al cambiar de vista vuelve a estar cerrada. Las pruebas leen el texto con todos los `<details>` abiertos para no contar como «texto eliminado» lo que solo está plegado.
- **R-5 · Menú lateral con grupos plegables** (`navigation.js`, `design-system.css`): cada grupo (Planear, Monitorear, Diagnosticar, Recuperar, Medir y aprender) es un botón con `aria-expanded` y `aria-controls`; «Inicio» queda suelto. Al cambiar de vista queda abierto el grupo de la vista actual y los que el usuario abrió a mano; los demás se cierran. Se pueden tener varios abiertos. El estado vive solo en la sesión (no se guarda). Los enlaces de un grupo cerrado no reciben foco. En móvil el objetivo táctil es ≥ 44 px y el panel se desplaza por dentro.
- **R-6 · Ritmo vertical** (`design-system.css`): regla común de 16 px entre bloques (cabecera con botones, tarjetas de métricas, tablas, barras, filtros, desplegables) y 8 px entre un bloque y su nota o ayuda. Antes, al migrar `dl.kpis` a `.metric-grid`, se perdió el margen que tenía y varios botones, notas y tablas quedaban a 0–4 px. `spacing.py` falla si algún bloque queda a menos de 8 px de su vecino en las 17 vistas a 3 anchos (excluye cabecera de panel → cuerpo, que es intencional).
- **R-7 · Tablas sin scroll horizontal en escritorio** (`design-system.css`, `product-view.js`): (1) el contenido usa el ancho disponible en pantallas grandes (tope 1160 → 1400 px; a 1920 sobraba espacio a la derecha), (2) menos relleno horizontal en escritorio, (3) los encabezados pueden partirse en dos líneas, (4) los textos secundarios largos y los controles de las celdas se ajustan; los números no se parten. Categoría → Producto (13 columnas) usa `table--dense` (12 px, relleno 5 px, el chip «calc.» pasa debajo del valor). En móvil y tableta se mantiene el scroll interno. `tables_fit.py` mide las tablas a 1100 / 1200 / 1280 / 1440 / 1536 / 1920 px y la sonda P7 mide Producto en sus tres estados. **Límite conocido:** entre 1025 y 1099 px (contenido de ~740–810 px junto al menú fijo) las tablas de 9–11 columnas todavía se desplazan por dentro (a 1025 px: 5 tablas, la peor por 68 px); ahí no hay ancho suficiente sin quitar columnas, y se prefirió conservar todos los datos. Antes de este cambio a 1280 px se desbordaban 20 de las tablas medidas, la peor por 906 px (plan de acción de Recovery Center).

---

## Revisiones de uso · segunda tanda (Configuración y menú)

- **R-3b · Configuración de Sales Navigator con controles reales** (`settings-view.js`, `product-view.js`, `diagnostic-view.js`, `index.html`, `app.js`, `guidanceConfig.js`): la pantalla que solo orientaba ahora **reúne** lo que se configura una vez y vale para toda la app. Se mudaron con las mismas acciones (`ux-mode`, `dx-key`, `dx-remember`, `dx-model`, `storage-tests`, `storage-retry`, `bc-*`) y sin lógica nueva:
  - **Modo de uso:** selector Aprendiz / Analista / Ejecutivo. Los interruptores rápidos del menú y del encabezado de cada vista se **conservan** (mudarlos habría quitado el cambio rápido de modo mientras se aprende).
  - **Análisis con IA (Cohere):** API key, modelo y «recordar en este navegador» salen de Diagnóstico. Diagnóstico muestra «API key configurada / Sin API key» con enlace a Configuración y conserva su botón «Generar hipótesis»; Recovery Center, Narrativa y los avisos de la app apuntan a Configuración. `dx-ai` solo lee el campo de la key si está a la vista (si no, manda el estado), para no pisarlo con un campo oculto.
  - **Almacenamiento:** modo, migración, espacio usado y «Pruebas de almacenamiento» salen de Categoría → Producto (que enlaza a Configuración). El espacio usado se pide una vez al abrir Configuración (`ensureStorageEstimate`).
  - **Negocio (Business Setup):** deja de ser una página del menú y una vista aparte; sus contenedores (`bc-status`, `bc-form`, `bc-actions`) viven ahora al final de Configuración. El enlace `#negocio` sigue funcionando: abre Configuración, ajusta la dirección a `#ajustes` y lleva a la sección Negocio. Planear queda con 7 páginas.
  - **Configuración de planeación NO se movió** (decisión del usuario): sigue en Planear porque afecta al plan, no a la herramienta.
  - **Siguen en su vista, con enlace desde Configuración:** opciones de lectura de archivos (Carga de datos), parámetros del forecast (Pacing) y recorrido guiado / glosario (¿Cómo funciona?). No se movieron porque no se aprobaron expresamente.
  - Se pierde la tarjeta «Cómo leer esta vista» de Negocio (`EXPLAINERS.negocio`): la pantalla de Configuración no tiene tarjeta propia.
- **R-5b · Menú: una sola sección abierta** (`navigation.js`): elegir una sección **distinta** de la actual abre su **primera página** (Planear → Carga de datos; Monitorear → Pacing & Forecast; Diagnosticar → ¿Por qué? Diagnóstico; Recuperar → Recovery & Reforecast; Medir y aprender → Seguimiento y aprendizaje) y cierra las demás; queda desplegada solo la sección de la página actual (en Inicio, Configuración y Ayuda, ninguna). Tocar la sección en la que ya estás la pliega o despliega sin cambiar de página. Reemplaza el comportamiento «apilable» de R-5 (ya no se pueden dejar varias abiertas). En móvil el panel se queda abierto tras elegir una sección para ver sus opciones, y se cierra al elegir una página.
- Pruebas: `batch_i.py` reescrito para R-3 y R-5 (menú una sola sección, primera página, plegado de la actual, teclado, móvil; Configuración con modo, IA, almacenamiento y Negocio, alias `#negocio`, guardado de Negocio que persiste al recargar, key/modelo/recordar, Diagnóstico sin la key, Producto sin almacenamiento). `compare.py --allow-controls`, `compare_products.py --storage-moved`, `--allow-removed` en los comparadores de Recovery y Narrativa.
