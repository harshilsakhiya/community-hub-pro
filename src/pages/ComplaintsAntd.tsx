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
  Spin,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  BulbOutlined,
  SoundOutlined,
  DropboxOutlined,
} from '@ant-design/icons';
import { useComplaints, useComplaintStats, useCreateComplaint, useUnits } from '@/hooks/useSupabaseData';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

type ComplaintCategory = 'plumbing' | 'electrical' | 'noise' | 'maintenance' | 'security' | 'parking' | 'other';
type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    plumbing: <DropboxOutlined />,
    electrical: <BulbOutlined />,
    noise: <SoundOutlined />,
    default: <ToolOutlined />,
  };
  return icons[category] || icons.default;
};

export default function ComplaintsAntd() {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [form] = Form.useForm();

  const { data: complaints, isLoading } = useComplaints();
  const { data: stats, isLoading: statsLoading } = useComplaintStats();
  const { data: units } = useUnits();
  const createComplaintMutation = useCreateComplaint();

  const handleSubmit = async (values: any) => {
    try {
      await createComplaintMutation.mutateAsync({
        title: values.title,
        description: values.description,
        category: values.category,
        priority: values.priority,
        unitId: values.unitId,
      });
      message.success('Complaint submitted successfully');
      setIsModalOpen(false);
      form.resetFields();
    } catch {
      message.error('Failed to submit complaint');
    }
  };

  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode }> = {
      open: { color: 'error', icon: <ExclamationCircleOutlined /> },
      in_progress: { color: 'warning', icon: <ClockCircleOutlined /> },
      resolved: { color: 'success', icon: <CheckCircleOutlined /> },
      closed: { color: 'default', icon: <CheckCircleOutlined /> },
    };
    const { color, icon } = config[status] || config.open;
    return (
      <Tag color={color} icon={icon}>
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Tag>
    );
  };

  const getPriorityTag = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'red',
      high: 'orange',
      medium: 'blue',
      low: 'default',
    };
    return <Tag color={colors[priority] || 'default'}>{priority.toUpperCase()}</Tag>;
  };

  const columns = [
    {
      title: 'Ticket',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      render: (text: string) => <Text strong className="text-[#1e3a5f]">{text}</Text>,
    },
    {
      title: 'Issue',
      key: 'issue',
      render: (_: any, record: any) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            {getCategoryIcon(record.category)}
            <Text strong>{record.title}</Text>
          </div>
          <Paragraph type="secondary" ellipsis={{ rows: 1 }} className="!mb-0 text-xs">
            {record.description}
          </Paragraph>
        </div>
      ),
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
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => getPriorityTag(priority),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('DD MMM YYYY'),
    },
  ];

  const filteredComplaints = complaints?.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchText.toLowerCase()) ||
      c.ticket_number.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Title level={3} className="!mb-1">Complaints & Requests</Title>
          <Text type="secondary">
            Track and resolve resident complaints
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setIsModalOpen(true)}
        >
          New Complaint
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={8}>
          <Card>
            <Statistic
              title="Open"
              value={stats?.open || 0}
              prefix={<ExclamationCircleOutlined />}
              loading={statsLoading}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
        <Col xs={8}>
          <Card>
            <Statistic
              title="In Progress"
              value={stats?.inProgress || 0}
              prefix={<ClockCircleOutlined />}
              loading={statsLoading}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={8}>
          <Card>
            <Statistic
              title="Resolved"
              value={stats?.resolved || 0}
              prefix={<CheckCircleOutlined />}
              loading={statsLoading}
              valueStyle={{ color: '#22c55e' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card>
        <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search complaints..."
            className="max-w-md"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
            ]}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredComplaints}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* New Complaint Modal */}
      <Modal
        title="Submit New Complaint"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createComplaintMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Brief description of the issue" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} placeholder="Detailed description..." />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true }]}
                initialValue="other"
              >
                <Select
                  options={[
                    { value: 'plumbing', label: 'Plumbing' },
                    { value: 'electrical', label: 'Electrical' },
                    { value: 'noise', label: 'Noise' },
                    { value: 'maintenance', label: 'Maintenance' },
                    { value: 'security', label: 'Security' },
                    { value: 'parking', label: 'Parking' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true }]}
                initialValue="medium"
              >
                <Select
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="unitId"
            label="Unit"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select your unit"
              options={units?.map(u => ({
                value: u.id,
                label: `${u.block}-${u.unit_number}`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
