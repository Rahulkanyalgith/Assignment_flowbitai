'use client';

import { type Invoice } from '@/lib/api';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface Props {
  initialData: Invoice[];
}

export default function InvoicesTable({ initialData }: Props) {
  const tableData = [
    { vendor: 'Prunix GmbH', date: '19.08.2025', invoices: '19.08.2025', netValue: ' 736.78,44,00' },
    { vendor: 'Prunix GmbH', date: '19.08.2025', invoices: '19.08.2025', netValue: ' 736.78,44,00' },
    { vendor: 'Prunix GmbH', date: '19.08.2025', invoices: '19.08.2025', netValue: ' 736.78,44,00' },
    { vendor: 'Prunix GmbH', date: '19.08.2025', invoices: '19.08.2025', netValue: ' 736.78,44,00' },
    { vendor: 'Prunix GmbH', date: '19.08.2025', invoices: '19.08.2025', netValue: ' 736.78,44,00' },
    { vendor: 'Prunix GmbH', date: '19.08.2025', invoices: '19.08.2025', netValue: ' 736.78,44,00' },
    { vendor: 'Prunix GmbH', date: '19.08.2025', invoices: '19.08.2025', netValue: ' 736.78,44,00' },
  ];

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200 hover:bg-transparent">
            <TableHead className="text-xs font-medium text-gray-600 uppercase">Vendor</TableHead>
            <TableHead className="text-xs font-medium text-gray-600 uppercase text-right"># Invoices</TableHead>
            <TableHead className="text-xs font-medium text-gray-600 uppercase text-right">Net Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row, index) => (
            <TableRow key={index} className="border-b border-gray-100 hover:bg-gray-50">
              <TableCell className="py-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{row.vendor}</span>
                  <span className="text-xs text-gray-500">{row.date}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-900 text-right">{row.invoices}</TableCell>
              <TableCell className="text-sm font-semibold text-gray-900 text-right">{row.netValue}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
