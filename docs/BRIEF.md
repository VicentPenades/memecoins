<!--
  MOLDE DE BRIEF — plantilla en blanco.
  Cómo se usa:
    1. Copia este archivo a `docs/BRIEF.md`.
    2. Rellénalo en prosa (describe QUÉ quieres y CÓMO debe funcionar; no hace falta detalle técnico).
    3. Dime: "arranca desde el BRIEF".
  El stack y las reglas del proyecto son fijos (ver `.claude/rules/`), así que no se preguntan aquí.
-->

# Brief — <LAUNCH MEMECOIN>

## 1. Qué es

El proyecto es para lanzar memecoins.
En un primer paso se puede crear úncamente para pumpfun.
Características que me gustaría que tuviese el lanzamiento:

- Definición de las diferentes partes e un lanzamiento: nombre, sticker...
- Si es posible programar lanzamiento a una hora
- Si es posible definir posibles compras adiconales o envios del token a otras monedores en el primer bloque o bloques sucesivos.
- Más adelante. Creación de web y twitter.

Por otro lado, me gustaría que cada moneda lanzada se guardase con las características de lanzamiento para poder analizar como es mejor lanzar la moneda para que tenga exito.

## 2. Raíces reutilizables

Marca las que necesitas ([x] = sí):

- [x] `auth` — login / registro / sesión / verify-email / reset
- [ ] `general-settings/billing` — suscripciones / facturación
- [ ] `general-settings/brands` — marcas (siempre presente)

## 3. Módulos de dominio (`v0/`)

El corazón del brief. Copia el bloque de abajo una vez por cada módulo.
Descríbelo en lenguaje natural: qué gestiona, cómo lo usa el usuario, qué acciones
hay y qué reglas importantes tiene. No hace falta que definas campos ni endpoints:
de eso me encargo yo (te preguntaré lo que falte).

---

### Módulo: <launcher>

**Qué hace y cómo quiero que funcione:**

Este módulo tiene un formulario principal con las características para lanzar una memecoin.
Principalmente en pumpfun.
Puede hacerse de otras formas?

En un futuro me gustaría que se pudiese crear twitter, telegram y web.

La moneda se puede guardar en borrador para lanzar en otro momento.

---

<!-- Copia el bloque "### Módulo:" tantas veces como módulos tengas. -->

## 4. Flujos clave (opcional)

<!-- Recorridos de usuario end-to-end que crucen varios módulos.
     Ej.: "El usuario se registra → crea una marca → lanza su primera campaña → ve resultados." -->

## 5. Fuera de alcance (recomendado)

<!-- Qué NO hacer en esta primera versión. Ayuda a no sobre-construir (YAGNI). -->

## 6. Notas sueltas (opcional)

<!-- Cualquier cosa: integraciones externas, idiomas (i18n), referencias visuales,
     restricciones técnicas, enlaces, etc. -->

---

### Módulo: <list>

**Qué hace y cómo quiero que funcione:**

Historico de monedas. Tanto las lanzadas como las guardadas en borrador.

Tendrá un buscador superior con un input field y un filtro.

---

<!-- Copia el bloque "### Módulo:" tantas veces como módulos tengas. -->

## 4. Flujos clave (opcional)

<!-- Recorridos de usuario end-to-end que crucen varios módulos.
     Ej.: "El usuario se registra → crea una marca → lanza su primera campaña → ve resultados." -->

## 5. Fuera de alcance (recomendado)

<!-- Qué NO hacer en esta primera versión. Ayuda a no sobre-construir (YAGNI). -->

## 6. Notas sueltas (opcional)

<!-- Cualquier cosa: integraciones externas, idiomas (i18n), referencias visuales,
     restricciones técnicas, enlaces, etc. -->
