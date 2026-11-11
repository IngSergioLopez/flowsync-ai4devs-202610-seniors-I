---
name: capability-tests
description: Escribe tests functional del backend para un requisito de una capability, basados en su spec viva (openspec/specs/<capability>/spec.md), aislados de los demás módulos y siguiendo principios de buen código (SOLID, SoC, cohesión/acoplamiento, DRY, KISS, YAGNI). Usar cuando se pidan tests de una spec, un requisito o sus scenarios. Argumentos: <capability> ["<requisito>"].
---

# Tests de una capability, desde su spec y sin dependencias entre módulos

Argumentos: `<capability>` (carpeta en `openspec/specs/`) y, opcional, `"<requisito>"` (título exacto). Si falta el requisito, lista los de la spec y pregunta cuál: no cubras la capability entera.

**La spec es la fuente de verdad, no el código.** Los tests afirman lo que dicen los scenarios. El código solo se lee para saber cómo invocar los endpoints y para explicar un rojo, nunca para decidir qué se espera.

## Principios que rigen los tests

| Principio | Cómo se aplica a los tests |
|---|---|
| **SRP** (responsabilidad única) | Cada test tiene una sola razón para fallar: un scenario, una variante. |
| **DIP** (depender de abstracciones) | El test depende del contrato (la spec y el endpoint), no de detalles de implementación (clases internas, columnas, formato interno). |
| **OCP** (abierto a extensión) | Las variantes se añaden como casos de datos (tabla + bucle que genera `test(...)`), sin reescribir los tests existentes. |
| **SoC** (separación de responsabilidades) | Un fichero prueba una capability. Preparar datos (arrange), actuar (act) y comprobar (assert) son pasos distintos y visibles. La preparación no pasa por otro módulo. |
| **Alta cohesión / bajo acoplamiento** | Todo lo de un fichero sirve al mismo requisito. Ningún test depende de endpoints, ayudantes, datos o reglas de otra capability, ni del orden o el estado que deje otro test. |
| **DRY** | La preparación repetida va a un ayudante **local** del fichero. No se re-prueba lo que ya prueba la spec de otra capability: si un valor depende de una regla ajena, no se fija aquí. |
| **KISS** | Tests lineales y legibles, con valores literales. Sin abstracciones, mocks ni utilidades que el caso no exija. |
| **YAGNI** | Solo los scenarios del requisito pedido. Sin tests «por si acaso», sin ayudantes compartidos anticipados (uno compartido se crea cuando lo necesiten al menos dos módulos, y en una carpeta común, no dentro de otro módulo), sin aserciones sobre campos que el scenario no menciona salvo decisión explícita. |

DRY y bajo acoplamiento pueden chocar: **ante la duda, gana el bajo acoplamiento**. Un poco de preparación repetida es más barata que un test que se rompe por un cambio en otro módulo.

## 1. Leer la spec

1. Abre `openspec/specs/<capability>/spec.md`. Si no existe, para y dilo.
2. Localiza `### Requirement: <requisito>` y copia literalmente su texto y todos sus `#### Scenario:` (WHEN/THEN).
3. **Separa en cada THEN lo que se afirma de su propósito.** Las cláusulas «para que…», «de modo que…», «así…» explican por qué se exige algo; no son una condición observable y **no se convierten en aserción**. Ejemplo: «sus iniciales siguen llegando, *para que la interfaz pueda representarlo sin recurrir a su email*» se prueba con que lleguen las iniciales, no con de dónde salen.
4. Determina el **alcance HTTP permitido**: los endpoints que nombran los scenarios, contrastados con el fichero de rutas del backend. Una capability puede tener varios prefijos.
5. Lee los tests ya existentes de `backend/tests/functional/<capability>/` para no duplicar, y uno de otra carpeta solo como referencia de estilo, sin reutilizar nada de él.

## 2. Plan, y esperar el OK

Antes de escribir, presenta:

| Scenario (literal) | Test (nombre propuesto) | Endpoints que llama | Qué afirma |
|---|---|---|---|

Y debajo:

- **Decisiones que el scenario no fija**: valores concretos, límites, qué variantes se cubren, quién realiza la acción… Una línea cada una, marcada como decisión, no como regla.
- **Dependencias de otras specs**: todo valor que salga de una regla de otra capability. No se fija en el test: se comprueba solo lo que dice el scenario de esta capability (presencia, tipo, no vacío).
- **Propósitos descartados**: las cláusulas de propósito del paso 1.3 que no se convierten en aserción, para que el usuario lo vea.

