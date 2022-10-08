CREATE TABLE IF NOT EXISTS stores (
  key varchar(100) NOT NULL PRIMARY KEY,
  value varchar(500) NOT NULL,
  ttl bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_key_ttl ON stores (ttl);