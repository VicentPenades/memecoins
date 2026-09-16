import { COIN } from "../../../app/data/coin";
import { dexscreenerService } from "../../services/dexscreener/services/dexscreener.service";
import { useDatabase } from "../../utils/database";

type CachedMediaRow = {
  slug: string;
  image_url: string | null;
  header_url: string | null;
  open_graph_url: string | null;
};

type CoinMedia = {
  imageUrl: string | null;
  headerUrl: string | null;
  openGraphUrl: string | null;
};

export default defineCachedEventHandler(
  async (event) => {
    const sql = useDatabase(event);
    const cachedMediaRows = await sql<CachedMediaRow[]>`
      SELECT slug, image_url, header_url, open_graph_url
      FROM cat_coins
    `;
    const cachedMedia = Object.fromEntries(
      cachedMediaRows.map((row) => [
        row.slug,
        {
          imageUrl: row.image_url,
          headerUrl: row.header_url,
          openGraphUrl: row.open_graph_url,
        } satisfies CoinMedia,
      ]),
    );

    const results = await Promise.allSettled(
      COIN.catCoins.coins.map(async (coin) => ({
        slug: coin.slug,
        market: coin.dexScreener
          ? await dexscreenerService.getTokenMarketData(coin.dexScreener)
          : null,
      })),
    );

    const markets: Record<string, unknown> = {};
    const media: Record<string, CoinMedia> = {};
    const unavailable: string[] = [];
    const mediaUpdates: Promise<unknown>[] = [];

    results.forEach((result, index) => {
      const coin = COIN.catCoins.coins[index];
      if (!coin) return;
      const storedMedia = cachedMedia[coin.slug] ?? {
        imageUrl: null,
        headerUrl: null,
        openGraphUrl: null,
      };

      if (result.status === "fulfilled") {
        const market = result.value.market;
        markets[coin.slug] = market;
        media[coin.slug] = {
          imageUrl: storedMedia.imageUrl ?? market?.imageUrl ?? null,
          headerUrl: storedMedia.headerUrl ?? market?.headerUrl ?? null,
          openGraphUrl:
            storedMedia.openGraphUrl ?? market?.openGraphUrl ?? null,
        };

        if (
          market &&
          ((!storedMedia.imageUrl && market.imageUrl) ||
            (!storedMedia.headerUrl && market.headerUrl) ||
            (!storedMedia.openGraphUrl && market.openGraphUrl))
        ) {
          mediaUpdates.push(
            sql`
              UPDATE cat_coins
              SET
                image_url = COALESCE(image_url, ${market.imageUrl}),
                header_url = COALESCE(header_url, ${market.headerUrl}),
                open_graph_url = COALESCE(open_graph_url, ${market.openGraphUrl})
              WHERE slug = ${coin.slug}
            `,
          );
        }
      } else {
        console.error(
          `Unable to fetch Dexscreener data for ${coin.slug}:`,
          result.reason,
        );
        markets[coin.slug] = null;
        media[coin.slug] = storedMedia;
        unavailable.push(coin.slug);
      }
    });

    await Promise.all(mediaUpdates);

    return { markets, media, unavailable };
  },
  {
    maxAge: 60,
    name: "cat-coin-markets",
  },
);
