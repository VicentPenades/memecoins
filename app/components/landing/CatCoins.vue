<template>
  <CommonSection
    id="cat-coins"
    background-color="var(--bg-subtle)"
    :title="COIN.catCoins.title"
  >
    <div class="mx-auto max-w-6xl">
      <p
        class="mx-auto mb-3 max-w-2xl text-center text-base leading-relaxed md:text-lg"
        style="color: var(--text-muted)"
      >
        {{ COIN.catCoins.description }}
      </p>
      <p
        class="mb-10 text-center text-xs font-bold uppercase tracking-wider"
        style="color: var(--primary)"
      >
        One vote per browser · Shared community results
      </p>

      <div class="mb-6 flex flex-col gap-3 sm:flex-row">
        <label class="relative flex-1">
          <span class="sr-only">Search cat coins</span>
          <svg
            class="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2"
            style="color: var(--text-muted)"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search by name, ticker or chain…"
            class="w-full rounded-xl border py-3 pl-12 pr-4 text-sm font-semibold outline-none transition-colors focus:border-[var(--primary)]"
            style="
              color: var(--text-primary);
              background-color: var(--bg-main);
              border-color: color-mix(in srgb, var(--primary) 18%, transparent);
            "
          />
        </label>

        <label class="relative sm:w-44">
          <span class="sr-only">Sort cat coins</span>
          <svg
            class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2"
            style="color: var(--primary)"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M3 6h18M6 12h12M10 18h4" />
          </svg>
          <select
            v-model="sortBy"
            class="w-full appearance-none rounded-xl border py-3 pl-11 pr-10 text-sm font-black outline-none transition-colors focus:border-[var(--primary)]"
            style="
              color: var(--primary);
              background-color: var(--bg-main);
              border-color: color-mix(in srgb, var(--primary) 25%, transparent);
            "
          >
            <option value="votes">Votes</option>
            <option value="change">24h</option>
            <option value="marketCap">Market cap</option>
            <option value="liquidity">Liquidity</option>
            <option value="volume">Volume 24h</option>
          </select>
          <svg
            class="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2"
            style="color: var(--primary)"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </label>

        <button
          type="button"
          class="hidden min-w-36 items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-black transition-all duration-200 hover:-translate-y-0.5 md:inline-flex"
          style="
            color: var(--primary);
            background-color: var(--bg-main);
            border-color: color-mix(in srgb, var(--primary) 25%, transparent);
          "
          :aria-label="`Switch to ${viewMode === 'table' ? 'card' : 'table'} view`"
          @click="toggleView"
        >
          <svg
            v-if="viewMode === 'table'"
            class="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <svg
            v-else
            class="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          {{ viewMode === "table" ? "Card view" : "Table view" }}
        </button>
      </div>

      <p
        class="mb-3 text-sm font-semibold"
        style="color: var(--text-muted)"
        aria-live="polite"
      >
        {{ filteredItems.length }}
        {{ filteredItems.length === 1 ? "coin" : "coins" }}
      </p>

      <div :class="viewMode === 'table' ? 'hidden md:block' : 'hidden'">
        <UiDataTable
          v-if="viewMode === 'table'"
          :headers="headers"
          :items="filteredItems"
          :loading="isLoading || isMarketLoading"
          item-value="slug"
          :items-per-page="10"
          hide-footer
          :total-items="tableItems.length"
      >
        <template #item.coin="{ item }">
          <div
            class="relative min-w-64 overflow-hidden rounded-xl"
            :style="{
              backgroundImage: getImageUrl(item.media, 'header')
                ? `linear-gradient(90deg, var(--bg-main) 38%, color-mix(in srgb, var(--bg-main) 55%, transparent) 75%, transparent), url(${getImageUrl(item.media, 'header')})`
                : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }"
          >
            <div class="flex items-center gap-3 p-2">
              <a
                v-if="
                  item.media?.imageUrl &&
                  !hasImageFailed(item.slug, 'thumbnail')
                "
                :href="item.media.imageUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="block size-14 shrink-0 overflow-hidden rounded-xl border-2"
                style="border-color: var(--bg-main)"
              >
                <img
                  :src="item.media.imageUrl"
                  :alt="`${item.name} thumbnail`"
                  class="size-full object-cover"
                  loading="lazy"
                  decoding="async"
                  referrerpolicy="no-referrer"
                  @error="markImageAsFailed(item.slug, 'thumbnail')"
                />
              </a>
              <LandingImageFallback v-else :emoji="item.emoji" />

              <div>
                <p class="font-black" style="color: var(--text-primary)">
                  {{ item.name }}
                </p>
                <p class="text-sm font-bold" style="color: var(--primary)">
                  {{ item.ticker }} · {{ item.chain }}
                </p>
              </div>
            </div>
          </div>
        </template>

        <template #item.change="{ item }">
          <span
            v-if="item.market"
            class="whitespace-nowrap font-black"
            :style="{ color: getChangeColor(item.market.priceChange24h) }"
          >
            {{ item.market.priceChange24h > 0 ? "+" : ""
            }}{{ item.market.priceChange24h.toFixed(2) }}%
          </span>
          <span v-else style="color: var(--text-muted)">—</span>
        </template>

        <template #item.liquidity="{ item }">
          <span class="whitespace-nowrap font-bold">
            {{ item.market ? formatCompactUsd(item.market.liquidityUsd) : "—" }}
          </span>
        </template>

        <template #item.marketCap="{ item }">
          <span class="whitespace-nowrap font-bold">
            {{ item.market ? formatCompactUsd(item.market.marketCapUsd) : "—" }}
          </span>
        </template>

        <template #item.volume="{ item }">
          <span class="whitespace-nowrap font-bold">
            {{ item.market ? formatCompactUsd(item.market.volume24hUsd) : "—" }}
          </span>
        </template>

        <template #item.links="{ item }">
          <a
            v-if="item.market"
            :href="item.market.dexUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-xs font-black transition-colors hover:underline"
            style="color: var(--primary)"
          >
            Dexscreener
            <svg
              class="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              aria-hidden="true"
            >
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
          <span v-else style="color: var(--text-muted)">—</span>
        </template>

        <template #item.votes="{ item }">
          <div class="flex justify-center">
            <button
              type="button"
              class="inline-flex min-w-16 items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-black transition-all duration-200"
              :class="
                hasVotedFor(item.slug)
                  ? 'text-white'
                  : isLoading || votingSlug !== null || hasLoadError
                    ? 'cursor-not-allowed opacity-40'
                    : 'hover:border-[var(--primary)]'
              "
              :style="{
                backgroundColor: hasVotedFor(item.slug)
                  ? 'var(--primary)'
                  : 'transparent',
                borderColor: hasVotedFor(item.slug)
                  ? 'var(--primary)'
                  : 'color-mix(in srgb, var(--primary) 28%, transparent)',
                color: hasVotedFor(item.slug) ? '#ffffff' : 'var(--primary)',
              }"
              :disabled="isVoteDisabled(item.slug)"
              :aria-label="`Vote for ${item.name}`"
              @click="vote(item.slug)"
            >
              <span class="text-base leading-none" aria-hidden="true">
                {{ hasVotedFor(item.slug) ? "♥" : "♡" }}
              </span>
              <span>
                {{ formatVotes(getVoteCount(item.slug)) }}
              </span>
            </button>
          </div>
        </template>
      </UiDataTable>
      </div>

      <div :class="viewMode === 'table' ? 'md:hidden' : ''">
        <div
          v-if="filteredItems.length > 0"
          class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
        <article
          v-for="item in filteredItems"
          :key="item.slug"
          class="group overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          :style="{
            backgroundColor: 'var(--bg-main)',
            borderColor: hasVotedFor(item.slug)
              ? 'var(--primary)'
              : 'color-mix(in srgb, var(--primary) 18%, transparent)',
          }"
        >
          <a
            v-if="
              getImageUrl(item.media, 'header') &&
              !hasImageFailed(item.slug, 'cardHeader')
            "
            :href="getImageUrl(item.media, 'header')!"
            target="_blank"
            rel="noopener noreferrer"
            class="block h-32 overflow-hidden"
          >
            <img
              :src="getImageUrl(item.media, 'header')!"
              :alt="`${item.name} header`"
              class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              referrerpolicy="no-referrer"
              @error="markImageAsFailed(item.slug, 'cardHeader')"
            />
          </a>
          <div
            v-else
            class="h-32"
            style="
              background: linear-gradient(
                135deg,
                color-mix(in srgb, var(--primary) 25%, var(--bg-main)),
                var(--bg-main)
              );
            "
          />

          <div class="relative p-5 pt-9">
            <span
              class="absolute -top-8 left-5 flex size-16 items-center justify-center overflow-hidden rounded-2xl border-4 text-3xl"
              style="
                background-color: var(--bg-main);
                border-color: var(--bg-main);
              "
            >
              <img
                v-if="
                  item.media?.imageUrl &&
                  !hasImageFailed(item.slug, 'cardThumbnail')
                "
                :src="item.media.imageUrl"
                :alt="`${item.name} thumbnail`"
                class="size-full object-cover"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                @error="markImageAsFailed(item.slug, 'cardThumbnail')"
              />
              <span v-else aria-hidden="true">{{ item.emoji }}</span>
            </span>

            <h3 class="text-lg font-black" style="color: var(--text-primary)">
              {{ item.name }}
            </h3>
            <p class="text-sm font-bold" style="color: var(--primary)">
              {{ item.ticker }} · {{ item.chain }}
            </p>

            <div class="my-5 grid grid-cols-2 gap-3">
              <div class="rounded-xl bg-white/3 p-3">
                <p class="text-xs font-bold" style="color: var(--text-muted)">
                  Price
                </p>
                <p class="mt-1 text-sm font-black">
                  {{ item.market ? formatPrice(item.market.priceUsd) : "—" }}
                </p>
              </div>
              <div class="rounded-xl bg-white/3 p-3">
                <p class="text-xs font-bold" style="color: var(--text-muted)">
                  24h
                </p>
                <p
                  class="mt-1 text-sm font-black"
                  :style="{
                    color: item.market
                      ? getChangeColor(item.market.priceChange24h)
                      : 'var(--text-muted)',
                  }"
                >
                  {{
                    item.market
                      ? `${item.market.priceChange24h > 0 ? "+" : ""}${item.market.priceChange24h.toFixed(2)}%`
                      : "—"
                  }}
                </p>
              </div>
              <div class="rounded-xl bg-white/3 p-3">
                <p class="text-xs font-bold" style="color: var(--text-muted)">
                  Market cap
                </p>
                <p class="mt-1 text-sm font-black">
                  {{
                    item.market
                      ? formatCompactUsd(item.market.marketCapUsd)
                      : "—"
                  }}
                </p>
              </div>
              <div class="rounded-xl bg-white/3 p-3">
                <p class="text-xs font-bold" style="color: var(--text-muted)">
                  Volume 24h
                </p>
                <p class="mt-1 text-sm font-black">
                  {{
                    item.market
                      ? formatCompactUsd(item.market.volume24hUsd)
                      : "—"
                  }}
                </p>
              </div>
            </div>

            <div class="flex items-center justify-between gap-3">
              <a
                v-if="item.market"
                :href="item.market.dexUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm font-bold hover:underline"
                style="color: var(--primary)"
              >
                Dexscreener ↗
              </a>
              <span v-else class="text-xs" style="color: var(--text-muted)">
                Market unavailable
              </span>

              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition-all duration-200"
                :class="
                  hasVotedFor(item.slug)
                    ? 'text-white'
                    : isVoteDisabled(item.slug)
                      ? 'cursor-not-allowed opacity-40'
                      : 'hover:-translate-y-0.5'
                "
                :style="{
                  backgroundColor: hasVotedFor(item.slug)
                    ? 'var(--primary)'
                    : 'color-mix(in srgb, var(--primary) 14%, transparent)',
                  color: hasVotedFor(item.slug) ? '#ffffff' : 'var(--primary)',
                }"
                :disabled="isVoteDisabled(item.slug)"
                :aria-label="`Vote for ${item.name}`"
                @click="vote(item.slug)"
              >
                <span class="text-lg" aria-hidden="true">
                  {{ hasVotedFor(item.slug) ? "♥" : "♡" }}
                </span>
                {{ formatVotes(getVoteCount(item.slug)) }}
              </button>
            </div>
          </div>
        </article>
      </div>

      <div
        v-else
        class="rounded-2xl border px-6 py-16 text-center"
        style="
          color: var(--text-muted);
          background-color: var(--bg-main);
          border-color: color-mix(in srgb, var(--primary) 18%, transparent);
        "
      >
        No coins match “{{ searchQuery }}”.
      </div>
      </div>

      <p
        v-if="hasAnyVotes"
        class="mt-5 text-center text-sm font-bold"
        style="color: var(--primary)"
        aria-live="polite"
      >
        Your votes have been saved.
      </p>
      <div
        v-else-if="errorMessage"
        class="mt-5 flex flex-col items-center gap-3 text-center"
        aria-live="polite"
      >
        <p class="text-sm font-bold" style="color: var(--error)">
          {{ errorMessage }}
        </p>
        <button
          v-if="hasLoadError"
          type="button"
          class="rounded-lg px-4 py-2 text-sm font-black"
          style="
            color: var(--primary);
            background-color: color-mix(
              in srgb,
              var(--primary) 14%,
              transparent
            );
          "
          @click="loadVotes"
        >
          Try again
        </button>
      </div>
    </div>
  </CommonSection>
