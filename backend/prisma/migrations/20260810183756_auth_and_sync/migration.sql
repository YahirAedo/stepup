-- Migración auth_and_sync — idempotente sobre bases con datos
-- Estrategia: columnas nuevas se agregan NULL → backfill → SET NOT NULL.
--   * tasks.user_id / daily_progress.user_id → usuario legacy interno
--   * tasks.updated_at / steps.updated_at    → created_at

-- DropForeignKey
ALTER TABLE "steps" DROP CONSTRAINT "steps_task_id_fkey";

-- DropIndex
DROP INDEX "daily_progress_date_key";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_email_key" UNIQUE ("email")
);

-- AlterTable: daily_progress.user_id (nullable primero)
ALTER TABLE "daily_progress" ADD COLUMN "user_id" TEXT;

-- AlterTable: steps.updated_at (nullable primero)
ALTER TABLE "steps" DROP CONSTRAINT "steps_pkey",
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMP(3),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "task_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "steps_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "steps_id_seq";

-- AlterTable: tasks.updated_at + user_id (nullable primero)
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_pkey",
ADD COLUMN "updated_at" TIMESTAMP(3),
ADD COLUMN "user_id" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "tasks_id_seq";

-- Backfill: crear usuario legacy para los registros huérfanos
INSERT INTO "users" ("id", "name", "email", "password", "created_at")
VALUES ('00000000-0000-4000-8000-000000000001', 'Legacy', 'legacy@stepup.app', '!', CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING;

-- Backfill: asignar el usuario legacy a los datos preexistentes
UPDATE "tasks" SET "user_id" = '00000000-0000-4000-8000-000000000001' WHERE "user_id" IS NULL;
UPDATE "daily_progress" SET "user_id" = '00000000-0000-4000-8000-000000000001' WHERE "user_id" IS NULL;

-- Backfill: timestamps desde created_at
UPDATE "tasks" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL;
UPDATE "steps" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL;

-- SET NOT NULL
ALTER TABLE "tasks" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "tasks" ALTER COLUMN "updated_at" SET NOT NULL;
ALTER TABLE "steps" ALTER COLUMN "updated_at" SET NOT NULL;
ALTER TABLE "daily_progress" ALTER COLUMN "user_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "daily_progress_user_id_date_key" ON "daily_progress"("user_id", "date");

-- CreateIndex
CREATE INDEX "tasks_user_id_updated_at_idx" ON "tasks"("user_id", "updated_at");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "steps" ADD CONSTRAINT "steps_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_progress" ADD CONSTRAINT "daily_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
