import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_content_pages_blocks_collection_card_block_card_model" AS ENUM('large', 'small');
  ALTER TABLE "content_pages_blocks_collection_card_block_assets" ADD COLUMN "asset_description" jsonb;
  ALTER TABLE "content_pages_blocks_collection_card_block" ADD COLUMN "slug" varchar;
  ALTER TABLE "content_pages_blocks_collection_card_block" ADD COLUMN "card_model" "enum_content_pages_blocks_collection_card_block_card_model" DEFAULT 'large' NOT NULL;
  ALTER TABLE "content_pages_blocks_collection_card_block" ADD COLUMN "description" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "content_pages_blocks_collection_card_block_assets" DROP COLUMN "asset_description";
  ALTER TABLE "content_pages_blocks_collection_card_block" DROP COLUMN "slug";
  ALTER TABLE "content_pages_blocks_collection_card_block" DROP COLUMN "card_model";
  ALTER TABLE "content_pages_blocks_collection_card_block" DROP COLUMN "description";
  DROP TYPE "public"."enum_content_pages_blocks_collection_card_block_card_model";`)
}