</template>

<script setup lang="ts">
import { COIN } from "~/data/coin";

type VoteResponse = {
  votes: Record<string, number>;
  votedSlugs: string[];
};

type MarketData = {
  priceUsd: number;
  marketCapUsd: number;
  liquidityUsd: number;
  volume24hUsd: number;
  priceChange24h: number;
  dexUrl: string;
  imageUrl: string | null;
  headerUrl: string | null;
  openGraphUrl: string | null;
};

type MarketsResponse = {
  markets: Record<string, MarketData | null>;
  media: Record<string, CoinMedia>;
  unavailable: string[];
};

type CoinMedia = Pick<MarketData, "imageUrl" | "headerUrl" | "openGraphUrl">;

type SortKey = "votes" | "change" | "marketCap" | "liquidity" | "volume";

const voteCounts = ref<Record<string, number>>({});
const markets = ref<Record<string, MarketData | null>>({});
const media = ref<Record<string, CoinMedia>>({});
const failedImages = ref(new Set<string>());
const votedSlugs = ref(new Set<string>());
const votingSlug = ref<string | null>(null);
const isLoading = ref(true);
const isMarketLoading = ref(true);
const hasLoadError = ref(false);
const errorMessage = ref("");
const searchQuery = ref("");
const sortBy = ref<SortKey>("votes");
const viewMode = ref<"table" | "cards">("table");
const hasAnyVotes = computed(() => votedSlugs.value.size > 0);
const isVoteDisabled = (slug: string) =>
  hasVotedFor(slug) ||
  isLoading.value ||
  votingSlug.value !== null ||
  hasLoadError.value;
