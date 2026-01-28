import { Card, Statistic, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

const { Text } = Typography;

interface StatsCardProps {
  title: string;
  value: string | number;
  prefix?: ReactNode;
  suffix?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: ReactNode;
  loading?: boolean;
  color?: 'success' | 'warning' | 'error' | 'primary' | 'accent';
}

const colorMap = {
  success: { bg: 'rgba(45, 150, 118, 0.1)', text: '#2d9676' },
  warning: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
  error: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
  primary: { bg: 'rgba(30, 58, 95, 0.1)', text: '#1e3a5f' },
  accent: { bg: 'rgba(45, 150, 118, 0.1)', text: '#2d9676' },
};

export default function StatsCard({
  title,
  value,
  prefix,
  suffix,
  trend,
  icon,
  loading = false,
  color = 'accent',
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <Card 
      className="h-full hover:shadow-md transition-shadow duration-300"
      styles={{ body: { padding: 24 } }}
    >
      <div className="flex items-start justify-between">
        {icon && (
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: colors.bg }}
          >
            <span style={{ color: colors.text, fontSize: 20 }}>{icon}</span>
          </div>
        )}
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? (
              <ArrowUpOutlined className="text-xs" />
            ) : (
              <ArrowDownOutlined className="text-xs" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <Statistic
        title={<Text type="secondary" className="text-sm">{title}</Text>}
        value={value}
        prefix={prefix}
        suffix={suffix}
        loading={loading}
        valueStyle={{ 
          fontSize: 28, 
          fontWeight: 700, 
          color: '#1e293b',
          lineHeight: 1.2,
        }}
      />
    </Card>
  );
}
