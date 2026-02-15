CREATE TABLE "queue_boards" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "queue_statuses" (
	"id" text PRIMARY KEY NOT NULL,
	"board_id" text NOT NULL,
	"label" text NOT NULL,
	"color" text NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "queues" (
	"id" text PRIMARY KEY NOT NULL,
	"board_id" text NOT NULL,
	"queue_number" text NOT NULL,
	"name" text NOT NULL,
	"service" text,
	"status_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"custom_payload" jsonb
);
--> statement-breakpoint
ALTER TABLE "queue_statuses" ADD CONSTRAINT "queue_statuses_board_id_queue_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."queue_boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queues" ADD CONSTRAINT "queues_board_id_queue_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."queue_boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queues" ADD CONSTRAINT "queues_status_id_queue_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."queue_statuses"("id") ON DELETE restrict ON UPDATE no action;