const headers = [
  { title: "Coin", key: "coin" },
  { title: "Votes", key: "votes", align: "center" as const },
  { title: "24h", key: "change" },
  { title: "Market cap", key: "marketCap" },
  { title: "Liquidity", key: "liquidity" },
  { title: "Volume 24h", key: "volume" },
  { title: "Links", key: "links" },
];
const tableItems = computed(() =>
  COIN.catCoins.coins.map((coin) => ({
    ...coin,
    market: markets.value[coin.slug] ?? null,
    media: media.value[coin.slug] ?? null,
  })),
);
const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase();
  const items = query
    ? tableItems.value.filter((coin) =>
        [coin.name, coin.ticker, coin.chain, coin.description].some((value) =>
          value.toLocaleLowerCase().includes(query),
        ),
      )
    : tableItems.value;

  return [...items].sort((first, second) => {
    const firstValue = getSortValue(first, sortBy.value);
    const secondValue = getSortValue(second, sortBy.value);

    if (firstValue === null) return secondValue === null ? 0 : 1;
    if (secondValue === null) return -1;
    return secondValue - firstValue;
  });
});

function getSortValue(
  item: (typeof tableItems.value)[number],
  key: SortKey,
) {
  if (key === "votes") return getVoteCount(item.slug);
  if (!item.market) return null;

  const marketValues: Record<Exclude<SortKey, "votes">, number> = {
    change: item.market.priceChange24h,
    marketCap: item.market.marketCapUsd,
    liquidity: item.market.liquidityUsd,
    volume: item.market.volume24hUsd,
  };

  return marketValues[key];
}

