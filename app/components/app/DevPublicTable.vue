<template>
  <div>
    <!-- Toolbar: solo buscador (los devs no tienen fecha ni estado). -->
    <div class="mb-4">
      <UiFormTextField
        v-model="search"
        :placeholder="$t('dev.list.searchPlaceholder')"
        prepend-inner-icon="mdi-magnify"
        class="w-full"
      />
    </div>

    <!-- Tabla pública de devs: más información que la anterior (fila de
         miniaturas, likes/dislikes separados, score neto) y columnas ordenables. -->
    <UiDataTable
      item-value="handle"
      :items="filtered"
      :headers="headers"
      :total-items="devs.length"
      :empty-title="$t('dev.list.empty')"
      hover
      class="cursor-pointer"
      @click:row="onRowClick"
    >
      <template #[`item.handle`]="{ item }">
        <div class="flex items-center gap-3">
          <!-- Fila de hasta 3 miniaturas de las coins recientes del dev. -->
          <div v-if="item.thumbnails.length" class="flex -space-x-2">
            <img
              v-for="(thumbnail, index) in item.thumbnails.slice(0, 3)"
              :key="index"
              :src="thumbnail"
              alt=""
              class="h-8 w-8 rounded-full border-2 border-[var(--pp-surface)] object-cover"
            />
          </div>
          <div
            v-else
            class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--pp-brand-tint)] text-xs font-bold text-[var(--pp-brand-strong)]"
          >
            {{ (item.name || item.handle).slice(0, 2).toUpperCase() }}
          </div>
          <span class="font-medium">@{{ item.handle }}</span>
        </div>
      </template>
      <template #[`item.name`]="{ item }">{{ item.name ?? "—" }}</template>
      <template #[`item.coinCount`]="{ item }">
        {{ $t("dev.list.coinCount", item.coinCount) }}
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
      <template #[`item.score`]="{ item }">
        <span
          class="font-semibold"
          :class="netScore(item) >= 0 ? 'text-emerald-600' : 'text-red-600'"
        >
          {{ netScore(item) > 0 ? "+" : "" }}{{ netScore(item) }}
        </span>
      </template>
    </UiDataTable>
  </div>
</template>

<script setup lang="ts">
import type { DevListItem } from "~/app/pages/(modules)/devs/types/devs.types";

// Tabla pública del directorio de devs (/devs). Enriquecida respecto a la
// anterior: fila de miniaturas de coins, likes y dislikes separados, score neto
// y columnas ordenables. Autónoma (buscador propio) y navega al perfil del dev.
const props = defineProps<{
  devs: DevListItem[];
}>();

const { t: $t } = useI18n();
// Estado de voto compartido por fila (Likes/Dislikes son celdas independientes
// que deben operar sobre el mismo estado del dev), igual que en la tabla de coins.
const { stateFor, vote } = useDevVotes(toRef(props, "devs"));

// Buscador por handle o nombre (normalizado: minúsculas + sin acentos).
const search = ref("");
const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const filtered = computed<DevListItem[]>(() => {
  const query = normalize(search.value);
  if (!query) return props.devs;
  return props.devs.filter(
    (dev) =>
      normalize(dev.handle).includes(query) ||
      normalize(dev.name ?? "").includes(query),
  );
});

// Score neto del dev: likes menos dislikes (del estado de voto, para reflejar
// el voto optimista al instante).
const netScore = (dev: DevListItem) =>
  stateFor(dev).likes - stateFor(dev).dislikes;

const headers = computed(() => [
  { title: $t("dev.list.colHandle"), key: "handle" },
  { title: $t("dev.list.colName"), key: "name" },
  { title: $t("dev.list.colCoins"), key: "coinCount" },
  // Likes/Dislikes/Score salen del estado de voto (no de item.*), así que no
  // son ordenables para evitar desajustes entre lo mostrado y el orden.
  { title: $t("dev.list.colLikes"), key: "likes", sortable: false },
  { title: $t("dev.list.colDislikes"), key: "dislikes", sortable: false },
  { title: $t("dev.list.colScore"), key: "score", sortable: false },
]);

// Fila clicable: navega al perfil público del dev.
const onRowClick = (_event: unknown, row: { item: DevListItem }) => {
  navigateTo(`/devs/${row.item.handle}`);
};
</script>
