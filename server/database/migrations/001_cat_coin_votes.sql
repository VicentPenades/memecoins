CREATE TABLE IF NOT EXISTS cat_coins (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT NOT NULL UNIQUE,
  chain TEXT NOT NULL,
  vote_count INTEGER NOT NULL DEFAULT 0 CHECK (vote_count >= 0)
);

CREATE TABLE IF NOT EXISTS cat_coin_votes (
  id BIGSERIAL PRIMARY KEY,
  poll_key TEXT NOT NULL,
  coin_slug TEXT NOT NULL REFERENCES cat_coins(slug),
  visitor_id UUID NOT NULL,
  ip_hash CHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (poll_key, visitor_id)
);

CREATE INDEX IF NOT EXISTS cat_coin_votes_ip_rate_limit_idx
  ON cat_coin_votes (poll_key, ip_hash, created_at DESC);

INSERT INTO cat_coins (slug, name, ticker, chain, vote_count)
VALUES
  ('popcat', 'Popcat', '$POPCAT', 'Solana', 12846),
  ('mew', 'cat in a dogs world', '$MEW', 'Solana', 10531),
  ('mog', 'Mog Coin', '$MOG', 'Ethereum', 8907),
  ('toshi', 'Toshi', '$TOSHI', 'Base', 7684),
  ('cat', 'Simon''s Cat', '$CAT', 'BNB Chain', 6295),
  ('catszn', 'Cat Season', '$CATSZN', 'Solana', 14203)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  ticker = EXCLUDED.ticker,
  chain = EXCLUDED.chain;