onMounted(() => {
  void loadVotes();
  void loadMarkets();
});

async function loadVotes() {
  isLoading.value = true;
  hasLoadError.value = false;
  errorMessage.value = "";

  try {
    const response = await $fetch<VoteResponse>("/api/cat-coins");
    voteCounts.value = response.votes;
    votedSlugs.value = new Set(response.votedSlugs);
  } catch (error) {
    hasLoadError.value = true;
    errorMessage.value = getErrorMessage(error);
  } finally {
    isLoading.value = false;
  }
}

async function loadMarkets() {
  isMarketLoading.value = true;

  try {
    const response = await $fetch<MarketsResponse>("/api/cat-coins/markets");
    markets.value = response.markets;
    media.value = response.media;
  } catch (error) {
    console.error("Unable to load Dexscreener market data:", error);
    markets.value = {};
  } finally {
    isMarketLoading.value = false;
  }
}

async function vote(slug: string) {
  if (hasVotedFor(slug) || votingSlug.value || hasLoadError.value) return;

  const isKnownCoin = COIN.catCoins.coins.some((coin) => coin.slug === slug);
  if (!isKnownCoin) {
    throw new Error(`Unknown cat coin identifier: ${slug}`);
  }

  votingSlug.value = slug;
  errorMessage.value = "";

  try {
    const response = await $fetch<VoteResponse>("/api/cat-coins/vote", {
      method: "POST",
      body: { slug },
    });
    voteCounts.value = response.votes;
    votedSlugs.value = new Set(response.votedSlugs);
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    votingSlug.value = null;
  }
}

