ALTER TABLE cat_coin_votes
  DROP CONSTRAINT IF EXISTS cat_coin_votes_poll_key_visitor_id_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cat_coin_votes_poll_visitor_coin_key'
  ) THEN
    ALTER TABLE cat_coin_votes
      ADD CONSTRAINT cat_coin_votes_poll_visitor_coin_key
      UNIQUE (poll_key, visitor_id, coin_slug);
  END IF;
END
$$;
