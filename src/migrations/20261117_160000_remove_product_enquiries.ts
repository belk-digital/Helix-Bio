import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Removes the database-backed product enquiry setup. Enquiries are email-only from here:
 * the server action resolves the product and variant, sends via sendTrackedEmail, and stores
 * nothing of its own. Delivery remains auditable through the existing email-logs collection.
 *
 * This is a forward teardown rather than a rollback of 20261117_120000_add_product_enquiries:
 * that migration genuinely ran against production, so its file and ledger entry stay put and
 * history stays honest.
 *
 * ORDER MATTERS. payload_locked_documents_rels holds an inbound FK to product_enquiries, added
 * by Payload's schema reconciliation rather than by the original migration. Postgres refuses to
 * drop a table another table references, so a bare DROP TABLE — which is all the original
 * migration's down() does — fails here. The referencing column must go first. CASCADE is
 * deliberately not used anywhere: every object is named explicitly so this cannot reach beyond
 * the enquiry feature.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Drop the reconciliation column. This removes its dependent index and FK with it, which
  //    is what unblocks step 2. Safe: payload_locked_documents_rels holds no rows.
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "product_enquiries_id";`)

  // 2. Drop the table. Its own pkey, five indexes, outbound FK to products and id sequence go
  //    with it. The FK to products is ON DELETE SET NULL and owned by this table, so products
  //    itself is untouched.
  await db.execute(sql`DROP TABLE IF EXISTS "product_enquiries";`)

  // 3. Enum last: product_enquiries.email_status was its only dependent (verified against the
  //    live catalog before this ran), so it is free once the table is gone.
  await db.execute(sql`DROP TYPE IF EXISTS "enum_product_enquiries_email_status";`)
}

/**
 * Recreates everything up() removed, including the reconciliation column that the original
 * migration never contained — otherwise rolling back would leave Payload's document locking
 * broken for the collection.
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_product_enquiries_email_status" AS ENUM('pending', 'sent', 'failed');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "product_enquiries" (
      "id" serial PRIMARY KEY NOT NULL,
      "email" varchar NOT NULL,
      "product_id" integer,
      "product_name" varchar,
      "product_slug" varchar,
      "product_url" varchar,
      "variant_title" varchar,
      "variant_sku" varchar,
      "quantity" numeric,
      "note" varchar,
      "submitted_at" timestamp(3) with time zone,
      "email_status" "enum_product_enquiries_email_status" DEFAULT 'pending',
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );`)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "product_enquiries"
        ADD CONSTRAINT "product_enquiries_product_id_products_id_fk"
        FOREIGN KEY ("product_id") REFERENCES "products"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "product_enquiries_product_idx" ON "product_enquiries" ("product_id");`)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "product_enquiries_product_slug_idx" ON "product_enquiries" ("product_slug");`)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "product_enquiries_variant_sku_idx" ON "product_enquiries" ("variant_sku");`)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "product_enquiries_updated_at_idx" ON "product_enquiries" ("updated_at");`)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "product_enquiries_created_at_idx" ON "product_enquiries" ("created_at");`)

  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "product_enquiries_id" integer;`)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_product_enquiries_fk"
        FOREIGN KEY ("product_enquiries_id") REFERENCES "product_enquiries"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_product_enquiries_id_idx"
      ON "payload_locked_documents_rels" ("product_enquiries_id");`)
}
