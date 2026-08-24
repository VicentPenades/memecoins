/**
 * Classes extending this base class should try to call its methods following these rules:
 * | axios/fetch | method name        | input                       | output           |
 * |-------------|--------------------|-----------------------------|------------------|
 * | `get`       | `retrieve`         |                             | `T` or `T[]`     |
 * |             | `find`             | `id`                        | `T`              |
 * |             | `search`           | `params`                    | `T[]`            |
 * | `post`      | `create`           | `T`, `void` or `params`     | `T` or `boolean` |
 * |             | `create[Resource]` | `T`, `void` or `params`     | `T` or `boolean` |
 * | `put`       | `update`           | `T` and/or `id`             | `T` or `boolean` |
 * | `patch`     | `updatePartial`    | `Partial<T>` and `fields[]` | `boolean`        |
 * | `delete`    | `destroy`          | `id`, `void` or `params`    | `boolean`        |
 *
 * When creating specific resources under a domain, use the 'create[Resource]' method name.
 * Methods for specific actions should be called following the endpoint action name.
 */

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
