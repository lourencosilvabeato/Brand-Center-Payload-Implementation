import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "custom_roles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"allowed_menu_items" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "external_users" ADD COLUMN "custom_role_id" integer;
  ALTER TABLE "external_users" ADD COLUMN "allowed_menu_items" jsonb;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "custom_roles_id" integer;
  CREATE UNIQUE INDEX "custom_roles_name_idx" ON "custom_roles" USING btree ("name");
  CREATE INDEX "custom_roles_updated_at_idx" ON "custom_roles" USING btree ("updated_at");
  CREATE INDEX "custom_roles_created_at_idx" ON "custom_roles" USING btree ("created_at");
  ALTER TABLE "external_users" ADD CONSTRAINT "external_users_custom_role_id_custom_roles_id_fk" FOREIGN KEY ("custom_role_id") REFERENCES "public"."custom_roles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_custom_roles_fk" FOREIGN KEY ("custom_roles_id") REFERENCES "public"."custom_roles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "external_users_custom_role_idx" ON "external_users" USING btree ("custom_role_id");
  CREATE INDEX "payload_locked_documents_rels_custom_roles_id_idx" ON "payload_locked_documents_rels" USING btree ("custom_roles_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "custom_roles" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "custom_roles" CASCADE;
  ALTER TABLE "external_users" DROP CONSTRAINT "external_users_custom_role_id_custom_roles_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_custom_roles_fk";
  
  DROP INDEX "external_users_custom_role_idx";
  DROP INDEX "payload_locked_documents_rels_custom_roles_id_idx";
  ALTER TABLE "external_users" DROP COLUMN "custom_role_id";
  ALTER TABLE "external_users" DROP COLUMN "allowed_menu_items";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "custom_roles_id";`)
}
