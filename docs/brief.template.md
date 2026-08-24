<!--
  MOLDE DE BRIEF — plantilla en blanco.
  Cómo se usa:
    1. Copia este archivo a `docs/BRIEF.md`.
    2. Rellénalo en prosa (describe QUÉ quieres y CÓMO debe funcionar; no hace falta detalle técnico).
    3. Dime: "arranca desde el BRIEF".
  El stack y las reglas del proyecto son fijos (ver `.claude/rules/`), así que no se preguntan aquí.
-->

# Brief — <NOMBRE DEL PROYECTO>

## 1. Qué es

<!-- 1-2 frases: qué es el proyecto y para quién. -->



## 2. Raíces reutilizables

Marca las que necesitas ([x] = sí):

- [ ] `auth` — login / registro / sesión / verify-email / reset
- [ ] `general-settings/billing` — suscripciones / facturación
- [x] `general-settings/brands` — marcas (siempre presente)

## 3. Módulos de dominio (`v0/`)

El corazón del brief. Copia el bloque de abajo una vez por cada módulo.
Descríbelo en lenguaje natural: qué gestiona, cómo lo usa el usuario, qué acciones
hay y qué reglas importantes tiene. No hace falta que definas campos ni endpoints:
de eso me encargo yo (te preguntaré lo que falte).

---

### Módulo: <nombre-en-kebab-case>

**Qué hace y cómo quiero que funcione:**

<!-- Descripción libre. Ej.: "Gestiona las campañas. El usuario crea una campaña con
     nombre y fechas, la puede activar/pausar, y ve un listado con su estado..." -->



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


