<template>
  <div>
    <!-- Tabs para separar launched y prelaunch. -->
    <v-tabs v-model="activeTab" color="primary" class="mb-4">
      <v-tab value="launched">{{ $t("coins.status.launched") }}</v-tab>
      <v-tab value="prelaunch">{{ $t("coins.status.prelaunch") }}</v-tab>
    </v-tabs>

    <!-- Toolbar: buscador + rango de fechas. -->
    <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
      <UiFormTextField
        v-model="search"
        :placeholder="$t('coins.searchPlaceholder')"
        prepend-inner-icon="mdi-magnify"
        class="w-full"
      />
      <UiPickerRange v-model="dateRange" :placeholder="$t('coins.dateRangeAll')" />
    </div>

    <!-- Tabla con todas las coins de la tab activa. -->
    <UiDataTable
      item-value="id"
      :items="filtered"
      :headers="headers"
      :total-items="tabCoins.length"
      :empty-title="$t('coins.list.empty')"
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
            class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--pp-brand-tint)] text-xs font-bold text-[var(--pp-brand-strong)]"
          >
            {{ item.symbol.slice(0, 3).toUpperCase() }}
          </div>
          <span class="font-medium">{{ item.name }}</span>
        </div>
      </template>
      <template #[`item.symbol`]="{ item }">
        ${{ item.symbol.toUpperCase() }}
      </template>
      <template #[`item.devHandle`]="{ item }">@{{ item.devHandle }}</template>
      <template #[`item.description`]="{ item }">
        <span
          v-if="item.description"
          class="block max-w-[220px] truncate"
          :title="item.description"
        >
          {{ item.description }}
        </span>
        <span v-else>—</span>
      </template>
      <template #[`item.socials`]="{ item }">
        <div v-if="hasSocials(item)" class="flex items-center gap-2">
          <a
            v-if="item.socials?.website"
            :href="item.socials.website"
            target="_blank"
            rel="noopener"
            :title="$t('coins.add.website')"
            @click.stop
          >
            <v-icon icon="mdi-web" size="small" />
          </a>
          <a
            v-if="item.socials?.twitter"
            :href="item.socials.twitter"
            target="_blank"
            rel="noopener"
            :title="$t('coins.add.twitter')"
            @click.stop
          >
            <v-icon icon="mdi-twitter" size="small" />
          </a>
          <a
            v-if="item.socials?.telegram"
            :href="item.socials.telegram"
            target="_blank"
            rel="noopener"
            :title="$t('coins.add.telegram')"
            @click.stop
          >
            <v-icon icon="mdi-telegram" size="small" />
          </a>
        </div>
        <span v-else>—</span>
      </template>
      <template #[`item.mint`]="{ item }">
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
      <template #[`item.likes`]="{ item }">
        <AppRatingButton
          kind="like"
          :count="stateFor(item).likes"
          :active="stateFor(item).myVote === 'like'"
          :disabled="stateFor(item).pending || stateFor(item).myVote !== null"
          @vote="vote(item, 'like')"
        />
      </template>
      <template #[`item.dislikes`]="{ item }">
        <AppRatingButton
          kind="dislike"
          :count="stateFor(item).dislikes"
          :active="stateFor(item).myVote === 'dislike'"
          :disabled="stateFor(item).pending || stateFor(item).myVote !== null"
          @vote="vote(item, 'dislike')"
        />
      </template>
      <template #[`item.createdAt`]="{ item }">
        {{ formatDate(item.createdAt) }}
      </template>
    </UiDataTable>
  </div>
</template>

<script setup lang="ts">
import { format } from "date-fns";
import { filterCoins } from "~/app/pages/(modules)/my-coins/utils/coins.filters";
import { resolveImageUrl } from "~/shared/utils/image";
import type { FeedCoin } from "~/app/pages/(modules)/devs/types/devs.types";
import type { CoinStatus } from "~/app/pages/(modules)/my-coins/types/coins.types";
import type { DateRange } from "~/app/components/ui/picker/models/date-picker.models";

// Tabla pública de coins reutilizable (/coins y perfil de dev): tabs launched/prelaunch,
// buscador, rango de fechas y navegación a la ficha pública de la coin.
const props = withDefaults(
  defineProps<{
    coins: FeedCoin[];
    // El perfil de dev oculta la columna "Dev": todas las filas son el mismo dev.
    showDevColumn?: boolean;
  }>(),
  { showDevColumn: true },
);

const { t: $t } = useI18n();
// Estado de voto compartido por fila (las columnas Likes/Dislikes son celdas
// independientes que deben operar sobre el mismo estado de la coin).
const { stateFor, vote } = useCoinVotes(toRef(props, "coins"));

// Tab activa: separa launched de prelaunch.
const activeTab = ref<CoinStatus>("launched");
const tabCoins = computed<FeedCoin[]>(() =>
  props.coins.filter((coin) => coin.status === activeTab.value),
);

// Estado de la toolbar (sin rango por defecto: mostramos todas las fechas).
const search = ref("");
const from = ref<string | null>(null);
const to = ref<string | null>(null);

const toISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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

const filtered = computed<FeedCoin[]>(() =>
  filterCoins(tabCoins.value, {
    query: search.value,
    statuses: [activeTab.value],
    from: from.value,
    to: to.value,
  }),
);

const headers = computed(() =>
  [
    { title: $t("coins.colName"), key: "name" },
    { title: $t("coins.colSymbol"), key: "symbol" },
    props.showDevColumn
      ? { title: $t("coins.colDev"), key: "devHandle" }
      : null,
    { title: $t("coins.colDescription"), key: "description", sortable: false },
    { title: $t("coins.colSocials"), key: "socials", sortable: false },
    { title: $t("coins.colDevBuy"), key: "devBuySol" },
    // El mint solo existe en coins lanzadas: columna presente solo en esa tab.
    activeTab.value === "launched"
      ? { title: $t("coins.colMint"), key: "mint", sortable: false }
      : null,
    { title: $t("coins.colLikes"), key: "likes", sortable: false },
    { title: $t("coins.colDislikes"), key: "dislikes", sortable: false },
    { title: $t("coins.colDate"), key: "createdAt" },
  ].filter((header) => header !== null),
);

// Una coin tiene redes si trae al menos una URL en el blob socials.
const hasSocials = (coin: FeedCoin): boolean =>
  !!(coin.socials?.website || coin.socials?.twitter || coin.socials?.telegram);

const formatDate = (value: string) => format(new Date(value), "dd/MM/yyyy");

// Fila clicable: navega a la ficha pública de la coin.
const onRowClick = (_event: unknown, row: { item: FeedCoin }) => {
  if (!row.item.slug) return;
  navigateTo(`/devs/${row.item.devHandle}/${row.item.slug}`);
};
</script>
