import { Router } from 'express';
import prisma from '../lib/prisma';
import { startOfYear, endOfDay } from 'date-fns';

export const statsRouter = Router();

statsRouter.get('/', async (req, res) => {
  try {
    const yearStart = startOfYear(new Date());
    const today = endOfDay(new Date());

    // Total Spend (YTD)
    const totalSpendResult = await prisma.invoice.aggregate({
      where: {
        invoiceDate: {
          gte: yearStart,
          lte: today,
        },
        status: {
          notIn: ['CANCELLED', 'DRAFT'],
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Total Invoices Processed
    const totalInvoices = await prisma.invoice.count({
      where: {
        invoiceDate: {
          gte: yearStart,
          lte: today,
        },
        status: {
          notIn: ['CANCELLED', 'DRAFT'],
        },
      },
    });

    // Documents Uploaded (assuming each invoice is a document)
    const documentsUploaded = await prisma.invoice.count({
      where: {
        documentUrl: {
          not: null,
        },
        invoiceDate: {
          gte: yearStart,
          lte: today,
        },
      },
    });

    // Average Invoice Value
    const avgInvoiceResult = await prisma.invoice.aggregate({
      where: {
        invoiceDate: {
          gte: yearStart,
          lte: today,
        },
        status: {
          notIn: ['CANCELLED', 'DRAFT'],
        },
      },
      _avg: {
        totalAmount: true,
      },
    });

    res.json({
      totalSpend: totalSpendResult._sum.totalAmount || 0,
      totalInvoices,
      documentsUploaded,
      avgInvoiceValue: avgInvoiceResult._avg.totalAmount || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});
