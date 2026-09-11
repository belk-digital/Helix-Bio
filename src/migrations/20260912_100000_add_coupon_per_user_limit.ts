import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // IF NOT EXISTS makes this safe to run against a database where dev-mode schema push
  // already added this column (e.g. local development pointed at the same database).
  // Null/0 means unlimited; a positive number caps how many times one customer may redeem
  // this coupon (1 == the old "once per user" behavior).
  await db.execute(sql`
   ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "per_user_limit" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "coupons" DROP COLUMN IF EXISTS "per_user_limit";`)
}
