<template>
  <div
    class="data-table overflow-hidden rounded-2xl border"
    :style="{
      backgroundColor: bgColor,
      borderColor: 'color-mix(in srgb, var(--primary) 18%, transparent)',
    }"
  >
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-left">
        <thead v-if="!hideHeader">
          <tr>
            <th
              v-for="header in headers"
              :key="header.key"
              class="whitespace-nowrap px-4 py-3 text-xs font-black uppercase tracking-wider md:px-5"
              :class="alignmentClass(header.align)"
              :style="{
                color: 'var(--text-muted)',
                width: header.width,
              }"
            >
              {{ header.title }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="loading">
            <td
              :colspan="headers.length"
              class="px-5 py-12 text-center text-sm font-bold"
              style="color: var(--text-muted)"
            >
              Loading…
            </td>
          </tr>

          <tr v-else-if="visibleItems.length === 0">
            <td
              :colspan="headers.length"
              class="px-5 py-12 text-center text-sm"
              style="color: var(--text-muted)"
            >
              <slot name="no-data">
                {{ hasSourceData ? noResultsTitle : emptyTitle }}
              </slot>
            </td>
          </tr>

          <template v-else>
            <tr
              v-for="(item, index) in visibleItems"
              :key="getRowKey(item, index)"
              class="border-t transition-colors duration-200 hover:bg-white/3"
              :style="{
                borderColor:
                  'color-mix(in srgb, var(--primary) 12%, transparent)',
              }"
            >
              <td
                v-for="header in headers"
                :key="header.key"
                class="px-4 py-5 align-middle md:px-5"
                :class="alignmentClass(header.align)"
              >
                <slot
                  :name="`item.${header.key}`"
                  :item="item"
                  :value="getValue(item, header.key)"
                  :index="index"
                >
                  {{ getValue(item, header.key) }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div
      v-if="!hideFooter && pageCount > 1"
      class="flex items-center justify-between border-t px-5 py-3 text-sm"
      :style="{
        color: 'var(--text-muted)',
        borderColor: 'color-mix(in srgb, var(--primary) 12%, transparent)',
      }"
    >
      <span>Page {{ page }} of {{ pageCount }}</span>
      <div class="flex gap-2">
        <button
          type="button"
          class="rounded-lg px-3 py-1.5 font-bold disabled:opacity-30"
          :disabled="page === 1"
          @click="page--"
        >
          Previous
        </button>
        <button
          type="button"
          class="rounded-lg px-3 py-1.5 font-bold disabled:opacity-30"
          :disabled="page === pageCount"
          @click="page++"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type DataTableHeader = {
  title: string;
  key: string;
  align?: "start" | "center" | "end";
  sortable?: boolean;
  width?: string | number;
};

const props = withDefaults(
  defineProps<{
    items: Record<string, unknown>[];
    headers: DataTableHeader[];
    loading?: boolean;
    search?: string;
    itemValue?: string;
    itemsPerPage?: number;
    hideHeader?: boolean;
    hideFooter?: boolean;
    bgColor?: string;
    totalItems?: number;
    emptyTitle?: string;
    noResultsTitle?: string;
  }>(),
  {
    loading: false,
    search: "",
    itemValue: "id",
    itemsPerPage: 10,
    hideHeader: false,
    hideFooter: false,
    bgColor: "var(--bg-main)",
    totalItems: 0,
    emptyTitle: "No data available",
    noResultsTitle: "No matching results",
  },
);

const page = ref(1);

const filteredItems = computed(() => {
  const query = props.search.trim().toLocaleLowerCase();
  if (!query) return props.items;

  return props.items.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLocaleLowerCase().includes(query),
    ),
  );
});

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredItems.value.length / props.itemsPerPage)),
);

const visibleItems = computed(() => {
  if (props.hideFooter) return filteredItems.value;

  const start = (page.value - 1) * props.itemsPerPage;
  return filteredItems.value.slice(start, start + props.itemsPerPage);
});

const hasSourceData = computed(
  () => props.totalItems > 0 || props.items.length > 0,
);

watch([() => props.search, () => props.items.length], () => {
  page.value = 1;
});

function getValue(item: Record<string, unknown>, key: string) {
  return key.split(".").reduce<unknown>((value, segment) => {
    if (!value || typeof value !== "object") return undefined;
    return (value as Record<string, unknown>)[segment];
  }, item);
}

function getRowKey(item: Record<string, unknown>, index: number) {
  const value = getValue(item, props.itemValue);
  return typeof value === "string" || typeof value === "number" ? value : index;
}

function alignmentClass(align: DataTableHeader["align"]) {
  if (align === "center") return "text-center";
  if (align === "end") return "text-right";
  return "text-left";
}
</script>
