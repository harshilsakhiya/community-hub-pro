import { Row, Col, Typography, Spin } from 'antd';
import { 
  DollarOutlined, 
  ClockCircleOutlined, 
  TeamOutlined, 
  MessageOutlined 
} from '@ant-design/icons';
import StatsCard from '@/components/dashboard/StatsCard';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';
import SocietyOverview from '@/components/dashboard/SocietyOverview';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats, useRecentActivity, useBuildings } from '@/hooks/useSupabaseData';

const { Title, Text } = Typography;

export default function DashboardAntd() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity();
  const { data: buildings } = useBuildings();

  const dashboardStats = [
    {
      title: 'Total Collection',
      value: `₹${(stats?.totalCollection || 0).toLocaleString()}`,
      icon: <DollarOutlined />,
      trend: { value: 12.5, isPositive: true },
      color: 'success' as const,
    },
    {
      title: 'Pending Dues',
      value: `₹${(stats?.pendingAmount || 0).toLocaleString()}`,
      icon: <ClockCircleOutlined />,
      trend: { value: 8.2, isPositive: false },
      color: 'warning' as const,
    },
    {
      title: 'Active Residents',
      value: stats?.occupiedUnits?.toString() || '0',
      icon: <TeamOutlined />,
      trend: { value: 5, isPositive: true },
      color: 'accent' as const,
    },
    {
      title: 'Open Complaints',
      value: stats?.openComplaints?.toString() || '0',
      icon: <MessageOutlined />,
      trend: { value: 3, isPositive: false },
      color: 'error' as const,
    },
  ];

  const societyStats = {
    totalBuildings: buildings?.length || 0,
    totalUnits: stats?.totalUnits || 0,
    occupiedUnits: stats?.occupiedUnits || 0,
    vacantUnits: stats?.vacantUnits || 0,
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Welcome Header */}
      <div className="mb-6">
        <Title level={3} className="!mb-1">
          Welcome back, {user?.fullName || user?.firstName || 'Admin'} 👋
        </Title>
        <Text type="secondary">
          Here's what's happening in your society today.
        </Text>
      </div>

      {/* Stats Row */}
      <Row gutter={[16, 16]} className="mb-6">
        {dashboardStats.map((stat, index) => (
          <Col xs={12} sm={12} lg={6} key={index}>
            <StatsCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              color={stat.color}
              loading={statsLoading}
            />
          </Col>
        ))}
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Quick Actions */}
        <Col xs={24} lg={8}>
          <QuickActions />
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={16}>
          <RecentActivity
            activities={activities || []}
            loading={activitiesLoading}
          />
        </Col>
      </Row>

      {/* Society Overview */}
      <Row className="mt-6">
        <Col span={24}>
          <SocietyOverview stats={societyStats} loading={statsLoading} />
        </Col>
      </Row>
    </div>
  );
}
