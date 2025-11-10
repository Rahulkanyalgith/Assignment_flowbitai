import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Helpers to safely extract nested values from various JSON shapes
function get(obj: any, keys: Array<string | number>, fallback?: any): any {
  try {
    return keys.reduce((acc: any, k) => (acc == null ? undefined : acc[k]), obj) ?? fallback;
  } catch {
    return fallback;
  }
}

function unwrap(val: any): any {
  // Handles shapes like { value: x }, { $date: iso }, { $numberLong: "123" }
  if (val && typeof val === 'object') {
    if ('value' in val) return (val as any).value;
    if ('$date' in val) return (val as any)['$date'];
    if ('$numberLong' in val) return Number((val as any)['$numberLong']);
  }
  return val;
}

function asString(val: any, fallback: string | null = null): string | null {
  const v = unwrap(val);
  if (v == null) return fallback;
  return String(v);
}

function asNumber(val: any, fallback = 0): number {
  const v = unwrap(val);
  if (v == null || v === '') return fallback;
  const n = typeof v === 'number' ? v : Number(v);
  return isNaN(n) ? fallback : n;
}

function asDate(val: any): Date | null {
  const v = unwrap(val);
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function normalizeStatus(status: any): string {
  const s = asString(status, 'PENDING')?.toUpperCase() || 'PENDING';
  // Map common status strings to Prisma enum values
  const statusMap: Record<string, string> = {
    'PROCESSED': 'PAID',
    'COMPLETE': 'PAID',
    'COMPLETED': 'PAID',
    'SUCCESS': 'PAID',
    'OPEN': 'PENDING',
    'UNPAID': 'PENDING',
    'DUE': 'PENDING',
    'VOID': 'CANCELLED',
    'DELETED': 'CANCELLED',
  };
  const mapped = statusMap[s] || s;
  // Ensure it's a valid enum value
  const validStatuses = ['DRAFT', 'PENDING', 'APPROVED', 'PAID', 'OVERDUE', 'CANCELLED'];
  return validStatuses.includes(mapped) ? mapped : 'PENDING';
}

async function main() {
  console.log('Starting database seeding...');

  // Check if Analytics_Test_Data.json exists
  // When running with tsx, __dirname points to src/, so go up one level to apps/api
  const dataPath = path.join(__dirname, '..', 'Analytics_Test_Data.json');
  
  console.log(`Looking for data file at: ${dataPath}`);
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ Analytics_Test_Data.json not found!');
    console.log(`Expected location: ${dataPath}`);
    console.log('Please place the Analytics_Test_Data.json file in the apps/api directory');
    process.exit(1);
  }

  // Read and parse the JSON file
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);

  console.log('📊 Data loaded successfully');
  console.log(`Found ${data.length || 0} records`);

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.payment.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.vendor.deleteMany();

  console.log('✅ Existing data cleared');

  // Process the data
  const vendors = new Map();
  const customers = new Map();
  let invoiceCount = 0;
  let lineItemCount = 0;
  let paymentCount = 0;

  // Assuming data structure - adjust based on actual JSON structure
  const records = Array.isArray(data) ? data : [data];

  for (const record of records) {
    try {
      // Prefer flat structures; fallback to extractedData.llmData.* shapes
      const llm = get(record, ['extractedData', 'llmData']);

      // Extract vendor information
      const vendorFlat = record.vendor || record.Vendor;
      const vendorName = asString(
        vendorFlat?.name || vendorFlat?.companyName || get(llm, ['vendor', 'value', 'vendorName'])
      );
      const vendorTaxId = asString(
        vendorFlat?.taxId || get(llm, ['vendor', 'value', 'vendorTaxId'])
      );
      const vendorAddress = asString(
        vendorFlat?.address || get(llm, ['vendor', 'value', 'vendorAddress'])
      );

      if (vendorName) {
        const vid = vendorFlat?.vendorId || vendorFlat?.id || vendorTaxId || slugify(vendorName);
        if (!vendors.has(vid)) {
          vendors.set(vid, {
            vendorId: String(vid),
            name: vendorName || 'Unknown Vendor',
            email: vendorFlat?.email || null,
            phone: vendorFlat?.phone || null,
            address: vendorAddress || null,
            city: vendorFlat?.city || null,
            state: vendorFlat?.state || null,
            country: vendorFlat?.country || 'USA',
            postalCode: vendorFlat?.postalCode || vendorFlat?.zipCode || null,
            taxId: vendorTaxId || null,
            paymentTerms: vendorFlat?.paymentTerms || 'Net 30',
          });
        }
      }

      // Extract customer information
      const customerFlat = record.customer || record.Customer;
      const customerName = asString(
        customerFlat?.name || customerFlat?.companyName || get(llm, ['customer', 'value', 'customerName'])
      );
      if (customerName) {
        const cid = customerFlat?.customerId || customerFlat?.id || slugify(customerName);
        if (!customers.has(cid)) {
          customers.set(cid, {
            customerId: String(cid),
            name: customerName || 'Unknown Customer',
            email: customerFlat?.email || null,
            phone: customerFlat?.phone || null,
            address: customerFlat?.address || null,
            city: customerFlat?.city || null,
            state: customerFlat?.state || null,
            country: customerFlat?.country || 'USA',
            postalCode: customerFlat?.postalCode || customerFlat?.zipCode || null,
          });
        }
      }
    } catch (error) {
      console.warn('Warning: Error processing record vendor/customer:', error);
    }
  }

  // Create vendors
  console.log(`\n📝 Creating ${vendors.size} vendors...`);
  for (const vendor of vendors.values()) {
    await prisma.vendor.create({ data: vendor });
  }
  console.log('✅ Vendors created');

  // Create customers
  console.log(`\n📝 Creating ${customers.size} customers...`);
  for (const customer of customers.values()) {
    await prisma.customer.create({ data: customer });
  }
  console.log('✅ Customers created');

  // Create invoices and related data
  console.log(`\n📝 Creating invoices...`);
  
  for (const record of records) {
    try {
      const llm = get(record, ['extractedData', 'llmData']);

      // Vendor and Customer IDs must match what we inserted above
      const vendorName = asString(
        record.vendor?.name || record.Vendor?.name || get(llm, ['vendor', 'value', 'vendorName'])
      );
      const vendorTaxId = asString(
        record.vendor?.taxId || get(llm, ['vendor', 'value', 'vendorTaxId'])
      );
      
      // Try multiple lookup strategies in order of preference
      let vendorId = 'VND-1'; // default fallback
      if (vendorName) {
        const vendorKey = slugify(vendorName);
        if (vendors.has(vendorKey)) {
          vendorId = vendorKey;
        } else if (vendorTaxId && vendors.has(vendorTaxId)) {
          vendorId = vendorTaxId;
        } else {
          // Use the first available vendor as fallback
          const firstVendor = Array.from(vendors.keys())[0];
          if (firstVendor) vendorId = firstVendor;
        }
      } else {
        // No vendor name found, use first vendor
        const firstVendor = Array.from(vendors.keys())[0];
        if (firstVendor) vendorId = firstVendor;
      }

      const customerName = asString(
        record.customer?.name || record.Customer?.name || get(llm, ['customer', 'value', 'customerName'])
      );
      let customerId: string | null = null;
      if (customerName) {
        const customerKey = slugify(customerName);
        if (customers.has(customerKey)) {
          customerId = customerKey;
        }
      }

      // Parse invoice data
      const invoiceId = asString(
        record.invoiceNumber || record.invoiceId || get(llm, ['invoice', 'value', 'invoiceId']) || record._id,
        undefined as any
      );
      const invoiceDate = asDate(
        record.invoiceDate || record.date || record.createdDate || get(llm, ['invoice', 'value', 'invoiceDate']) || get(record, ['createdAt', '$date'])
      );
      const dueDate = asDate(
        record.dueDate || record.paymentDue || get(llm, ['payment', 'value', 'dueDate'])
      );

      const subtotal = asNumber(
        record.subtotal || record.subTotal || get(llm, ['summary', 'value', 'subTotal']) || record.amount || 0
      );
      const taxAmount = asNumber(
        record.tax || record.taxAmount || get(llm, ['summary', 'value', 'totalTax']) || 0
      );
      const totalAmount = asNumber(
        record.total || record.totalAmount || get(llm, ['summary', 'value', 'invoiceTotal']) || (subtotal + taxAmount)
      );
      const amountPaid = asNumber(record.amountPaid || record.paid || 0);

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: invoiceId || `INV-${invoiceCount + 1}`,
          vendorId: vendorId,
          customerId: customerId,
          invoiceDate: invoiceDate ?? new Date(),
          dueDate: dueDate ?? null,
          status: normalizeStatus(record.status) as any,
          currency: record.currency || 'USD',
          subtotal: subtotal,
          taxAmount: taxAmount,
          totalAmount: totalAmount,
          amountPaid: amountPaid,
          amountDue: totalAmount - amountPaid,
          category: record.category || record.type || null,
          description: record.description || record.notes || null,
          documentUrl: record.documentUrl || record.attachmentUrl || null,
        },
      });

      invoiceCount++;

      // Create line items
      const lineItems = record.lineItems || record.items || [];
      for (const item of lineItems) {
        const quantity = parseFloat(item.quantity || 1);
        const unitPrice = parseFloat(item.unitPrice || item.price || 0);
        const amount = parseFloat(item.amount || quantity * unitPrice);

        await prisma.lineItem.create({
          data: {
            invoiceId: invoice.id,
            description: item.description || item.name || 'Line Item',
            quantity: quantity,
            unitPrice: unitPrice,
            amount: amount,
            category: item.category || null,
            taxRate: parseFloat(item.taxRate || 0),
            taxAmount: parseFloat(item.taxAmount || 0),
          },
        });
        lineItemCount++;
      }

      // Create payments
      const payments = record.payments || [];
      for (const payment of payments) {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            paymentDate: payment.date ? new Date(payment.date) : new Date(),
            amount: parseFloat(payment.amount || 0),
            paymentMethod: payment.method || payment.paymentMethod || 'BANK_TRANSFER',
            referenceNumber: payment.reference || payment.referenceNumber || null,
            notes: payment.notes || null,
          },
        });
        paymentCount++;
      }

      if (invoiceCount % 10 === 0) {
        console.log(`  ✓ Processed ${invoiceCount} invoices...`);
      }
    } catch (error) {
      console.warn(`Warning: Error processing invoice:`, error);
    }
  }

  console.log('\n✅ Database seeding completed!');
  console.log(`\n📊 Summary:`);
  console.log(`  - Vendors: ${vendors.size}`);
  console.log(`  - Customers: ${customers.size}`);
  console.log(`  - Invoices: ${invoiceCount}`);
  console.log(`  - Line Items: ${lineItemCount}`);
  console.log(`  - Payments: ${paymentCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
