# Repository — Capa HTTP del frontend

El **repository** es la única capa que habla con la API REST. No tiene estado ni lógica de
negocio: solo hace la petición HTTP y devuelve el tipo tipado. Toda la orquestación y el estado
viven en el composable que lo consume.

> Para la visión general de capas ver [`index.md`](./index.md); para la capa que lo consume ver
> [`composables.md`](./composables.md).

---

## Clase base `Repository`

Todos los repositorios extienden la clase abstracta `Repository` de `~/app/utils/repository`, que
aporta los helpers HTTP tipados (`$fetch` por debajo):

```ts
// app/utils/repository.ts
export abstract class Repository {
  protected httpGet<T>(url: string) {
    return $fetch<T>(url);
  }
  protected httpPost<T>(url: string, body: Record<string, unknown>) {
    return $fetch<T>(url, { method: "POST", body });
  }
  protected httpPut<T>(url: string, body: Record<string, unknown>) {
    return $fetch<T>(url, { method: "PUT", body });
  }
  protected httpPatch<T>(url: string, body: Record<string, unknown>) {
    return $fetch<T>(url, { method: "PATCH", body });
  }
  protected httpDelete<T = void>(url: string, body?: Record<string, unknown>) {
    return $fetch<T>(url, { method: "DELETE", ...(body ? { body } : {}) });
  }
}
```

El docblock de la clase base documenta la convención completa de nombres por verbo HTTP
(`retrieve`/`find`/`search`/`create`/`update`/`updatePartial`/`destroy`, y `create{Resource}` para
subrecursos). Úsala como catálogo de referencia.

---

## Anatomía de un repository

- Extiende `Repository` y usa sus helpers `httpGet/httpPost/httpPut/httpPatch/httpDelete`.
- **Solo HTTP**: sin estado, sin computadas, sin lógica de negocio, sin `try/catch` (los errores
  se capturan en el composable).
- Se exporta como **instancia singleton**: `export const {modulo}Repository = new {Modulo}Repository();`.
- Los tipos vienen de `../types/{modulo}.types` (que a su vez parten del schema Drizzle).

```ts
// app/pages/(config)/settings/repositories/keywords.repository.ts
import { Repository } from "~/app/utils/repository";
import type { Keyword, NewKeyword } from "../types/settings.types";

class KeywordsRepository extends Repository {
  getAll(brandId: number) {
    return this.httpGet<Keyword[]>(`/api/v0/radar/keywords?brandId=${brandId}`);
  }
  create(brandId: number, body: NewKeyword) {
    return this.httpPost<Keyword>("/api/v0/radar/keywords", { ...body, brandId });
  }
  update(id: number, body: Partial<Keyword>) {
    return this.httpPut<Keyword>(`/api/v0/radar/keywords/${id}`, body);
  }
  delete(id: number) {
    return this.httpDelete(`/api/v0/radar/keywords/${id}`);
  }
}

export const keywordsRepository = new KeywordsRepository();
```

> **Nota de nomenclatura.** Los repositorios actuales usan nombres CRUD simplificados
> (`getAll`/`create`/`update`/`delete`) que casan 1:1 con los endpoints del backend. La clase base
> ofrece un catálogo más rico (`retrieve`/`find`/`search`/…) para casos que lo necesiten; mantén la
> coherencia con los repositorios existentes del proyecto.

---

## Qué NO hace un repository

- ❌ Guardar estado (`useState`/`ref`) → eso es del composable.
- ❌ Capturar errores → los propaga; el composable hace `try/catch` + `console.error`.
- ❌ Transformar datos con lógica de negocio → como mucho, componer la URL/el body.
- ❌ Llamarse desde una vista → siempre a través del composable.

---

## Convenciones transversales

| Regla     | Detalle                                                                         |
| --------- | ------------------------------------------------------------------------------- |
| Base      | Extiende `Repository` de `~/app/utils/repository`; usa sus helpers `http*`      |
| Singleton | `export const {modulo}Repository = new {Modulo}Repository();`                   |
| Solo HTTP | Sin estado, sin negocio, sin `try/catch` (los errores se capturan arriba)       |
| Tipos     | Importados de `../types/{modulo}.types` (parten del schema Drizzle)             |
| Nombres   | CRUD (`getAll`/`create`/`update`/`delete`); `create{Resource}` para subrecursos |
| Fichero   | `{modulo}.repository.ts` dentro de `repositories/` del módulo                   |