**Espera la confirmación del usuario** antes de seguir.

## 3. Escribir los tests

- **Ubicación**: un fichero en `backend/tests/functional/<capability>/`, grupo `'<Capability> | <tema>'`, con un comentario de cabecera que cite el requisito y el path de la spec.
- **Solo endpoints de la capability**, también para preparar datos.
- **Preparación directa**: crea los datos con los modelos (imports por subpath, p. ej. `#models/*`). Si hace falta una sesión o credencial, usa el mecanismo del cliente de tests (p. ej. `.loginAs(user)` del plugin cargado en `tests/bootstrap.ts`), nunca los endpoints de otro módulo.
- **Aislamiento**: `group.each.setup(() => testUtils.db().withGlobalTransaction())`. Nunca truncate: la suite comparte la base de datos de desarrollo.
- **Sin imports de otros módulos de test** (`backend/tests/functional/<otra>/`).
- **Una aserción, una fuente**: cada aserción debe poder señalarse en un scenario de este requisito.
- **Un fallo no tapa a otro**: un test por variante, no un bucle de aserciones dentro de un test. Si se comprueban varias claves prohibidas, una aserción que las informe todas a la vez: `assert.deepEqual(Object.keys(obj).filter((k) => prohibidas.includes(k)), [])`. Ojo: `notIncludeMembers` no sirve (pasa si falta cualquiera de ellas).
- **Tipado**: el cliente de los ayudantes se tipa (`import type { ApiClient } from '@japa/api-client'`), nunca `any`, para conservar el tipado de rutas y payloads del bootstrap.
- **Determinista**: valores y fechas fijos; nada del reloj del sistema salvo que el scenario lo pida.
- **No toques nada fuera de `backend/tests/functional/<capability>/`**: ni código, ni la spec, ni tests de otros módulos.

## 4. Comprobar el alcance y ejecutar

Ejecuta y pega la salida tal cual. Sustituye `<cap>` y la regex con los prefijos permitidos.

```bash
cd backend
# 1. Llamadas HTTP fuera del alcance de la capability: debe salir vacío
grep -nE "['\`]/api/v1/" tests/functional/<cap>/*.ts | grep -vE "/api/v1/(<prefijo1>|<prefijo2>)"
# 2. Imports de otros módulos de test: debe salir vacío
grep -nE "from ['\"](#tests/functional|\.\./)" tests/functional/<cap>/*.ts
# 3. Formato y lint del fichero: deben pasar
npx prettier --check tests/functional/<cap>/
npx eslint tests/functional/<cap>/
# 4. Tipos: no debe salir ningún error de estos ficheros
npx tsc --noEmit | grep "tests/functional/<cap>/"
# 5. La suite del módulo, sola
node ace test functional --files="<cap>/"
```

Si 3 o 4 fallan, corrige (`npx prettier --write …`) y repite. Si 1 o 2 no salen vacías, corrige los tests (no el alcance) y repite. No se ejecuta la suite entera: sin dependencias entre módulos, estos tests no pueden romper otros.

**Si un test sale rojo: no arregles el código ni aflojes el test.** Se queda rojo. Explica la causa leyendo el código, marcándola como deducida.

## 5. Informe

1. Tabla **scenario → nombre exacto del test (tal como lo imprime el reporter) → ✔/✖**.
2. Resultado de la suite del módulo, con los números exactos y el mensaje de cada rojo.
3. **Visto frente a deducido**: separa lo que demostró un test (pasó o falló) de lo que se deduce leyendo el código, y marca cada cosa.
4. Las decisiones y dependencias del paso 2, como quedaron.
5. Salida de las comprobaciones 1-4.

## 6. Sincronizar la trazabilidad

Si existe una matriz de trazabilidad de ese requisito (busca el título del requisito en `docs/`), actualízala en el mismo cambio: nombres exactos de los tests, ✔/✖, números y lo que pase de deducido a visto. Una matriz que cita nombres que ya no existen es peor que no tenerla. No cambies estados ni decisiones sin consultarlo: solo lo que se deriva de la ejecución.
