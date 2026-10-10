import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Fixes floating-point drift left over from createPayloadOrder/createPaymentIntent (checkout/
// actions.ts) summing/subtracting un-rounded JS floats before storing them — e.g. 299.97 getting
// stored as 299.96999999999997, or 100.59 as 100.58999999999999. The checkout code itself was
// fixed (every computed amount is now rounded via round2() at each step); this is the one-time
// cleanup of orders created before that fix. Purely cosmetic/precision — these are not formula
// corrections like 20260710_150000_fix_legacy_order_subtotal.ts, just rounding an
// already-correct value back to its intended 2-decimal form (off by fractions of a cent from
// binary float representation, not a pricing error). Idempotent: only rows where the stored
// value differs from its own rounded form are touched.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "orders"
    SET
      "subtotal" = ROUND("subtotal"::numeric, 2),
      "discount_total" = ROUND("discount_total"::numeric, 2),
      "shipping_total" = ROUND("shipping_total"::numeric, 2),
      "tax_total" = ROUND("tax_total"::numeric, 2),
      "fee_total" = ROUND("fee_total"::numeric, 2),
      "total" = ROUND("total"::numeric, 2),
      "redeemed_points" = ROUND("redeemed_points"::numeric, 2)
    WHERE "subtotal" IS DISTINCT FROM ROUND("subtotal"::numeric, 2)
       OR "discount_total" IS DISTINCT FROM ROUND("discount_total"::numeric, 2)
       OR "shipping_total" IS DISTINCT FROM ROUND("shipping_total"::numeric, 2)
       OR "tax_total" IS DISTINCT FROM ROUND("tax_total"::numeric, 2)
       OR "fee_total" IS DISTINCT FROM ROUND("fee_total"::numeric, 2)
       OR "total" IS DISTINCT FROM ROUND("total"::numeric, 2)
       OR "redeemed_points" IS DISTINCT FROM ROUND("redeemed_points"::numeric, 2);
  `)
}

export async function down(): Promise<void> {
  // Not meaningfully reversible — the "before" state was binary-float noise on an otherwise
  // correct value (e.g. 299.96999999999997 instead of 299.97), not a different number. There is
  // nothing to restore to; rounding never changes a value by more than half a cent.
}
