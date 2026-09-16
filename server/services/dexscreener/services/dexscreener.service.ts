import {
  mapDexScreenTokenPairDataToMarketData,
  type DexscreenerMarketData,
} from "../mappers/dexscreen.mappers";
import { dexscreenerRepository } from "../repository/dexscreener.repository";

class DexscreenerService {
  getTokenMarketData = async ({
    chainId,
    tokenAddress,
  }: {
    chainId: string;
    tokenAddress: string;
  }): Promise<DexscreenerMarketData | null> => {
    const pairs = await dexscreenerRepository.fetchTokenPairs(
      chainId,
      tokenAddress,
    );
    const matchingPairs = pairs.filter(
      (pair) =>
        pair.chainId.toLowerCase() === chainId.toLowerCase() &&
        (pair.baseToken.address.toLowerCase() === tokenAddress.toLowerCase() ||
          pair.quoteToken.address.toLowerCase() === tokenAddress.toLowerCase()),
    );
    const mostLiquidPair = matchingPairs.sort(
      (left, right) =>
        (right.liquidity?.usd ?? 0) - (left.liquidity?.usd ?? 0),
    )[0];
    const media = {
      imageUrl: matchingPairs.find((pair) => pair.info?.imageUrl)?.info
        ?.imageUrl,
      headerUrl: matchingPairs.find((pair) => pair.info?.header)?.info?.header,
      openGraphUrl: matchingPairs.find((pair) => pair.info?.openGraph)?.info
        ?.openGraph,
    };

    return mostLiquidPair
      ? mapDexScreenTokenPairDataToMarketData(mostLiquidPair, media)
      : null;
  };
}

export const dexscreenerService = new DexscreenerService();
