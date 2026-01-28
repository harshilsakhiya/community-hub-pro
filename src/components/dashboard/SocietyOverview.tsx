import { Card, Row, Col, Typography, Progress } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface SocietyStats {
  totalBuildings: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
}

interface SocietyOverviewProps {
  stats: SocietyStats;
  loading?: boolean;
}

export default function SocietyOverview({ stats, loading = false }: SocietyOverviewProps) {
  const occupancyRate = stats.totalUnits > 0 
    ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100) 
    : 0;

  const overviewItems = [
    { label: 'Buildings', value: stats.totalBuildings, color: '#1e3a5f' },
    { label: 'Total Units', value: stats.totalUnits, color: '#2d9676' },
    { label: 'Occupied', value: stats.occupiedUnits, color: '#22c55e' },
    { label: 'Vacant', value: stats.vacantUnits, color: '#f59e0b' },
  ];

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <HomeOutlined style={{ color: '#2d9676' }} />
          <Title level={5} className="!mb-0">Society Overview</Title>
        </div>
      }
    >
      <Row gutter={[16, 16]}>
        {overviewItems.map((item, index) => (
          <Col xs={12} sm={6} key={index}>
            <div className="text-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <Text 
                className="text-3xl font-bold block mb-1"
                style={{ color: item.color }}
              >
                {loading ? '-' : item.value}
              </Text>
              <Text type="secondary" className="text-sm">
                {item.label}
              </Text>
            </div>
          </Col>
        ))}
      </Row>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <Text type="secondary">Occupancy Rate</Text>
          <Text strong>{occupancyRate}%</Text>
        </div>
        <Progress 
          percent={occupancyRate} 
          showInfo={false}
          strokeColor="#2d9676"
          trailColor="#e5e7eb"
        />
      </div>
    </Card>
  );
}
