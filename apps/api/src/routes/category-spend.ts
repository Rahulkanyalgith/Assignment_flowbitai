import { Router } from 'express';
import prisma from '../lib/prisma';

export const categorySpendRouter = Router();

// Type for Prisma groupBy result
type CategoryGroupResult = {
  category: string | null;
  _sum: {
    totalAmount: number | null;
  };
  _count: {
    id: number;
  };
};

categorySpendRouter.get('/', async (req, res) => {
  try {
    // Let Prisma infer groupBy return type to avoid intersection typing issues
    const categorySpend = await prisma.invoice.groupBy({
      by: ['category'],
      where: {
        status: {
          notIn: ['CANCELLED', 'DRAFT'],
        },
        category: {
          not: null,
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
    });

    const result: Array<{ category: string; totalSpend: number; invoiceCount: number }> = categorySpend.map((cat: CategoryGroupResult) => ({
      category: cat.category ?? 'Uncategorized',
      totalSpend: (cat._sum.totalAmount ?? 0),
      invoiceCount: cat._count.id,
    }));

    // Add uncategorized if there are any
    const uncategorizedCount = await prisma.invoice.count({
      where: {
        status: {
          notIn: ['CANCELLED', 'DRAFT'],
        },
        category: null,
      },
    });

    if (uncategorizedCount > 0) {
      const uncategorizedSum = await prisma.invoice.aggregate({
        where: {
          status: {
            notIn: ['CANCELLED', 'DRAFT'],
          },
          category: null,
        },
        _sum: {
          totalAmount: true,
        },
      });

      result.push({
        category: 'Uncategorized',
        totalSpend: uncategorizedSum._sum.totalAmount || 0,
        invoiceCount: uncategorizedCount,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching category spend:', error);
    res.status(500).json({ error: 'Failed to fetch category spend' });
  }
});
