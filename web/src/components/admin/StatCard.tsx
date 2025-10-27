import React from "react";
import type { LucideProps } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.FC<LucideProps>; // <- updated
  trend?: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color,
}) => {
  const isPositive = trend !== undefined && trend > 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        {/* Icon */}
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <Icon size={24} />
        </div>

        {/* Trend */}
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      {/* Value & Title */}
      <div>
        <h3 className="text-3xl font-bold text-gray-800 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
};

export default StatCard;