function getVoteCount(slug: string) {
  return voteCounts.value[slug] ?? 0;
}

function hasVotedFor(slug: string) {
  return votedSlugs.value.has(slug);
}

function toggleView() {
  viewMode.value = viewMode.value === "table" ? "cards" : "table";
}

function formatVotes(votes: number) {
  return new Intl.NumberFormat("en-US").format(votes);
}

function getChangeColor(change: number) {
  if (change > 0) return "var(--success)";
  if (change < 0) return "var(--error)";
  return "var(--text-primary)";
}

function getImageKey(slug: string, type: string) {
  return `${slug}:${type}`;
}

function hasImageFailed(slug: string, type: string) {
  return failedImages.value.has(getImageKey(slug, type));
}

function markImageAsFailed(slug: string, type: string) {
  failedImages.value = new Set(failedImages.value).add(getImageKey(slug, type));
}

function getImageUrl(
  coinMedia: CoinMedia | null,
  type: "header" | "openGraph",
) {
  if (!coinMedia) return null;
  return type === "header"
    ? coinMedia.headerUrl || coinMedia.openGraphUrl || coinMedia.imageUrl
    : coinMedia.openGraphUrl || coinMedia.headerUrl || coinMedia.imageUrl;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 0.01 ? 4 : 2,
    maximumFractionDigits: value < 0.01 ? 8 : 4,
  }).format(value);
}

function formatCompactUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "data" in error) {
    const data = error.data;
    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }
  }

  return error instanceof Error
    ? error.message
    : "Voting is temporarily unavailable";
}
</script>
