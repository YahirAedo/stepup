-- CreateIndex
CREATE INDEX "steps_task_id_order_index_idx" ON "steps"("task_id", "order_index");

-- CreateIndex
CREATE INDEX "steps_task_id_status_idx" ON "steps"("task_id", "status");

-- CreateIndex
CREATE INDEX "steps_task_id_updated_at_idx" ON "steps"("task_id", "updated_at");
