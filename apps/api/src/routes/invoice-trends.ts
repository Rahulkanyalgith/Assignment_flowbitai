import { Router } from 'express';
import prisma from '../lib/prisma';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

export const invoiceTrendsRouter = Router();

// Explicit type for selected invoice fields to prevent implicit any warnings
type InvoiceSummary = {
  invoiceDate: Date;
  totalAmount: number;
};

invoiceTrendsRouter.get('/', async (req, res) => {
  try {
    const months = parseInt(req.query.months as string) || 12;
    const endDate = endOfMonth(new Date());
    const startDate = startOfMonth(subMonths(endDate, months - 1));

    const invoices: InvoiceSummary[] = await prisma.invoice.findMany({
      where: {
        invoiceDate: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          notIn: ['CANCELLED', 'DRAFT'],
        },
      },
      select: {
        invoiceDate: true,
        totalAmount: true,
      },
    });

    // Group by month
    const monthlyData = new Map<string, { count: number; total: number }>();

    invoices.forEach((invoice) => {
      const monthKey = format(invoice.invoiceDate, 'yyyy-MM');
      const existing = monthlyData.get(monthKey) || { count: 0, total: 0 };
      monthlyData.set(monthKey, {
        count: existing.count + 1,
        total: existing.total + invoice.totalAmount,
      });
    });

    // Fill in missing months with zero values
    const result: Array<{ month: string; monthKey: string; invoiceCount: number; totalValue: number }> = [];
    for (let i = 0; i < months; i++) {
      const date = subMonths(endDate, months - 1 - i);
      const monthKey = format(startOfMonth(date), 'yyyy-MM');
      const data = monthlyData.get(monthKey) || { count: 0, total: 0 };
      
      result.push({
        month: format(startOfMonth(date), 'MMM yyyy'),
        monthKey,
        invoiceCount: data.count,
        totalValue: data.total,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching invoice trends:', error);
    res.status(500).json({ error: 'Failed to fetch invoice trends' });
  }
});
