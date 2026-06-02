import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "channel_pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"channel_pages_id" integer,
  	"content_pages_id" integer
  );
  
  CREATE TABLE "media_folders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "channel_pages_cards" ALTER COLUMN "link" DROP NOT NULL;
  ALTER TABLE "media" ADD COLUMN "folder_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_folders_id" integer;
  ALTER TABLE "channel_pages_rels" ADD CONSTRAINT "channel_pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."channel_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "channel_pages_rels" ADD CONSTRAINT "channel_pages_rels_channel_pages_fk" FOREIGN KEY ("channel_pages_id") REFERENCES "public"."channel_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "channel_pages_rels" ADD CONSTRAINT "channel_pages_rels_content_pages_fk" FOREIGN KEY ("content_pages_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_parent_id_media_folders_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media_folders"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "channel_pages_rels_order_idx" ON "channel_pages_rels" USING btree ("order");
  CREATE INDEX "channel_pages_rels_parent_idx" ON "channel_pages_rels" USING btree ("parent_id");
  CREATE INDEX "channel_pages_rels_path_idx" ON "channel_pages_rels" USING btree ("path");
  CREATE INDEX "channel_pages_rels_channel_pages_id_idx" ON "channel_pages_rels" USING btree ("channel_pages_id");
  CREATE INDEX "channel_pages_rels_content_pages_id_idx" ON "channel_pages_rels" USING btree ("content_pages_id");
  CREATE INDEX "media_folders_parent_idx" ON "media_folders" USING btree ("parent_id");
  CREATE INDEX "media_folders_updated_at_idx" ON "media_folders" USING btree ("updated_at");
  CREATE INDEX "media_folders_created_at_idx" ON "media_folders" USING btree ("created_at");
  ALTER TABLE "media" ADD CONSTRAINT "media_folder_id_media_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."media_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_folders_fk" FOREIGN KEY ("media_folders_id") REFERENCES "public"."media_folders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_folder_idx" ON "media" USING btree ("folder_id");
  CREATE INDEX "payload_locked_documents_rels_media_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("media_folders_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "channel_pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media_folders" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "channel_pages_rels" CASCADE;
  DROP TABLE "media_folders" CASCADE;
  ALTER TABLE "media" DROP CONSTRAINT "media_folder_id_media_folders_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_folders_fk";
  
  DROP INDEX "media_folder_idx";
  DROP INDEX "payload_locked_documents_rels_media_folders_id_idx";
  ALTER TABLE "channel_pages_cards" ALTER COLUMN "link" SET NOT NULL;
  ALTER TABLE "media" DROP COLUMN "folder_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "media_folders_id";`)
}
