ALTER TABLE cat_coins
  ADD COLUMN IF NOT EXISTS chain_id TEXT,
  ADD COLUMN IF NOT EXISTS contract_address TEXT;

ALTER TABLE cat_coins
  DROP CONSTRAINT IF EXISTS cat_coins_ticker_key;

INSERT INTO cat_coins (slug, name, ticker, chain, vote_count)
SELECT 'simons-cat', name, ticker, chain, vote_count
FROM cat_coins
WHERE slug = 'cat'
ON CONFLICT (slug) DO NOTHING;

UPDATE cat_coin_votes
SET coin_slug = 'simons-cat'
WHERE coin_slug = 'cat';

DELETE FROM cat_coins WHERE slug = 'cat';

INSERT INTO cat_coins (
  slug,
  name,
  ticker,
  chain,
  chain_id,
  contract_address,
  vote_count
)
VALUES
  ('popcat', 'Popcat', '$POPCAT', 'Solana', 'solana', 'Cpnm1fZUjm48M54Gaae2kwQfMgHX9NZHozhyVb55rfyD', 12846),
  ('mew', 'cat in a dogs world', '$MEW', 'Solana', 'solana', 'MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5', 10531),
  ('mog', 'Mog Coin', '$MOG', 'Ethereum', 'ethereum', '0xaaee1a9723aadb7afa2810263653a34ba2c21c7a', 8907),
  ('toshi', 'Toshi', '$TOSHI', 'Base', 'base', '0xac1bd2486aaf3b5c0fc3fd868558b082a531b2b4', 7684),
  ('simons-cat', 'Simon''s Cat', '$CAT', 'BNB Chain', 'bsc', '0x6894CDe390a3f51155ea41Ed24a33A4827d3063D', 6295),
  ('wen', 'Wen', '$WEN', 'Solana', 'solana', 'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk', 0),
  ('michi', 'michi', '$MICHI', 'Solana', 'solana', 'AywAYdNJnSLSXwKWYxDciPjqGRnwp4iZdQptuuQTpump', 0),
  ('miggles', 'Mr. Miggles', '$MIGGLES', 'Base', 'base', '0xB1a03EdA10342529bBF8EB700a06C60441fEf25d', 0),
  ('keycat', 'Keyboard Cat', '$KEYCAT', 'Base', 'base', '0x9a26F5433671751C3276a065f57e5a02D2817973', 0),
  ('catcoin', 'Catcoin', '$CAT', 'BNB Chain', 'bsc', '0x59F4F336Bf3D0C49dBfbA4A74eBD2a6aCE40539A', 0),
  ('shark-cat', 'Shark Cat', '$SC', 'Solana', 'solana', '6D7NaB2xsLd7cauWu1wKk6KBsJohJmP2qZH9GEfVi5Ui', 0),
  ('nubcat', 'nubcat', '$NUB', 'Solana', 'solana', 'Eowmevno7iY2mdPZ7XVr7xLVDCTmqtnypDfjXHYTTNZ', 0),
  ('omnicat', 'OmniCat', '$OMNI', 'Ethereum', 'ethereum', '0x9e20461bc2c4c980f62f1b279d71734207a6a356', 0),
  ('pajamas', 'Pajamas Cat', '$PAJAMAS', 'Solana', 'solana', 'FvER7SsvY5GqAMawf7Qfb5MnUUmDdbPNPg4nCa4zHoLw', 0),
  ('ginnan', 'Ginnan The Cat', '$GINNAN', 'Solana', 'solana', 'GinNabffZL4fUj9Vactxha74GDAW8kDPGaHqMtMzps2f', 0),
  ('nacho', 'Nacho the Kat', '$NACHO', 'Kaspa', NULL, NULL, 0),
  ('maneki', 'Maneki', '$MANEKI', 'Solana', 'solana', '25hAyBQfoDhfWx9ay6rarbgvWGwDdNqcHsXS3jQ3mTDJ', 0),
  ('chonky', 'Chonky', '$CHONKY', 'Solana', 'solana', '2MwjFE1zbXyNKw6VjzGWa3BhPtFcs8htuX2xwRAtbonk', 0),
  ('catecoin', 'CateCoin', '$CATE', 'BNB Chain', 'bsc', '0xE4FAE3Faa8300810C835970b9187c268f55D998F', 0),
  ('reca', 'The Resistance Cat', '$RECA', 'TON', 'ton', 'EQBwHOvf3UrPPJB7jeDHaOT-2vP0QQlDoEDBsgfv5XF75J3j', 0),
  ('happy-cat', 'Happy Cat', '$HAPPY', 'Solana', 'solana', 'HAPPYwgFcjEJDzRtfWE6tiHE9zGdzpNky2FvjPHsvvGZ', 0),
  ('roaring-kitty', 'Roaring Kitty', '$KITTY', 'Solana', 'solana', '4N4DnNo3qpPks9aQCkcWkzoir8tnvT6diS4TnnZibonk', 0),
  ('loaf', 'Loaf Token', '$LOAF', 'Solana', 'solana', '3de2yRhtD4VbJBb8EQAQffYMPLU4EnSHT1eveBwiL3tn', 0),
  ('giko', 'Giko Cat', '$GIKO', 'Solana', 'solana', '3WPep4ufaToK1aS5s8BL9inzeUrt4DYaQCiic6ZkkC1U', 0),
  ('bitcoin-cats', 'Bitcoin Cats', '$1CAT', 'Ethereum', 'ethereum', '0x508E00D5ceF397B02d260D035e5EE80775e4C821', 0),
  ('catszn', 'Cat Season', '$CATSZN', 'Solana', NULL, NULL, 14203)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  ticker = EXCLUDED.ticker,
  chain = EXCLUDED.chain,
  chain_id = EXCLUDED.chain_id,
  contract_address = EXCLUDED.contract_address;

CREATE UNIQUE INDEX IF NOT EXISTS cat_coins_chain_contract_unique
  ON cat_coins (chain_id, contract_address)
  WHERE contract_address IS NOT NULL;
