import { Router } from 'express';
import prisma from '../lib/prisma';

export const vendorsRouter = Router();

// Optional helper types (not forced onto Prisma return types)
// Keeping only VendorInfo; letting Prisma infer groupBy output to avoid conflicts.
type VendorInfo = { vendorId: string; name: string };

vendorsRouter.get('/top10', async (req, res) => {
  try {
    // Let Prisma infer groupBy return type to prevent intersection typing errors
    const topVendors = await prisma.invoice.groupBy({
      by: ['vendorId'],
      where: {
        status: {
          notIn: ['CANCELLED', 'DRAFT'],
        },
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc',
        },
      },
      take: 10,
    });

    // Fetch vendor details
    const vendorIds = topVendors.map((v: { vendorId: string }) => v.vendorId);
    const vendors: VendorInfo[] = await prisma.vendor.findMany({
      where: {
        vendorId: {
          in: vendorIds,
        },
      },
      select: {
        vendorId: true,
        name: true,
      },
    });

    const vendorMap = new Map(vendors.map((v: VendorInfo) => [v.vendorId, v.name]));

    const result: Array<{ vendorId: string; vendorName: string; totalSpend: number; invoiceCount: number }> = topVendors.map((vendor: { vendorId: string; _sum: { totalAmount: number | null }; _count: { id: number } }) => ({
      vendorId: vendor.vendorId,
      vendorName: vendorMap.get(vendor.vendorId) || 'Unknown',
      totalSpend: (vendor._sum.totalAmount ?? 0),
      invoiceCount: vendor._count.id,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching top vendors:', error);
    res.status(500).json({ error: 'Failed to fetch top vendors' });
  }
});
