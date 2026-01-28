import {
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  Progress,
  Button,
  Select,
  Spin,
} from 'antd';
import {
  DownloadOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  MessageOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { useDashboardStats, useBillStats, useComplaintStats, useVisitorStats } from '@/hooks/useSupabaseData';

const { Title, Text } = Typography;

const monthlyData = [
  { month: 'Aug', collection: 85 },
  { month: 'Sep', collection: 92 },
  { month: 'Oct', collection: 78 },
  { month: 'Nov', collection: 88 },
  { month: 'Dec', collection: 95 },
  { month: 'Jan', collection: 87 },
];

export default function ReportsAntd() {
  const { data: dashboardStats, isLoading: dashboardLoading } = useDashboardStats();
  const { data: billStats, isLoading: billsLoading } = useBillStats();
  const { data: complaintStats, isLoading: complaintsLoading } = useComplaintStats();
  const { data: visitorStats, isLoading: visitorsLoading } = useVisitorStats();

  const isLoading = dashboardLoading || billsLoading || complaintsLoading || visitorsLoading;

  const summaryStats = [
    {
      title: 'Total Collection YTD',
      value: billStats?.collected || 0,
      prefix: '₹',
      change: 15,
      isPositive: true,
      icon: <DollarOutlined />,
    },
    {
      title: 'Pending Amount',
      value: billStats?.pending || 0,
      prefix: '₹',
      change: 8,
      isPositive: false,
      icon: <DollarOutlined />,
    },
    {
      title: 'Active Residents',
      value: dashboardStats?.occupiedUnits || 0,
      change: 5,
      isPositive: true,
      icon: <UserOutlined />,
    },
    {
      title: 'Complaints Resolved',
      value: complaintStats?.resolved || 0,
      change: 23,
      isPositive: true,
      icon: <MessageOutlined />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Title level={3} className="!mb-1">Reports & Analytics</Title>
          <Text type="secondary">
            Insights and trends for your society
          </Text>
        </div>
        <div className="flex gap-3">
          <Select
            defaultValue="month"
            style={{ width: 150 }}
            options={[
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'quarter', label: 'This Quarter' },
              { value: 'year', label: 'This Year' },
            ]}
          />
          <Button icon={<DownloadOutlined />} type="primary">
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        {summaryStats.map((stat, index) => (
          <Col xs={12} lg={6} key={index}>
            <Card>
              <div className="flex items-start justify-between mb-2">
                <div className="p-3 rounded-xl bg-[rgba(45,150,118,0.1)] text-[#2d9676]">
                  {stat.icon}
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {stat.change}%
                </div>
              </div>
              <Statistic
                title={<Text type="secondary" className="text-sm">{stat.title}</Text>}
                value={stat.value}
                prefix={stat.prefix}
                valueStyle={{ fontSize: 24, fontWeight: 700 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]}>
        {/* Collection Trend */}
        <Col xs={24} lg={12}>
          <Card title="Collection Trend" className="h-full">
            <div className="h-64 flex items-end justify-between gap-2">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden"
                    style={{ height: 200 }}
                  >
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-[#2d9676] rounded-t-lg transition-all duration-500 hover:bg-[#238c6a]"
                      style={{ height: `${data.collection}%` }}
                    />
                  </div>
                  <Text type="secondary" className="text-xs">{data.month}</Text>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#2d9676]" />
                <Text type="secondary" className="text-sm">Collection %</Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Monthly Breakdown */}
        <Col xs={24} lg={12}>
          <Card title="Monthly Breakdown" className="h-full">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <Text type="secondary">Maintenance Collected</Text>
                  <Text strong>₹{(billStats?.collected || 0).toLocaleString()}</Text>
                </div>
                <Progress 
                  percent={billStats?.totalBilled 
                    ? Math.round((billStats.collected / billStats.totalBilled) * 100) 
                    : 0
                  } 
                  showInfo={false}
                  strokeColor="#22c55e"
                />
                <Text type="secondary" className="text-xs">
                  {billStats?.totalBilled 
                    ? Math.round((billStats.collected / billStats.totalBilled) * 100) 
                    : 0}% of target
                </Text>
              </div>

              <div className="p-4 rounded-xl bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <Text type="secondary">Pending Dues</Text>
                  <Text strong>₹{(billStats?.pending || 0).toLocaleString()}</Text>
                </div>
                <Progress 
                  percent={billStats?.totalBilled 
                    ? Math.round((billStats.pending / billStats.totalBilled) * 100) 
                    : 0
                  } 
                  showInfo={false}
                  strokeColor="#f59e0b"
                />
              </div>

              <div className="p-4 rounded-xl bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <Text type="secondary">Overdue Amount</Text>
                  <Text strong>₹{(billStats?.overdue || 0).toLocaleString()}</Text>
                </div>
                <Progress 
                  percent={billStats?.totalBilled 
                    ? Math.round((billStats.overdue / billStats.totalBilled) * 100) 
                    : 0
                  } 
                  showInfo={false}
                  strokeColor="#ef4444"
                />
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <div className="text-center p-4 rounded-xl bg-green-50">
                    <Text className="text-2xl font-bold text-green-600 block">
                      {complaintStats?.resolved || 0}
                    </Text>
                    <Text type="secondary" className="text-sm">Complaints Resolved</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="text-center p-4 rounded-xl bg-blue-50">
                    <Text className="text-2xl font-bold text-blue-600 block">
                      {visitorStats?.todayEntries || 0}
                    </Text>
                    <Text type="secondary" className="text-sm">Visitor Entries</Text>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
