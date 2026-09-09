import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Hand-written rather than generated via `payload migrate:create` — that command's interactive
// schema diff got confused by unrelated pre-existing drift (a `trash` table that already exists
// in the database from a past local dev push-mode sync, never itself formally migrated) and
// offered no safe non-interactive way to answer its prompt. This migration only touches the two
// new tables below; schema/column shapes are modeled directly on the live database's existing
// `affiliate_settings` (a global) and `orders_notes` (an array field) tables to match Payload's
// own conventions exactly.
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
     CREATE TYPE "public"."enum_payment_methods_methods_key" AS ENUM('zelle', 'nextlvlpay', 'stripe_link', 'circoflows');
    EXCEPTION
     WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS "payment_methods" (
      "id" serial PRIMARY KEY NOT NULL,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );

    CREATE TABLE IF NOT EXISTS "payment_methods_methods" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "key" "public"."enum_payment_methods_methods_key" NOT NULL,
      "enabled" boolean DEFAULT true,
      "label" varchar NOT NULL,
      "description" varchar NOT NULL
    );
  `)

  await db.execute(sql`
    DO $$ BEGIN
     ALTER TABLE "payment_methods_methods" ADD CONSTRAINT "payment_methods_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payment_methods"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
     WHEN duplicate_object THEN null;
    END $$;

    CREATE INDEX IF NOT EXISTS "payment_methods_methods_order_idx" ON "payment_methods_methods" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "payment_methods_methods_parent_id_idx" ON "payment_methods_methods" USING btree ("_parent_id");
  `)

  // Seed today's exact current checkout behavior — same order, same labels/descriptions, same
  // enabled state (circoflows was already off via the old ENABLE_CIRCOFLOWS code flag, now
  // retired in favor of this) — so shipping this changes nothing visible until someone actually
  // edits it in admin. Uses the real Payload API (not raw SQL) so row IDs/hooks are handled the
  // same way a real admin edit would.
  await payload.updateGlobal({
    slug: 'payment-methods',
    data: {
      methods: [
        { key: 'circoflows', enabled: false, label: 'Credit / Debit Card', description: "You'll be securely redirected to enter your card details." },
        { key: 'nextlvlpay', enabled: true, label: 'Credit / Debit Card', description: 'Secure card checkout via NextLvlPay.' },
        { key: 'zelle', enabled: true, label: 'Zelle', description: "You'll receive Zelle payment instructions on the next page after placing your order." },
        { key: 'stripe_link', enabled: true, label: 'Stripe (Custom Payment Link)', description: 'Secure payment via an emailed Stripe link.' },
      ],
    },
  })
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "payment_methods_methods";
    DROP TABLE IF EXISTS "payment_methods";
    DROP TYPE IF EXISTS "public"."enum_payment_methods_methods_key";
  `)
}
