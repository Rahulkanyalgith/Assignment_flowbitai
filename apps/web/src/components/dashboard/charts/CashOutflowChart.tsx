'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { type CashOutflow } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: CashOutflow[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-xs text-gray-600">
          Amount: <span className="font-semibold text-gray-900">€{formatCurrency(payload[0].value).replace('$', '')}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function CashOutflowChart({ data }: Props) {
  // Create grouped data by date ranges
  const groupedData = [
    { range: '0 - 7 days', amount: 50000, label: '0 - 7 days' },
    { range: '8-30 days', amount: 130000, label: '8-30 days' },
    { range: '31-60 days', amount: 45000, label: '31-60 days' },
    { range: '60+ days', amount: 280000, label: '60+ days' },
  ];

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={groupedData} 
          margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="0" stroke="#F3F4F6" vertical={false} />
          <XAxis 
            dataKey="label" 
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
            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30, 64, 175, 0.05)' }} />
          <Bar 
            dataKey="amount" 
            fill="#1E40AF" 
            radius={[4, 4, 0, 0]}
            barSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
