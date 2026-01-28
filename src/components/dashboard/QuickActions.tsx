import { Card, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';
import {
  CreditCardOutlined,
  UserAddOutlined,
  NotificationOutlined,
  BarChartOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { ReactNode } from 'react';

const { Title } = Typography;

interface QuickAction {
  label: string;
  icon: ReactNode;
  path: string;
  color: string;
}

const defaultActions: QuickAction[] = [
  {
    label: 'Generate Bills',
    icon: <CreditCardOutlined />,
    path: '/dashboard/billing',
    color: '#2d9676',
  },
  {
    label: 'Add Visitor',
    icon: <UserAddOutlined />,
    path: '/dashboard/visitors',
    color: '#3b82f6',
  },
  {
    label: 'Post Notice',
    icon: <NotificationOutlined />,
    path: '/dashboard/notices',
    color: '#f59e0b',
  },
  {
    label: 'View Reports',
    icon: <BarChartOutlined />,
    path: '/dashboard/reports',
    color: '#8b5cf6',
  },
];

interface QuickActionsProps {
  actions?: QuickAction[];
}

export default function QuickActions({ actions = defaultActions }: QuickActionsProps) {
  return (
    <Card 
      title={<Title level={5} className="!mb-0">Quick Actions</Title>}
      className="h-full"
    >
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Link key={index} to={action.path}>
            <Button
              block
              size="large"
              className="!h-14 !flex !items-center !justify-start hover:!border-[#2d9676] group"
              icon={
                <span
                  className="text-lg mr-2"
                  style={{ color: action.color }}
                >
                  {action.icon}
                </span>
              }
            >
              <span className="flex-1 text-left font-medium">{action.label}</span>
              <ArrowRightOutlined className="text-gray-400 group-hover:text-[#2d9676] transition-colors" />
            </Button>
          </Link>
        ))}
      </div>
    </Card>
  );
}
