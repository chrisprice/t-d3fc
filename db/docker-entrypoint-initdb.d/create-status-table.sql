/* Create table using jsonb for performance */
CREATE TABLE IF NOT EXISTS statuses ( status jsonb );
/* Create GIN index to allow efficient querying of JSON object */
CREATE INDEX IF NOT EXISTS statuses_index ON statuses USING GIN ( status jsonb_path_ops );
/* Create unique index of id_str as we'll use it as our key */
CREATE UNIQUE INDEX IF NOT EXISTS statuses_id_str ON statuses ( (status->>'id_str') );
/* Create constraint to prevent null key */
ALTER TABLE statuses DROP CONSTRAINT IF EXISTS statuses_id_str_not_null;
ALTER TABLE statuses ADD CONSTRAINT statuses_id_str_not_null CHECK ( ( status->>'id_str' ) IS NOT NULL );
