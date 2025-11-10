'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { type VendorData } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: VendorData[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-900">{payload[0].payload.vendorName}</p>
        <p className="text-xs text-gray-600 mt-1">
          Vendor Spend: <span className="font-semibold text-[#1E40AF]">€ {formatCurrency(payload[0].value).replace('$', '')}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function VendorSpendChart({ data }: Props) {
  // Calculate percentages and prepare data
  const total = data.reduce((sum, item) => sum + item.totalSpend, 0);
  const chartData = data.map((item, index) => ({
    ...item,
    percentage: ((item.totalSpend / total) * 100).toFixed(1),
    color: index === 4 ? '#1E40AF' : '#C7D2FE', // Highlight 5th item (OmegaLtd)
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          layout="vertical"
          margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="0" stroke="#F3F4F6" horizontal={false} />
          <XAxis 
            type="number"
            stroke="#9CA3AF"
            tick={{ fill: '#6B7280', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
          />
          <YAxis 
            type="category"
            dataKey="vendorName" 
            stroke="#6B7280"
            tick={{ fill: '#374151', fontSize: 11 }}
            width={90}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar 
            dataKey="totalSpend" 
            radius={[0, 4, 4, 0]}
            barSize={24}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
