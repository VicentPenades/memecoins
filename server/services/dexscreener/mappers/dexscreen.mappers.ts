import type { DexscreenerTokenData } from "../repository/types/dexscreener";

export type DexscreenerMarketData = {
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

export const mapDexScreenTokenPairDataToMarketData = (
  pair: DexscreenerTokenData,
  media?: {
    imageUrl?: string;
    headerUrl?: string;
    openGraphUrl?: string;
  },
): DexscreenerMarketData => {
  return {
    priceUsd: Number.parseFloat(pair.priceUsd ?? "0"),
    marketCapUsd: pair.marketCap ?? pair.fdv ?? 0,
    liquidityUsd: pair.liquidity?.usd ?? 0,
    volume24hUsd: pair.volume?.h24 ?? 0,
    priceChange24h: pair.priceChange?.h24 ?? 0,
    dexUrl: pair.url,
    imageUrl: media?.imageUrl ?? pair.info?.imageUrl ?? null,
    headerUrl: media?.headerUrl ?? pair.info?.header ?? null,
    openGraphUrl: media?.openGraphUrl ?? pair.info?.openGraph ?? null,
  };
};
