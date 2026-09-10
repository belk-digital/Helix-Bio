import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Schema-only migration, deliberately kept separate from the CMS-global seed in
// 20260911_100100_seed_dataopt_payment_method_global.ts — Postgres won't allow a brand-new enum
// value to be used (e.g. by the Payload local API call that seed does) in the same transaction
// that added it via ALTER TYPE ... ADD VALUE.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_orders_payment_method" ADD VALUE IF NOT EXISTS 'dataopt';
    ALTER TYPE "public"."enum_payment_methods_methods_key" ADD VALUE IF NOT EXISTS 'dataopt';

    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "dataopt_receipt_id" varchar;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "dataopt_transaction_hash" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Postgres has no ALTER TYPE ... DROP VALUE — reverting the enum itself would require
  // recreating both types from scratch and is intentionally not attempted here. Only the
  // additive, safely-reversible column changes are undone.
  await db.execute(sql`
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "dataopt_receipt_id";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "dataopt_transaction_hash";
  `)
}
