import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_platform_users_role" AS ENUM('admin', 'localAdmin', 'internal');
  CREATE TYPE "public"."enum_external_users_role" AS ENUM('external');
  CREATE TYPE "public"."enum_content_pages_blocks_note_block_type" AS ENUM('info', 'warning');
  CREATE TYPE "public"."enum_content_pages_blocks_grid_block_columns" AS ENUM('1', '2', '3', '4', '6');
  CREATE TYPE "public"."enum_content_pages_blocks_collection_card_block_card_model" AS ENUM('large', 'small');
  CREATE TYPE "public"."enum_content_pages_blocks_divider_block_variant" AS ENUM('short', 'long');
  CREATE TYPE "public"."enum_legal_pages_blocks_note_block_type" AS ENUM('info', 'warning');
  CREATE TYPE "public"."enum_legal_pages_blocks_divider_block_variant" AS ENUM('short', 'long');
  CREATE TABLE "platform_users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "platform_users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_name" varchar,
  	"role" "enum_platform_users_role" DEFAULT 'internal' NOT NULL,
  	"azure_id" varchar,
  	"avatar_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "external_users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "external_users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_external_users_role" DEFAULT 'external' NOT NULL,
  	"custom_role_id" integer,
  	"allowed_menu_items" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "custom_roles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"allowed_menu_items" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "invitations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"token_hash" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"used" boolean DEFAULT false,
  	"cancelled" boolean DEFAULT false,
  	"invited_by_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "password_resets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"token_hash" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"used" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "channel_pages_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "channel_pages_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"excerpt" varchar,
  	"image_id" integer,
  	"link" varchar NOT NULL
  );
  
  CREATE TABLE "channel_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"excerpt" varchar,
  	"description" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "content_pages_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar,
  	"file_id" integer
  );
  
  CREATE TABLE "content_pages_blocks_section_block_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar,
  	"file_id" integer
  );
  
  CREATE TABLE "content_pages_blocks_section_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"title" varchar NOT NULL,
  	"anchor_name" varchar,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_quote_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"attribution" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_note_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_content_pages_blocks_note_block_type" DEFAULT 'info' NOT NULL,
  	"title" varchar,
  	"content" jsonb NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_table_block_rows_cells" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" varchar,
  	"is_header" boolean DEFAULT false
  );
  
  CREATE TABLE "content_pages_blocks_table_block_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "content_pages_blocks_table_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_grid_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"button_label" varchar,
  	"button_url" varchar,
  	"button_file_id" integer
  );
  
  CREATE TABLE "content_pages_blocks_grid_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"columns" "enum_content_pages_blocks_grid_block_columns" DEFAULT '3' NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_collection_card_block_assets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"asset_description" jsonb
  );
  
  CREATE TABLE "content_pages_blocks_collection_card_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"card_model" "enum_content_pages_blocks_collection_card_block_card_model" DEFAULT 'large' NOT NULL,
  	"description" jsonb,
  	"label" varchar,
  	"download_file_id" integer,
  	"detail_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_divider_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_content_pages_blocks_divider_block_variant" DEFAULT 'short' NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_icon_library_block_items_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar NOT NULL
  );
  
  CREATE TABLE "content_pages_blocks_icon_library_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"icon_id" integer NOT NULL,
  	"icon_file_id" integer
  );
  
  CREATE TABLE "content_pages_blocks_icon_library_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" jsonb,
  	"download_file_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"header_anchor_name" varchar NOT NULL,
  	"excerpt" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "legal_pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "legal_pages_blocks_quote_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"attribution" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "legal_pages_blocks_note_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_legal_pages_blocks_note_block_type" DEFAULT 'info' NOT NULL,
  	"title" varchar,
  	"content" jsonb NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "legal_pages_blocks_table_block_rows_cells" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" varchar,
  	"is_header" boolean DEFAULT false
  );
  
  CREATE TABLE "legal_pages_blocks_table_block_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "legal_pages_blocks_table_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "legal_pages_blocks_divider_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_legal_pages_blocks_divider_block_variant" DEFAULT 'short' NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "legal_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "protected_files" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"platform_users_id" integer,
  	"external_users_id" integer,
  	"custom_roles_id" integer,
  	"invitations_id" integer,
  	"password_resets_id" integer,
  	"channel_pages_id" integer,
  	"content_pages_id" integer,
  	"legal_pages_id" integer,
  	"media_id" integer,
  	"protected_files_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"platform_users_id" integer,
  	"external_users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_page_new_in_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"link" varchar,
  	"new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "home_page_quick_access_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"link" varchar,
  	"new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "home_page_help_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"new_tab" boolean DEFAULT false,
  	"enabled" boolean DEFAULT true
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_image_id" integer NOT NULL,
  	"hero_headline" varchar NOT NULL,
  	"hero_intro_text" varchar,
  	"new_in_title" varchar DEFAULT 'NEW IN' NOT NULL,
  	"new_in_body" varchar,
  	"quick_access_title" varchar DEFAULT 'QUICK ACCESS' NOT NULL,
  	"quick_access_body" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_items_children_l3_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"page_id" integer
  );
  
  CREATE TABLE "navigation_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"show_as_search_filter" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"show_as_search_filter" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"channel_pages_id" integer,
  	"content_pages_id" integer
  );
  
  CREATE TABLE "footer_settings_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon_id" integer NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "footer_settings_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"page_id" integer,
  	"url" varchar
  );
  
  CREATE TABLE "footer_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"brand_name" varchar,
  	"contact_email" varchar,
  	"copyright" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "login_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"title" varchar,
  	"introduction" varchar,
  	"subtitle" varchar,
  	"change_password_title" varchar,
  	"change_password_introduction" varchar,
  	"institutional_link_label" varchar,
  	"institutional_link_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "platform_users_sessions" ADD CONSTRAINT "platform_users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."platform_users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "external_users_sessions" ADD CONSTRAINT "external_users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."external_users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "external_users" ADD CONSTRAINT "external_users_custom_role_id_custom_roles_id_fk" FOREIGN KEY ("custom_role_id") REFERENCES "public"."custom_roles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_id_platform_users_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."platform_users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_external_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."external_users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "channel_pages_buttons" ADD CONSTRAINT "channel_pages_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."channel_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "channel_pages_cards" ADD CONSTRAINT "channel_pages_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "channel_pages_cards" ADD CONSTRAINT "channel_pages_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."channel_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_buttons" ADD CONSTRAINT "content_pages_buttons_file_id_protected_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."protected_files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_buttons" ADD CONSTRAINT "content_pages_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_section_block_buttons" ADD CONSTRAINT "content_pages_blocks_section_block_buttons_file_id_protected_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."protected_files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_section_block_buttons" ADD CONSTRAINT "content_pages_blocks_section_block_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages_blocks_section_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_section_block" ADD CONSTRAINT "content_pages_blocks_section_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_rich_text" ADD CONSTRAINT "content_pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_quote_block" ADD CONSTRAINT "content_pages_blocks_quote_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_note_block" ADD CONSTRAINT "content_pages_blocks_note_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_table_block_rows_cells" ADD CONSTRAINT "content_pages_blocks_table_block_rows_cells_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages_blocks_table_block_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_table_block_rows" ADD CONSTRAINT "content_pages_blocks_table_block_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages_blocks_table_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_table_block" ADD CONSTRAINT "content_pages_blocks_table_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_grid_block_items" ADD CONSTRAINT "content_pages_blocks_grid_block_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_grid_block_items" ADD CONSTRAINT "content_pages_blocks_grid_block_items_button_file_id_protected_files_id_fk" FOREIGN KEY ("button_file_id") REFERENCES "public"."protected_files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_grid_block_items" ADD CONSTRAINT "content_pages_blocks_grid_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages_blocks_grid_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_grid_block" ADD CONSTRAINT "content_pages_blocks_grid_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_collection_card_block_assets" ADD CONSTRAINT "content_pages_blocks_collection_card_block_assets_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_collection_card_block_assets" ADD CONSTRAINT "content_pages_blocks_collection_card_block_assets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages_blocks_collection_card_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_collection_card_block" ADD CONSTRAINT "content_pages_blocks_collection_card_block_download_file_id_protected_files_id_fk" FOREIGN KEY ("download_file_id") REFERENCES "public"."protected_files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_collection_card_block" ADD CONSTRAINT "content_pages_blocks_collection_card_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_divider_block" ADD CONSTRAINT "content_pages_blocks_divider_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_icon_library_block_items_tags" ADD CONSTRAINT "content_pages_blocks_icon_library_block_items_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages_blocks_icon_library_block_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_icon_library_block_items" ADD CONSTRAINT "content_pages_blocks_icon_library_block_items_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_icon_library_block_items" ADD CONSTRAINT "content_pages_blocks_icon_library_block_items_icon_file_id_protected_files_id_fk" FOREIGN KEY ("icon_file_id") REFERENCES "public"."protected_files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_icon_library_block_items" ADD CONSTRAINT "content_pages_blocks_icon_library_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages_blocks_icon_library_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_icon_library_block" ADD CONSTRAINT "content_pages_blocks_icon_library_block_download_file_id_protected_files_id_fk" FOREIGN KEY ("download_file_id") REFERENCES "public"."protected_files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_icon_library_block" ADD CONSTRAINT "content_pages_blocks_icon_library_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "legal_pages_blocks_rich_text" ADD CONSTRAINT "legal_pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "legal_pages_blocks_quote_block" ADD CONSTRAINT "legal_pages_blocks_quote_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "legal_pages_blocks_note_block" ADD CONSTRAINT "legal_pages_blocks_note_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "legal_pages_blocks_table_block_rows_cells" ADD CONSTRAINT "legal_pages_blocks_table_block_rows_cells_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legal_pages_blocks_table_block_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "legal_pages_blocks_table_block_rows" ADD CONSTRAINT "legal_pages_blocks_table_block_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legal_pages_blocks_table_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "legal_pages_blocks_table_block" ADD CONSTRAINT "legal_pages_blocks_table_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "legal_pages_blocks_divider_block" ADD CONSTRAINT "legal_pages_blocks_divider_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_platform_users_fk" FOREIGN KEY ("platform_users_id") REFERENCES "public"."platform_users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_external_users_fk" FOREIGN KEY ("external_users_id") REFERENCES "public"."external_users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_custom_roles_fk" FOREIGN KEY ("custom_roles_id") REFERENCES "public"."custom_roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_invitations_fk" FOREIGN KEY ("invitations_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_password_resets_fk" FOREIGN KEY ("password_resets_id") REFERENCES "public"."password_resets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_channel_pages_fk" FOREIGN KEY ("channel_pages_id") REFERENCES "public"."channel_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_content_pages_fk" FOREIGN KEY ("content_pages_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_legal_pages_fk" FOREIGN KEY ("legal_pages_id") REFERENCES "public"."legal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_protected_files_fk" FOREIGN KEY ("protected_files_id") REFERENCES "public"."protected_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_platform_users_fk" FOREIGN KEY ("platform_users_id") REFERENCES "public"."platform_users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_external_users_fk" FOREIGN KEY ("external_users_id") REFERENCES "public"."external_users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_new_in_items" ADD CONSTRAINT "home_page_new_in_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_new_in_items" ADD CONSTRAINT "home_page_new_in_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_quick_access_items" ADD CONSTRAINT "home_page_quick_access_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_quick_access_items" ADD CONSTRAINT "home_page_quick_access_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_help_buttons" ADD CONSTRAINT "home_page_help_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_items_children_l3_items" ADD CONSTRAINT "navigation_items_children_l3_items_page_id_content_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."content_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_items_children_l3_items" ADD CONSTRAINT "navigation_items_children_l3_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_items_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items_children" ADD CONSTRAINT "navigation_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_channel_pages_fk" FOREIGN KEY ("channel_pages_id") REFERENCES "public"."channel_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_content_pages_fk" FOREIGN KEY ("content_pages_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_settings_social_links" ADD CONSTRAINT "footer_settings_social_links_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_settings_social_links" ADD CONSTRAINT "footer_settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_settings_legal_links" ADD CONSTRAINT "footer_settings_legal_links_page_id_legal_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."legal_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_settings_legal_links" ADD CONSTRAINT "footer_settings_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "login_settings" ADD CONSTRAINT "login_settings_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "platform_users_sessions_order_idx" ON "platform_users_sessions" USING btree ("_order");
  CREATE INDEX "platform_users_sessions_parent_id_idx" ON "platform_users_sessions" USING btree ("_parent_id");
  CREATE INDEX "platform_users_updated_at_idx" ON "platform_users" USING btree ("updated_at");
  CREATE INDEX "platform_users_created_at_idx" ON "platform_users" USING btree ("created_at");
  CREATE UNIQUE INDEX "platform_users_email_idx" ON "platform_users" USING btree ("email");
  CREATE INDEX "external_users_sessions_order_idx" ON "external_users_sessions" USING btree ("_order");
  CREATE INDEX "external_users_sessions_parent_id_idx" ON "external_users_sessions" USING btree ("_parent_id");
  CREATE INDEX "external_users_custom_role_idx" ON "external_users" USING btree ("custom_role_id");
  CREATE INDEX "external_users_updated_at_idx" ON "external_users" USING btree ("updated_at");
  CREATE INDEX "external_users_created_at_idx" ON "external_users" USING btree ("created_at");
  CREATE UNIQUE INDEX "external_users_email_idx" ON "external_users" USING btree ("email");
  CREATE UNIQUE INDEX "custom_roles_name_idx" ON "custom_roles" USING btree ("name");
  CREATE INDEX "custom_roles_updated_at_idx" ON "custom_roles" USING btree ("updated_at");
  CREATE INDEX "custom_roles_created_at_idx" ON "custom_roles" USING btree ("created_at");
  CREATE INDEX "invitations_invited_by_idx" ON "invitations" USING btree ("invited_by_id");
  CREATE INDEX "invitations_updated_at_idx" ON "invitations" USING btree ("updated_at");
  CREATE INDEX "invitations_created_at_idx" ON "invitations" USING btree ("created_at");
  CREATE INDEX "password_resets_user_idx" ON "password_resets" USING btree ("user_id");
  CREATE INDEX "password_resets_updated_at_idx" ON "password_resets" USING btree ("updated_at");
  CREATE INDEX "password_resets_created_at_idx" ON "password_resets" USING btree ("created_at");
  CREATE INDEX "channel_pages_buttons_order_idx" ON "channel_pages_buttons" USING btree ("_order");
  CREATE INDEX "channel_pages_buttons_parent_id_idx" ON "channel_pages_buttons" USING btree ("_parent_id");
  CREATE INDEX "channel_pages_cards_order_idx" ON "channel_pages_cards" USING btree ("_order");
  CREATE INDEX "channel_pages_cards_parent_id_idx" ON "channel_pages_cards" USING btree ("_parent_id");
  CREATE INDEX "channel_pages_cards_image_idx" ON "channel_pages_cards" USING btree ("image_id");
  CREATE UNIQUE INDEX "channel_pages_slug_idx" ON "channel_pages" USING btree ("slug");
  CREATE INDEX "channel_pages_updated_at_idx" ON "channel_pages" USING btree ("updated_at");
  CREATE INDEX "channel_pages_created_at_idx" ON "channel_pages" USING btree ("created_at");
  CREATE INDEX "content_pages_buttons_order_idx" ON "content_pages_buttons" USING btree ("_order");
  CREATE INDEX "content_pages_buttons_parent_id_idx" ON "content_pages_buttons" USING btree ("_parent_id");
  CREATE INDEX "content_pages_buttons_file_idx" ON "content_pages_buttons" USING btree ("file_id");
  CREATE INDEX "content_pages_blocks_section_block_buttons_order_idx" ON "content_pages_blocks_section_block_buttons" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_section_block_buttons_parent_id_idx" ON "content_pages_blocks_section_block_buttons" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_section_block_buttons_file_idx" ON "content_pages_blocks_section_block_buttons" USING btree ("file_id");
  CREATE INDEX "content_pages_blocks_section_block_order_idx" ON "content_pages_blocks_section_block" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_section_block_parent_id_idx" ON "content_pages_blocks_section_block" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_section_block_path_idx" ON "content_pages_blocks_section_block" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_rich_text_order_idx" ON "content_pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_rich_text_parent_id_idx" ON "content_pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_rich_text_path_idx" ON "content_pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_quote_block_order_idx" ON "content_pages_blocks_quote_block" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_quote_block_parent_id_idx" ON "content_pages_blocks_quote_block" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_quote_block_path_idx" ON "content_pages_blocks_quote_block" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_note_block_order_idx" ON "content_pages_blocks_note_block" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_note_block_parent_id_idx" ON "content_pages_blocks_note_block" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_note_block_path_idx" ON "content_pages_blocks_note_block" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_table_block_rows_cells_order_idx" ON "content_pages_blocks_table_block_rows_cells" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_table_block_rows_cells_parent_id_idx" ON "content_pages_blocks_table_block_rows_cells" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_table_block_rows_order_idx" ON "content_pages_blocks_table_block_rows" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_table_block_rows_parent_id_idx" ON "content_pages_blocks_table_block_rows" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_table_block_order_idx" ON "content_pages_blocks_table_block" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_table_block_parent_id_idx" ON "content_pages_blocks_table_block" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_table_block_path_idx" ON "content_pages_blocks_table_block" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_grid_block_items_order_idx" ON "content_pages_blocks_grid_block_items" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_grid_block_items_parent_id_idx" ON "content_pages_blocks_grid_block_items" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_grid_block_items_image_idx" ON "content_pages_blocks_grid_block_items" USING btree ("image_id");
  CREATE INDEX "content_pages_blocks_grid_block_items_button_button_file_idx" ON "content_pages_blocks_grid_block_items" USING btree ("button_file_id");
  CREATE INDEX "content_pages_blocks_grid_block_order_idx" ON "content_pages_blocks_grid_block" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_grid_block_parent_id_idx" ON "content_pages_blocks_grid_block" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_grid_block_path_idx" ON "content_pages_blocks_grid_block" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_collection_card_block_assets_order_idx" ON "content_pages_blocks_collection_card_block_assets" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_collection_card_block_assets_parent_id_idx" ON "content_pages_blocks_collection_card_block_assets" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_collection_card_block_assets_image_idx" ON "content_pages_blocks_collection_card_block_assets" USING btree ("image_id");
  CREATE INDEX "content_pages_blocks_collection_card_block_order_idx" ON "content_pages_blocks_collection_card_block" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_collection_card_block_parent_id_idx" ON "content_pages_blocks_collection_card_block" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_collection_card_block_path_idx" ON "content_pages_blocks_collection_card_block" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_collection_card_block_download_file_idx" ON "content_pages_blocks_collection_card_block" USING btree ("download_file_id");
  CREATE INDEX "content_pages_blocks_divider_block_order_idx" ON "content_pages_blocks_divider_block" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_divider_block_parent_id_idx" ON "content_pages_blocks_divider_block" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_divider_block_path_idx" ON "content_pages_blocks_divider_block" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_icon_library_block_items_tags_order_idx" ON "content_pages_blocks_icon_library_block_items_tags" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_icon_library_block_items_tags_parent_id_idx" ON "content_pages_blocks_icon_library_block_items_tags" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_icon_library_block_items_order_idx" ON "content_pages_blocks_icon_library_block_items" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_icon_library_block_items_parent_id_idx" ON "content_pages_blocks_icon_library_block_items" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_icon_library_block_items_icon_idx" ON "content_pages_blocks_icon_library_block_items" USING btree ("icon_id");
  CREATE INDEX "content_pages_blocks_icon_library_block_items_icon_file_idx" ON "content_pages_blocks_icon_library_block_items" USING btree ("icon_file_id");
  CREATE INDEX "content_pages_blocks_icon_library_block_order_idx" ON "content_pages_blocks_icon_library_block" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_icon_library_block_parent_id_idx" ON "content_pages_blocks_icon_library_block" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_icon_library_block_path_idx" ON "content_pages_blocks_icon_library_block" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_icon_library_block_download_file_idx" ON "content_pages_blocks_icon_library_block" USING btree ("download_file_id");
  CREATE UNIQUE INDEX "content_pages_slug_idx" ON "content_pages" USING btree ("slug");
  CREATE INDEX "content_pages_updated_at_idx" ON "content_pages" USING btree ("updated_at");
  CREATE INDEX "content_pages_created_at_idx" ON "content_pages" USING btree ("created_at");
  CREATE INDEX "legal_pages_blocks_rich_text_order_idx" ON "legal_pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "legal_pages_blocks_rich_text_parent_id_idx" ON "legal_pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "legal_pages_blocks_rich_text_path_idx" ON "legal_pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "legal_pages_blocks_quote_block_order_idx" ON "legal_pages_blocks_quote_block" USING btree ("_order");
  CREATE INDEX "legal_pages_blocks_quote_block_parent_id_idx" ON "legal_pages_blocks_quote_block" USING btree ("_parent_id");
  CREATE INDEX "legal_pages_blocks_quote_block_path_idx" ON "legal_pages_blocks_quote_block" USING btree ("_path");
  CREATE INDEX "legal_pages_blocks_note_block_order_idx" ON "legal_pages_blocks_note_block" USING btree ("_order");
  CREATE INDEX "legal_pages_blocks_note_block_parent_id_idx" ON "legal_pages_blocks_note_block" USING btree ("_parent_id");
  CREATE INDEX "legal_pages_blocks_note_block_path_idx" ON "legal_pages_blocks_note_block" USING btree ("_path");
  CREATE INDEX "legal_pages_blocks_table_block_rows_cells_order_idx" ON "legal_pages_blocks_table_block_rows_cells" USING btree ("_order");
  CREATE INDEX "legal_pages_blocks_table_block_rows_cells_parent_id_idx" ON "legal_pages_blocks_table_block_rows_cells" USING btree ("_parent_id");
  CREATE INDEX "legal_pages_blocks_table_block_rows_order_idx" ON "legal_pages_blocks_table_block_rows" USING btree ("_order");
  CREATE INDEX "legal_pages_blocks_table_block_rows_parent_id_idx" ON "legal_pages_blocks_table_block_rows" USING btree ("_parent_id");
  CREATE INDEX "legal_pages_blocks_table_block_order_idx" ON "legal_pages_blocks_table_block" USING btree ("_order");
  CREATE INDEX "legal_pages_blocks_table_block_parent_id_idx" ON "legal_pages_blocks_table_block" USING btree ("_parent_id");
  CREATE INDEX "legal_pages_blocks_table_block_path_idx" ON "legal_pages_blocks_table_block" USING btree ("_path");
  CREATE INDEX "legal_pages_blocks_divider_block_order_idx" ON "legal_pages_blocks_divider_block" USING btree ("_order");
  CREATE INDEX "legal_pages_blocks_divider_block_parent_id_idx" ON "legal_pages_blocks_divider_block" USING btree ("_parent_id");
  CREATE INDEX "legal_pages_blocks_divider_block_path_idx" ON "legal_pages_blocks_divider_block" USING btree ("_path");
  CREATE UNIQUE INDEX "legal_pages_slug_idx" ON "legal_pages" USING btree ("slug");
  CREATE INDEX "legal_pages_updated_at_idx" ON "legal_pages" USING btree ("updated_at");
  CREATE INDEX "legal_pages_created_at_idx" ON "legal_pages" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "protected_files_updated_at_idx" ON "protected_files" USING btree ("updated_at");
  CREATE INDEX "protected_files_created_at_idx" ON "protected_files" USING btree ("created_at");
  CREATE UNIQUE INDEX "protected_files_filename_idx" ON "protected_files" USING btree ("filename");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_platform_users_id_idx" ON "payload_locked_documents_rels" USING btree ("platform_users_id");
  CREATE INDEX "payload_locked_documents_rels_external_users_id_idx" ON "payload_locked_documents_rels" USING btree ("external_users_id");
  CREATE INDEX "payload_locked_documents_rels_custom_roles_id_idx" ON "payload_locked_documents_rels" USING btree ("custom_roles_id");
  CREATE INDEX "payload_locked_documents_rels_invitations_id_idx" ON "payload_locked_documents_rels" USING btree ("invitations_id");
  CREATE INDEX "payload_locked_documents_rels_password_resets_id_idx" ON "payload_locked_documents_rels" USING btree ("password_resets_id");
  CREATE INDEX "payload_locked_documents_rels_channel_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("channel_pages_id");
  CREATE INDEX "payload_locked_documents_rels_content_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("content_pages_id");
  CREATE INDEX "payload_locked_documents_rels_legal_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("legal_pages_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_protected_files_id_idx" ON "payload_locked_documents_rels" USING btree ("protected_files_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_platform_users_id_idx" ON "payload_preferences_rels" USING btree ("platform_users_id");
  CREATE INDEX "payload_preferences_rels_external_users_id_idx" ON "payload_preferences_rels" USING btree ("external_users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_page_new_in_items_order_idx" ON "home_page_new_in_items" USING btree ("_order");
  CREATE INDEX "home_page_new_in_items_parent_id_idx" ON "home_page_new_in_items" USING btree ("_parent_id");
  CREATE INDEX "home_page_new_in_items_image_idx" ON "home_page_new_in_items" USING btree ("image_id");
  CREATE INDEX "home_page_quick_access_items_order_idx" ON "home_page_quick_access_items" USING btree ("_order");
  CREATE INDEX "home_page_quick_access_items_parent_id_idx" ON "home_page_quick_access_items" USING btree ("_parent_id");
  CREATE INDEX "home_page_quick_access_items_image_idx" ON "home_page_quick_access_items" USING btree ("image_id");
  CREATE INDEX "home_page_help_buttons_order_idx" ON "home_page_help_buttons" USING btree ("_order");
  CREATE INDEX "home_page_help_buttons_parent_id_idx" ON "home_page_help_buttons" USING btree ("_parent_id");
  CREATE INDEX "home_page_hero_image_idx" ON "home_page" USING btree ("hero_image_id");
  CREATE INDEX "navigation_items_children_l3_items_order_idx" ON "navigation_items_children_l3_items" USING btree ("_order");
  CREATE INDEX "navigation_items_children_l3_items_parent_id_idx" ON "navigation_items_children_l3_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_items_children_l3_items_page_idx" ON "navigation_items_children_l3_items" USING btree ("page_id");
  CREATE INDEX "navigation_items_children_order_idx" ON "navigation_items_children" USING btree ("_order");
  CREATE INDEX "navigation_items_children_parent_id_idx" ON "navigation_items_children" USING btree ("_parent_id");
  CREATE INDEX "navigation_items_order_idx" ON "navigation_items" USING btree ("_order");
  CREATE INDEX "navigation_items_parent_id_idx" ON "navigation_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_rels_order_idx" ON "navigation_rels" USING btree ("order");
  CREATE INDEX "navigation_rels_parent_idx" ON "navigation_rels" USING btree ("parent_id");
  CREATE INDEX "navigation_rels_path_idx" ON "navigation_rels" USING btree ("path");
  CREATE INDEX "navigation_rels_channel_pages_id_idx" ON "navigation_rels" USING btree ("channel_pages_id");
  CREATE INDEX "navigation_rels_content_pages_id_idx" ON "navigation_rels" USING btree ("content_pages_id");
  CREATE INDEX "footer_settings_social_links_order_idx" ON "footer_settings_social_links" USING btree ("_order");
  CREATE INDEX "footer_settings_social_links_parent_id_idx" ON "footer_settings_social_links" USING btree ("_parent_id");
  CREATE INDEX "footer_settings_social_links_icon_idx" ON "footer_settings_social_links" USING btree ("icon_id");
  CREATE INDEX "footer_settings_legal_links_order_idx" ON "footer_settings_legal_links" USING btree ("_order");
  CREATE INDEX "footer_settings_legal_links_parent_id_idx" ON "footer_settings_legal_links" USING btree ("_parent_id");
  CREATE INDEX "footer_settings_legal_links_page_idx" ON "footer_settings_legal_links" USING btree ("page_id");
  CREATE INDEX "login_settings_image_idx" ON "login_settings" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "platform_users_sessions" CASCADE;
  DROP TABLE "platform_users" CASCADE;
  DROP TABLE "external_users_sessions" CASCADE;
  DROP TABLE "external_users" CASCADE;
  DROP TABLE "custom_roles" CASCADE;
  DROP TABLE "invitations" CASCADE;
  DROP TABLE "password_resets" CASCADE;
  DROP TABLE "channel_pages_buttons" CASCADE;
  DROP TABLE "channel_pages_cards" CASCADE;
  DROP TABLE "channel_pages" CASCADE;
  DROP TABLE "content_pages_buttons" CASCADE;
  DROP TABLE "content_pages_blocks_section_block_buttons" CASCADE;
  DROP TABLE "content_pages_blocks_section_block" CASCADE;
  DROP TABLE "content_pages_blocks_rich_text" CASCADE;
  DROP TABLE "content_pages_blocks_quote_block" CASCADE;
  DROP TABLE "content_pages_blocks_note_block" CASCADE;
  DROP TABLE "content_pages_blocks_table_block_rows_cells" CASCADE;
  DROP TABLE "content_pages_blocks_table_block_rows" CASCADE;
  DROP TABLE "content_pages_blocks_table_block" CASCADE;
  DROP TABLE "content_pages_blocks_grid_block_items" CASCADE;
  DROP TABLE "content_pages_blocks_grid_block" CASCADE;
  DROP TABLE "content_pages_blocks_collection_card_block_assets" CASCADE;
  DROP TABLE "content_pages_blocks_collection_card_block" CASCADE;
  DROP TABLE "content_pages_blocks_divider_block" CASCADE;
  DROP TABLE "content_pages_blocks_icon_library_block_items_tags" CASCADE;
  DROP TABLE "content_pages_blocks_icon_library_block_items" CASCADE;
  DROP TABLE "content_pages_blocks_icon_library_block" CASCADE;
  DROP TABLE "content_pages" CASCADE;
  DROP TABLE "legal_pages_blocks_rich_text" CASCADE;
  DROP TABLE "legal_pages_blocks_quote_block" CASCADE;
  DROP TABLE "legal_pages_blocks_note_block" CASCADE;
  DROP TABLE "legal_pages_blocks_table_block_rows_cells" CASCADE;
  DROP TABLE "legal_pages_blocks_table_block_rows" CASCADE;
  DROP TABLE "legal_pages_blocks_table_block" CASCADE;
  DROP TABLE "legal_pages_blocks_divider_block" CASCADE;
  DROP TABLE "legal_pages" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "protected_files" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_page_new_in_items" CASCADE;
  DROP TABLE "home_page_quick_access_items" CASCADE;
  DROP TABLE "home_page_help_buttons" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "navigation_items_children_l3_items" CASCADE;
  DROP TABLE "navigation_items_children" CASCADE;
  DROP TABLE "navigation_items" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "navigation_rels" CASCADE;
  DROP TABLE "footer_settings_social_links" CASCADE;
  DROP TABLE "footer_settings_legal_links" CASCADE;
  DROP TABLE "footer_settings" CASCADE;
  DROP TABLE "login_settings" CASCADE;
  DROP TYPE "public"."enum_platform_users_role";
  DROP TYPE "public"."enum_external_users_role";
  DROP TYPE "public"."enum_content_pages_blocks_note_block_type";
  DROP TYPE "public"."enum_content_pages_blocks_grid_block_columns";
  DROP TYPE "public"."enum_content_pages_blocks_collection_card_block_card_model";
  DROP TYPE "public"."enum_content_pages_blocks_divider_block_variant";
  DROP TYPE "public"."enum_legal_pages_blocks_note_block_type";
  DROP TYPE "public"."enum_legal_pages_blocks_divider_block_variant";`)
}
