-- AlterTable
ALTER TABLE "users" ADD COLUMN     "migrate_maps" TEXT,
ADD COLUMN     "migrate_request_hash" TEXT;

-- Cleanup: eliminar el usuario artificial de scope de idempotencia de migrate
-- (y sus idempotency_keys por cascade), ya no se usa
DELETE FROM "users" WHERE "email" = 'idempotency-migrate@internal.stepup';
