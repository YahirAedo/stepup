-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('active', 'completed');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('pending', 'completed');

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "steps" (
    "id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "duration_min" INTEGER,
    "order_index" INTEGER NOT NULL,
    "status" "StepStatus" NOT NULL DEFAULT 'pending',
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_progress" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "steps_completed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "daily_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_progress_date_key" ON "daily_progress"("date");

-- AddForeignKey
ALTER TABLE "steps" ADD CONSTRAINT "steps_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
