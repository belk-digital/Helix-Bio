import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// Run only after 20260911_100000_add_dataopt_payment_method.ts has committed in its own
// transaction — see that file's comment for why the enum addition and this seed can't share one.
// Adds the new row disabled, so this changes nothing visible at checkout until an admin turns it
// on from the payment-methods CMS global once the integration has been verified end-to-end.
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const settings = await payload.findGlobal({ slug: 'payment-methods' })
  const methods = settings.methods || []
  if (methods.some((m: any) => m.key === 'dataopt')) return

  await payload.updateGlobal({
    slug: 'payment-methods',
    data: {
      methods: [
        ...methods,
        { key: 'dataopt', enabled: false, label: 'Pay with Crypto', description: "You'll be securely redirected to complete your crypto payment." },
      ],
    },
  })
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  const settings = await payload.findGlobal({ slug: 'payment-methods' })
  const methods = (settings.methods || []).filter((m: any) => m.key !== 'dataopt')
  await payload.updateGlobal({ slug: 'payment-methods', data: { methods } })
}
