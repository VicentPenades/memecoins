import type { DexscreenerTokenData } from "../repository/types/dexscreener";

class DexscreenerRepository {
  fetchTokenPairs = async (
    chainId: string,
    tokenAddress: string,
  ): Promise<DexscreenerTokenData[]> => {
    const response = await fetch(
      `https://api.dexscreener.com/token-pairs/v1/${encodeURIComponent(chainId)}/${encodeURIComponent(tokenAddress)}`,
      {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
      },
    );
    if (!response.ok) {
      throw new Error(
        `Dexscreener request failed with status ${response.status}`,
      );
    }

    const data = (await response.json()) as DexscreenerTokenData[];
    return Array.isArray(data) ? data : [];
  };
}

export const dexscreenerRepository = new DexscreenerRepository();
