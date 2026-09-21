import { useDatabase } from "../../utils/database";
import {
  CAT_COIN_POLL_KEY,
  getExistingVisitorId,
} from "../../utils/voting";

type CoinVoteRow = {
  slug: string;
  name: string;
  ticker: string;
  chain: string;
  vote_count: number;
};

export default defineEventHandler(async (event) => {
  const sql = useDatabase(event);
  const visitorId = getExistingVisitorId(event);

  const coins = await sql<CoinVoteRow[]>`
    SELECT slug, name, ticker, chain, vote_count
    FROM cat_coins
    ORDER BY vote_count DESC, slug ASC
  `;

  let votedSlugs: string[] = [];
  if (visitorId) {
    const votes = await sql<{ slug: string }[]>`
      SELECT coin.slug
      FROM cat_coin_votes AS vote
      JOIN cat_coins AS coin ON coin.slug = vote.coin_slug
      WHERE vote.poll_key = ${CAT_COIN_POLL_KEY}
        AND vote.visitor_id = ${visitorId}
    `;
    votedSlugs = votes.map((vote) => vote.slug);
  }

  return {
    coins: coins.map(({ slug, name, ticker, chain }) => ({
      slug,
      name,
      ticker,
      chain,
    })),
    votes: Object.fromEntries(
      coins.map((coin) => [coin.slug, coin.vote_count]),
    ),
    votedSlugs,
  };
});
