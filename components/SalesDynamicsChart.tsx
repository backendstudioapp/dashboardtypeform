
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { ChartData } from '../types';

interface SalesDynamicsChartProps {
  data: ChartData[];
}

const SalesDynamicsChart: React.FC<SalesDynamicsChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-80">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800">Sales dynamics</h3>
        <select className="text-xs bg-gray-50 border-none rounded-lg px-2 py-1 outline-none text-gray-500 font-semibold cursor-pointer">
          <option>2024</option>
          <option>2023</option>
        </select>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 10 }} 
            />
            <Tooltip 
              cursor={{ fill: '#F9FAFB' }} 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index % 2 === 0 ? '#3B82F6' : '#8B5CF6'} 
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesDynamicsChart;
