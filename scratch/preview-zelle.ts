import { generateOrderInvoiceHtml } from '../src/lib/emails/generateOrderEmail';

async function run() {
  const html = await generateOrderInvoiceHtml(
    {
      id: 1,
      orderNumber: '10045',
      total: 145.50,
      paymentMethod: 'zelle',
      paymentStatus: 'unpaid',
      customerFirstName: 'Test',
      customerLastName: 'User',
      trackingLink: 'https://example.com/track',
      items: [
        {
          productSnapshot: {
            name: 'Test Peptide',
          },
          quantity: 1,
          price: 145.50
        }
      ],
      shippingTotal: 0,
      feeTotal: 0,
      taxTotal: 0,
      discountTotal: 0,
      createdAt: new Date().toISOString()
    } as any,
    undefined,
    undefined,
    'success'
  );
  console.log(html);
}
run();
