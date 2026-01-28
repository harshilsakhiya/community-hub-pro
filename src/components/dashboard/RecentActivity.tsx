import { Card, List, Avatar, Tag, Typography, Empty, Spin } from 'antd';
import {
  CheckCircleOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  BellOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;

interface Activity {
  id: string;
  type: string;
  message: string;
  time: string;
}

interface RecentActivityProps {
  activities: Activity[];
  loading?: boolean;
  onViewAll?: () => void;
}

const getActivityConfig = (type: string) => {
  const configs = {
    payment: {
      icon: <CheckCircleOutlined />,
      color: '#2d9676',
      bg: 'rgba(45, 150, 118, 0.1)',
    },
    visitor: {
      icon: <UserOutlined />,
      color: '#1e3a5f',
      bg: 'rgba(30, 58, 95, 0.1)',
    },
    complaint: {
      icon: <ExclamationCircleOutlined />,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
    notice: {
      icon: <BellOutlined />,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)',
    },
  };
  return configs[type as keyof typeof configs] || configs.notice;
};

export default function RecentActivity({
  activities,
  loading = false,
  onViewAll,
}: RecentActivityProps) {
  return (
    <Card
      title={<Title level={5} className="!mb-0">Recent Activity</Title>}
      extra={
        onViewAll && (
          <a onClick={onViewAll} className="text-sm text-[#2d9676] hover:text-[#238c6a]">
            View All
          </a>
        )
      }
      className="h-full"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spin />
        </div>
      ) : activities.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={activities}
          renderItem={(activity) => {
            const config = getActivityConfig(activity.type);
            return (
              <List.Item className="!px-0 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={config.icon}
                      style={{
                        backgroundColor: config.bg,
                        color: config.color,
                      }}
                    />
                  }
                  title={
                    <Text className="text-sm font-medium">{activity.message}</Text>
                  }
                  description={
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <ClockCircleOutlined />
                      <span>{activity.time}</span>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      ) : (
        <Empty description="No recent activity" />
      )}
    </Card>
  );
}
