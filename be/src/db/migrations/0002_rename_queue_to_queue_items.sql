-- Rename queues table to queue_items
ALTER TABLE "queues" RENAME TO "queue_items";

-- Rename custom_payload column to metadata
ALTER TABLE "queue_items" RENAME COLUMN "custom_payload" TO "metadata";
