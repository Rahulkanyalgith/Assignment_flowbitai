import { Router } from 'express';
import prisma from '../lib/prisma';
import { addDays, startOfDay, endOfDay, format } from 'date-fns';

export const cashOutflowRouter = Router();

cashOutflowRouter.get('/', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = startOfDay(new Date());
    const endDate = endOfDay(addDays(startDate, days));

    // Get invoices with upcoming due dates
    const upcomingInvoices = await prisma.invoice.findMany({
      where: {
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['PENDING', 'APPROVED'],
        },
      },
      select: {
        dueDate: true,
        amountDue: true,
      },
    });

    // Group by date
    const dailyOutflow = new Map<string, number>();

    upcomingInvoices.forEach((invoice: { dueDate: Date | null; amountDue: number }) => {
      if (invoice.dueDate) {
        const dateKey = format(invoice.dueDate, 'yyyy-MM-dd');
        const existing = dailyOutflow.get(dateKey) || 0;
        dailyOutflow.set(dateKey, existing + invoice.amountDue);
      }
    });

    // Create result array with all dates
    const result = [];
    for (let i = 0; i < days; i++) {
      const date = addDays(startDate, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      result.push({
        date: dateKey,
        dateLabel: format(date, 'MMM dd'),
        amount: dailyOutflow.get(dateKey) || 0,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching cash outflow:', error);
    res.status(500).json({ error: 'Failed to fetch cash outflow forecast' });
  }
});
