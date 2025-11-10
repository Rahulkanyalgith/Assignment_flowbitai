'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { type InvoiceTrend } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: InvoiceTrend[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[180px]">
        <p className="text-sm font-semibold text-gray-900 mb-2">{payload[0].payload.month}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-xs text-gray-600">Invoice count:</span>
            <span className="text-sm font-semibold text-[#1E40AF]">{payload[0].value}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-xs text-gray-600">Total Spend:</span>
            <span className="text-sm font-semibold text-[#1E40AF]">€ {formatCurrency(payload[1]?.value || 0).replace('$', '')}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function InvoiceVolumeChart({ data }: Props) {
  // Find October 2025 data for highlight
  const octoberData = data.find(d => d.month === 'October 2025' || d.month === 'Oct');
  
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#1E40AF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="0" stroke="#F3F4F6" vertical={false} />
          <XAxis 
            dataKey="month" 
            stroke="#9CA3AF"
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="invoiceCount" 
            stroke="#93C5FD" 
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
          <Line 
            type="monotone" 
            dataKey="totalValue" 
            stroke="#1E40AF" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#1E40AF' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
