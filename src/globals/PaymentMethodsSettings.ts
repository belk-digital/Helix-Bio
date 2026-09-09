import type { GlobalConfig } from 'payload'

export const PaymentMethodsSettings: GlobalConfig = {
  slug: 'payment-methods',
  admin: {
    description: 'Controls which payment options appear at checkout, their order, and their label/description. Drag rows to reorder.',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => !!user && ['admin', 'staff'].includes(user.role as string),
  },
  fields: [
    {
      name: 'methods',
      type: 'array',
      required: true,
      admin: {
        description: 'Only methods with a working checkout handler can be added here — this list controls display only (order, on/off, label, description), not the underlying payment logic.',
      },
      validate: (value: any) => {
        if (!Array.isArray(value)) return true
        const keys = value.map((row: any) => row?.key).filter(Boolean)
        const hasDuplicates = new Set(keys).size !== keys.length
        if (hasDuplicates) {
          return 'Each payment method key can only appear once.'
        }
        return true
      },
      fields: [
        {
          name: 'key',
          type: 'select',
          required: true,
          options: [
            { label: 'Zelle', value: 'zelle' },
            { label: 'Card (via NextLvlPay)', value: 'nextlvlpay' },
            { label: 'Stripe (Custom Payment Link)', value: 'stripe_link' },
            { label: 'Card (via CircoFlows)', value: 'circoflows' },
          ],
          admin: {
            description: 'Which checkout code path this row controls.',
          },
        },
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'Shown as the option\'s title at checkout, e.g. "Zelle" or "Credit / Debit Card".',
          },
        },
        {
          name: 'description',
          type: 'text',
          required: true,
          admin: {
            description: 'Shown as the small subtitle under the label.',
          },
        },
      ],
    },
  ],
}
