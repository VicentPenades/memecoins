<template>
  <div>
    <!-- Toolbar privada: buscador + rango de fechas + filtro de estado. -->
    <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
      <UiFormTextField
        v-model="search"
        :placeholder="$t('coins.searchPlaceholder')"
        prepend-inner-icon="mdi-magnify"
        class="w-full"
      />
      <UiPickerRange v-model="dateRange" :placeholder="$t('coins.dateRangeAll')" />
      <SectionFilterMenu
        :filter-sections="statusFilterSections"
        @apply="onApplyStatusFilter"
      />
    </div>

    <!-- Tabla de gestión: más columnas que la pública (estado editable,
         visibilidad, dev buy + config, valoración, mint y acciones). -->
    <UiDataTable
      item-value="id"
      :items="[...filtered]"
      :headers="headers"
      :loading="loading"
      :total-items="coins.length"
      :empty-title="$t('coins.emptyTitle')"
      :empty-description="$t('coins.emptyDescription')"
      empty-icon-id="mdi-database-outline"
      hover
      class="cursor-pointer"
      @click:row="onRowClick"
    >
      <template #[`item.name`]="{ item }">
        <div class="flex items-center gap-3">
          <img
            v-if="item.imageUrl"
            :src="resolveImageUrl(item.imageUrl)"
            :alt="item.name"
            class="h-8 w-8 rounded-full object-cover"
          />
          <div
            v-else
            class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--mc-bw-gray-subtle)] text-xs font-bold text-[var(--accent)]"
          >
            {{ item.symbol.slice(0, 3).toUpperCase() }}
          </div>
          <span class="font-medium">{{ item.name }}</span>
        </div>
      </template>
      <template #[`item.symbol`]="{ item }">
        ${{ item.symbol.toUpperCase() }}
      </template>
      <template #[`item.status`]="{ item }">
        <!-- launched es terminal: chip fijo sin menú. En el resto, el estado se
             cambia clicando el tag, que abre un menú con las fases siguientes
             válidas (solo hacia delante). -->
        <v-chip
          v-if="isLocked(item.status)"
          :color="statusColor(item.status)"
          size="small"
          label
        >
          {{ $t(`coins.status.${item.status}`) }}
        </v-chip>
        <v-menu v-else location="bottom start">
          <template #activator="{ props: menuProps }">
            <v-chip
              :color="statusColor(item.status)"
              size="small"
              label
              class="cursor-pointer"
              v-bind="menuProps"
              @click.stop
            >
              {{ $t(`coins.status.${item.status}`) }}
              <v-icon end size="small" icon="mdi-menu-down" />
            </v-chip>
          </template>
          <v-list density="compact">
            <v-list-item
              v-for="status in getNextStatuses(item.status)"
              :key="status"
              @click="emit('changeStatus', item, status)"
            >
              <template #prepend>
                <v-icon
                  :color="statusColor(status)"
                  icon="mdi-circle"
                  size="x-small"
                />
              </template>
              <v-list-item-title>
                {{ $t(`coins.status.${status}`) }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <template #[`item.devBuySol`]="{ item }">
        <div class="flex flex-col">
          <span class="font-medium">{{ item.devBuySol }} SOL</span>
          <span
            v-if="item.launchConfig"
            class="text-xs text-[var(--text-secondary)]"
            :title="launchSummary(item.launchConfig)"
          >
            {{ launchSummary(item.launchConfig) }}
          </span>
        </div>
      </template>
      <template #[`item.isPublic`]="{ item }">
        <!-- launched es siempre pública (chip fijo); prelaunch se puede alternar;
             draft es siempre privada, así que no muestra control. -->
        <v-switch
          v-if="item.status === 'prelaunch'"
          :model-value="item.isPublic"
          color="primary"
          density="compact"
          hide-details
          inset
          @click.stop
          @update:model-value="emit('togglePublic', item, $event ?? false)"
        />
        <v-chip
          v-else-if="item.status === 'launched'"
          size="small"
          color="primary"
          label
        >
          {{ $t("coins.colPublic") }}
        </v-chip>
        <span v-else>—</span>
      </template>
      <template #[`item.likes`]="{ item }">
        <span class="inline-flex items-center gap-1 text-[var(--text-secondary)]">
          <v-icon icon="mdi-thumb-up-outline" size="small" />
          {{ item.likes }}
        </span>
      </template>
      <template #[`item.dislikes`]="{ item }">
        <span class="inline-flex items-center gap-1 text-[var(--text-secondary)]">
          <v-icon icon="mdi-thumb-down-outline" size="small" />
          {{ item.dislikes }}
        </span>
      </template>
      <template #[`item.mintAddress`]="{ item }">
        <a
          v-if="item.launchResult?.mintAddress"
          :href="`https://pump.fun/${item.launchResult.mintAddress}`"
          target="_blank"
          rel="noopener"
          class="text-blue-600 underline"
          @click.stop
        >
          {{ $t("coins.view") }}
        </a>
        <span v-else>—</span>
      </template>
      <template #[`item.createdAt`]="{ item }">
        {{ formatDate(item.createdAt) }}
      </template>
      <template #[`item.actions`]="{ item }">
        <div class="flex justify-end" @click.stop>
          <UiMenuActions :action-menu-items="rowActions(item)" />
        </div>
      </template>
    </UiDataTable>
  </div>
</template>

<script setup lang="ts">
import { format, subYears } from "date-fns";
import { filterCoins } from "~/app/pages/(modules)/my-coins/utils/coins.filters";
import { resolveImageUrl } from "~/shared/utils/image";
import { getNextStatuses, isLocked } from "~/shared/utils/coin-status";
import type {
  Coin,
  CoinStatus,
  LaunchConfig,
} from "~/app/pages/(modules)/my-coins/types/coins.types";
import type { DateRange } from "~/app/components/ui/picker/models/date-picker.models";
import type { FilterSection } from "~/app/components/section/filter/models/filter.models";

// Tabla privada de gestión de las monedas del propio dev (/my-coins). Muestra
// más información que la tabla pública: estado editable, visibilidad, dev buy +
// config de lanzamiento, valoración recibida, mint y acciones por fila. La
// mutación de datos vive en la página (servicio + modales); aquí solo emitimos.
const props = withDefaults(
  defineProps<{
    coins: Coin[];
    loading?: boolean;
  }>(),
  { loading: false },
);

const emit = defineEmits<{
  changeStatus: [coin: Coin, status: CoinStatus];
  togglePublic: [coin: Coin, value: boolean];
  customize: [coin: Coin];
  reuse: [coin: Coin];
  delete: [coin: Coin];
  rowClick: [coin: Coin];
}>();

const { t: $t } = useI18n();

// Fecha → "YYYY-MM-DD" en horario local (coincide con lo que elige el usuario).
const toISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Estado de la toolbar: buscador, rango de createdAt y estados seleccionados.
// Por defecto el rango arranca en el último año (de hace un año hasta hoy).
const search = ref("");
const from = ref<string | null>(toISODate(subYears(new Date(), 1)));
const to = ref<string | null>(toISODate(new Date()));

// Puente entre el picker (DateRange de instancias Date) y el contrato del
// filtro (from/to como strings "YYYY-MM-DD").
const dateRange = computed<DateRange | null>({
  get: () => ({
    start: from.value ? new Date(`${from.value}T00:00:00`) : null,
    end: to.value ? new Date(`${to.value}T00:00:00`) : null,
  }),
  set: (range) => {
    from.value = range?.start ? toISODate(range.start) : null;
    to.value = range?.end ? toISODate(range.end) : null;
  },
});

const ALL_STATUSES: CoinStatus[] = ["draft", "launched", "prelaunch"];
const statuses = ref<CoinStatus[]>([...ALL_STATUSES]);

// El filtro de estado se expresa como una sección de opciones (checkbox) para
// SectionFilterMenu; `active` refleja los estados actualmente seleccionados.
const statusFilterSections = computed<FilterSection[]>(() => [
  {
    id: "status",
    label: $t("coins.statusFilter"),
    options: ALL_STATUSES.map((status) => ({
      id: status,
      label: $t(`coins.status.${status}`),
      active: statuses.value.includes(status),
    })),
  },
]);

// Al pulsar "Aplicar" en el menú, volcamos las opciones activas a `statuses`.
const onApplyStatusFilter = (sections: FilterSection[]) => {
  const statusSection = sections.find((section) => section.id === "status");
  if (!statusSection) return;
  statuses.value = statusSection.options
    .filter((option) => option.active)
    .map((option) => option.id as CoinStatus);
};

const filtered = computed<Coin[]>(() =>
  filterCoins([...props.coins], {
    query: search.value,
    statuses: statuses.value,
    from: from.value,
    to: to.value,
  }),
);

const headers = computed(() => [
  { title: $t("coins.colName"), key: "name" },
  { title: $t("coins.colSymbol"), key: "symbol" },
  { title: $t("coins.colStatus"), key: "status" },
  { title: $t("coins.colDevBuy"), key: "devBuySol" },
  { title: $t("coins.colPublic"), key: "isPublic", sortable: false },
  { title: $t("coins.colLikes"), key: "likes" },
  { title: $t("coins.colDislikes"), key: "dislikes" },
  { title: $t("coins.colMint"), key: "mintAddress", sortable: false },
  { title: $t("coins.colDate"), key: "createdAt" },
  {
    title: $t("coins.colActions"),
    key: "actions",
    sortable: false,
    align: "end" as const,
  },
]);

// Color del chip de estado según la fase de la moneda.
const statusColor = (status: CoinStatus) =>
  ({ draft: "grey", launched: "success", prelaunch: "warning" })[status];

// Resumen compacto de la config de lanzamiento (provider · slippage · priority
// fee · pool). El provider solo se muestra si está guardado (monedas antiguas no
// lo tienen).
const launchSummary = (config: LaunchConfig) => {
  const base = `${config.slippage}% · ${config.priorityFee} SOL · ${config.pool}`;
  if (!config.provider) return base;
  const providerLabel =
    config.provider === "pumpportal" ? "PumpPortal" : "pump.fun";
  return `${providerLabel} · ${base}`;
};

const formatDate = (value: string) => format(new Date(value), "dd/MM/yyyy");

// Acciones por fila: personalizar · reutilizar · borrar. (El cambio de estado
// se hace clicando el tag de estado de la fila, no desde aquí.) Una moneda
// lanzada queda bloqueada: no se puede borrar (solo personalizar/reutilizar).
const rowActions = (coin: Coin) => [
  {
    label: $t("coins.customize.action"),
    prependIcon: "mdi-palette-outline",
    action: () => emit("customize", coin),
  },
  {
    label: $t("coins.reuse"),
    prependIcon: "mdi-refresh",
    action: () => emit("reuse", coin),
  },
  ...(isLocked(coin.status)
    ? []
    : [
        { divider: true },
        {
          label: $t("coins.delete"),
          prependIcon: "mdi-delete-outline",
          action: () => emit("delete", coin),
        },
      ]),
];

// Click en la fila: la página decide a dónde navegar (necesita el handle del user).
const onRowClick = (_event: unknown, row: { item: Coin }) => {
  emit("rowClick", row.item);
};
</script>
