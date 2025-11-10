'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { type CategorySpend } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: CategorySpend[];
}

const COLORS = ['#1E40AF', '#F97316', '#FCD34D'];

const RADIAN = Math.PI / 180;

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-col gap-2 mt-6">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">{entry.value}</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            ${formatCurrency(entry.payload.totalSpend).replace('$', '')}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function CategoryPieChart({ data }: Props) {
  // Use only first 3 categories or create dummy data
  const chartData = data.length > 0 ? data.slice(0, 3) : [
    { category: 'Operations', totalSpend: 1000 },
    { category: 'Marketing', totalSpend: 7250 },
    { category: 'Facilities', totalSpend: 1000 },
  ];

  return (
    <div className="h-[280px] w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={0}
            dataKey="totalSpend"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
