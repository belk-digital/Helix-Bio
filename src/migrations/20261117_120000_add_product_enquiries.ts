import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Adds the product-enquiries collection: availability enquiries raised from a product page
 * when the selected variant is out of stock.
 *
 * IF NOT EXISTS / DO-block guards make this safe to run against a database where dev-mode
 * schema push already created the table (e.g. local development pointed at the same database),
 * matching the convention used by the other migrations here.
 *
 * product_id is nullable with ON DELETE SET NULL: deleting a product must not delete the
 * enquiries raised against it, and the name/slug/url snapshot columns keep the row readable
 * once the relationship is gone.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
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
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "product_enquiries";`)
  await db.execute(sql`DROP TYPE IF EXISTS "enum_product_enquiries_email_status";`)
}
