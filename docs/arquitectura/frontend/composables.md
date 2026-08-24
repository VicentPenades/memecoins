# Composable / Service — Estado y lógica del módulo

El **composable** (`use{Modulo}Service.ts`) es el núcleo del módulo: reúne el **estado**, las
**computadas** y los **servicios** (las llamadas al repository que mutan ese estado). Cada llamada
al backend produce un cambio de estado, por eso estado y servicios viven juntos. Aquí **no** hay
presentación ni `$fetch` directo.

> Para la visión general de capas ver [`index.md`](./index.md); para la capa HTTP que consume ver
> [`repositories.md`](./repositories.md).

---

## Anatomía de un composable

- Estado con **`useState`** (SSR-safe), con key en kebab-case y prefijo de módulo
  (`"keywords"`, `"keywords-loading"`).
- Expón el estado como **`readonly(...)`** para evitar mutaciones desde fuera.
- **Aquí se capturan los errores**: `try/catch` → `console.error("Error …:", err)` → `throw err`.
- Puede **componer otros composables** (p. ej. leer la marca activa de `useBrandService`).
- Solo estado, computadas y servicios: nada de utilidades sin estado (eso va en `utils/`).

```ts
// app/pages/(config)/settings/composables/useKeywordsService.ts
import { keywordsRepository } from "../repositories/keywords.repository";
import type { Keyword, NewKeyword } from "../types/settings.types";
import { useBrandService } from "~/app/pages/(config)/brands/composables/useBrandService";

export const useKeywordsService = () => {
  const keywords = useState<Keyword[]>("keywords", () => []);
  const loading = useState<boolean>("keywords-loading", () => false);
  const { activeBrandId } = useBrandService();

  const fetchKeywords = async () => {
    // Sin marca activa, vaciamos la lista y salimos
    if (activeBrandId.value === null) {
      keywords.value = [];
      return;
    }
    loading.value = true;
    try {
      keywords.value = await keywordsRepository.getAll(activeBrandId.value);
    } catch (err) {
      console.error("Error cargando keywords:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createKeyword = async (data: NewKeyword) => {
    if (activeBrandId.value === null) return;
    try {
      const created = await keywordsRepository.create(
        activeBrandId.value,
        data,
      );
      keywords.value = [created, ...keywords.value];
      return created;
    } catch (err) {
      console.error("Error creando keyword:", err);
      throw err;
    }
  };

  const deleteKeyword = async (id: number) => {
    try {
      await keywordsRepository.delete(id);
      keywords.value = keywords.value.filter((k) => k.id !== id);
    } catch (err) {
      console.error("Error eliminando keyword:", err);
      throw err;
    }
  };

  return {
    keywords: readonly(keywords),
    loading: readonly(loading),
    fetchKeywords,
    createKeyword,
    deleteKeyword,
  };
};
```

---

## Estado optimista

Tras una mutación con éxito, se actualiza el estado local en memoria en lugar de re-hacer el
`fetch`: se antepone el creado (`[created, ...keywords.value]`), se filtra el borrado, o se
reemplaza el índice en un update. Así la UI reacciona al instante sin ida y vuelta extra.

---

## Qué NO hace un composable

- ❌ Renderizar UI ni conocer componentes.
- ❌ Llamar a `$fetch`/la API directamente → siempre vía el repository.
- ❌ Exponer el estado mutable → devuélvelo con `readonly(...)`.
- ❌ Alojar helpers sin estado → van en `utils/` del módulo.

---

## Composables globales

Los composables reutilizables por varios módulos viven en `app/composables/` (p. ej.
`useDevMode`). Los específicos de un módulo viven en su carpeta `composables/`.

---

## Convenciones transversales

| Regla       | Detalle                                                                  |
| ----------- | ------------------------------------------------------------------------ |
| Nombre      | `use{Modulo}Service.ts` (`useKeywordsService`)                           |
| Estado      | `useState` con key kebab-case + prefijo de módulo (`"keywords-loading"`) |
| Exposición  | Estado como `readonly(...)`; servicios como funciones                    |
| Errores     | `try/catch` → `console.error("Error …:", err)` → `throw err`             |
| Composición | Puede usar otros composables (no otros repositories)                     |
| Contenido   | Solo estado, computadas y servicios; nada de UI ni utilidades sin estado |
| Ubicación   | `composables/` del módulo; los globales en `app/composables/`            |
