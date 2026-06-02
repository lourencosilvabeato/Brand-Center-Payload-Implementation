import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "content_pages_blocks_checkmarks_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "content_pages_blocks_checkmarks_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_crosses_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "content_pages_blocks_crosses_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  ALTER TABLE "content_pages_blocks_checkmarks_block_items" ADD CONSTRAINT "content_pages_blocks_checkmarks_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages_blocks_checkmarks_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_checkmarks_block" ADD CONSTRAINT "content_pages_blocks_checkmarks_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_crosses_block_items" ADD CONSTRAINT "content_pages_blocks_crosses_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages_blocks_crosses_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_crosses_block" ADD CONSTRAINT "content_pages_blocks_crosses_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "content_pages_blocks_checkmarks_block_items_order_idx" ON "content_pages_blocks_checkmarks_block_items" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_checkmarks_block_items_parent_id_idx" ON "content_pages_blocks_checkmarks_block_items" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_checkmarks_block_order_idx" ON "content_pages_blocks_checkmarks_block" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_checkmarks_block_parent_id_idx" ON "content_pages_blocks_checkmarks_block" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_checkmarks_block_path_idx" ON "content_pages_blocks_checkmarks_block" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_crosses_block_items_order_idx" ON "content_pages_blocks_crosses_block_items" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_crosses_block_items_parent_id_idx" ON "content_pages_blocks_crosses_block_items" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_crosses_block_order_idx" ON "content_pages_blocks_crosses_block" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_crosses_block_parent_id_idx" ON "content_pages_blocks_crosses_block" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_crosses_block_path_idx" ON "content_pages_blocks_crosses_block" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "content_pages_blocks_checkmarks_block_items" CASCADE;
  DROP TABLE "content_pages_blocks_checkmarks_block" CASCADE;
  DROP TABLE "content_pages_blocks_crosses_block_items" CASCADE;
  DROP TABLE "content_pages_blocks_crosses_block" CASCADE;`)
}
