import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Select,
  Typography,
  Tag,
  message,
  Row,
  Col,
  Statistic,
  Avatar,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  CarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useVisitors, useVisitorStats, useCreateVisitor, useCheckOutVisitor, useUnits } from '@/hooks/useSupabaseData';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function VisitorsAntd() {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: visitors, isLoading } = useVisitors();
  const { data: stats, isLoading: statsLoading } = useVisitorStats();
  const { data: units } = useUnits();
  const createVisitorMutation = useCreateVisitor();
  const checkOutMutation = useCheckOutVisitor();

  const handleSubmit = async (values: any) => {
    try {
      await createVisitorMutation.mutateAsync({
        name: values.name,
        phone: values.phone,
        purpose: values.purpose,
        unitId: values.unitId,
        vehicleNumber: values.vehicleNumber,
      });
      message.success('Visitor registered successfully');
      setIsModalOpen(false);
      form.resetFields();
    } catch {
      message.error('Failed to register visitor');
    }
  };

  const handleCheckOut = async (visitorId: string) => {
    try {
      await checkOutMutation.mutateAsync(visitorId);
      message.success('Visitor checked out');
    } catch {
      message.error('Failed to check out visitor');
    }
  };

  const columns = [
    {
      title: 'Visitor',
      key: 'visitor',
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar
            icon={<UserOutlined />}
            className="bg-[#2d9676]"
          >
            {record.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </Avatar>
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" className="text-xs">{record.phone || 'No phone'}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Purpose',
      dataIndex: 'purpose',
      key: 'purpose',
    },
    {
      title: 'Unit',
      key: 'unit',
      render: (_: any, record: any) => (
        record.units ? (
          <Tag color="blue">{record.units.block}-{record.units.unit_number}</Tag>
        ) : '-'
      ),
    },
    {
      title: 'Vehicle',
      dataIndex: 'vehicle_number',
      key: 'vehicle_number',
      render: (text: string) => text ? (
        <div className="flex items-center gap-1">
          <CarOutlined className="text-gray-400" />
          <span>{text}</span>
        </div>
      ) : '-',
    },
    {
      title: 'Check In',
      dataIndex: 'check_in_time',
      key: 'check_in_time',
      render: (time: string) => time ? dayjs(time).format('hh:mm A') : '-',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: any) => {
        const isInside = record.check_in_time && !record.check_out_time;
        return (
          <Tag color={isInside ? 'success' : 'default'} icon={isInside ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
            {isInside ? 'Inside' : 'Exited'}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => {
        const isInside = record.check_in_time && !record.check_out_time;
        return isInside ? (
          <Button
            size="small"
            icon={<LogoutOutlined />}
            onClick={() => handleCheckOut(record.id)}
            loading={checkOutMutation.isPending}
          >
            Check Out
          </Button>
        ) : null;
      },
    },
  ];

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Title level={3} className="!mb-1">Visitor Management</Title>
          <Text type="secondary">
            Track and manage visitor entries and exits
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setIsModalOpen(true)}
        >
          Add Visitor
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Inside Now"
              value={stats?.insideNow || 0}
              prefix={<UserOutlined />}
              loading={statsLoading}
              valueStyle={{ color: '#2d9676' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Today's Entries"
              value={stats?.todayEntries || 0}
              prefix={<LoginOutlined />}
              loading={statsLoading}
              valueStyle={{ color: '#22c55e' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Today's Exits"
              value={stats?.todayExits || 0}
              prefix={<LogoutOutlined />}
              loading={statsLoading}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Pre-Approved"
              value={stats?.preApproved || 0}
              prefix={<CheckCircleOutlined />}
              loading={statsLoading}
              valueStyle={{ color: '#1e3a5f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card>
        <div className="mb-4">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search visitors..."
            className="max-w-md"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <Table
          columns={columns}
          dataSource={visitors?.filter(v =>
            v.name.toLowerCase().includes(searchText.toLowerCase()) ||
            v.phone?.includes(searchText)
          )}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Add Visitor Modal */}
      <Modal
        title="Register New Visitor"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createVisitorMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Form.Item
            name="name"
            label="Visitor Name"
            rules={[{ required: true, message: 'Please enter visitor name' }]}
          >
            <Input placeholder="Full name" />
          </Form.Item>
          <Form.Item name="phone" label="Phone Number">
            <Input placeholder="+91 98765 43210" />
          </Form.Item>
          <Form.Item
            name="purpose"
            label="Purpose of Visit"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select purpose"
              options={[
                { value: 'Guest Visit', label: 'Guest Visit' },
                { value: 'Delivery', label: 'Delivery' },
                { value: 'Service', label: 'Service' },
                { value: 'Other', label: 'Other' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="unitId"
            label="Visiting Unit"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select unit"
              options={units?.map(u => ({
                value: u.id,
                label: `${u.block}-${u.unit_number}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="vehicleNumber" label="Vehicle Number (Optional)">
            <Input placeholder="MH 12 AB 1234" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
