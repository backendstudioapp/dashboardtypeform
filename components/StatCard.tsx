
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendLabel, icon }) => {
  const isPositive = trend && trend > 0;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      
      <div>
        <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
        
        {trend !== undefined && (
          <div className="flex items-center gap-1">
            <span className={`flex items-center text-xs font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(trend)}%
            </span>
            <span className="text-xs text-gray-400">{trendLabel || 'since last month'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
