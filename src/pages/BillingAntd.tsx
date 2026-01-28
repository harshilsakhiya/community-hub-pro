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
  DatePicker,
  InputNumber,
  Typography,
  Tag,
  message,
  Row,
  Col,
  Statistic,
  Dropdown,
  Spin,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  DownloadOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useBills, useBillStats, useMarkBillPaid, useUnits } from '@/hooks/useSupabaseData';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function BillingAntd() {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [form] = Form.useForm();

  const { data: bills, isLoading: billsLoading } = useBills();
  const { data: stats, isLoading: statsLoading } = useBillStats();
  const { data: units } = useUnits();
  const markPaidMutation = useMarkBillPaid();

  const handleMarkPaid = (billId: string) => {
    markPaidMutation.mutate(
      { billId, paymentMethod: 'cash' },
      {
        onSuccess: () => message.success('Bill marked as paid'),
        onError: () => message.error('Failed to update bill'),
      }
    );
  };

  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode }> = {
      paid: { color: 'success', icon: <CheckCircleOutlined /> },
      pending: { color: 'warning', icon: <ClockCircleOutlined /> },
      overdue: { color: 'error', icon: <ExclamationCircleOutlined /> },
    };
    const { color, icon } = config[status] || config.pending;
    return (
      <Tag color={color} icon={icon}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Tag>
    );
  };

  const getActionItems = (record: any): MenuProps['items'] => [
    {
      key: 'download',
      icon: <DownloadOutlined />,
      label: 'Download Invoice',
    },
    {
      key: 'remind',
      icon: <SendOutlined />,
      label: 'Send Reminder',
      disabled: record.status === 'paid',
    },
    {
      key: 'paid',
      icon: <CheckCircleOutlined />,
      label: 'Mark as Paid',
      disabled: record.status === 'paid',
      onClick: () => handleMarkPaid(record.id),
    },
  ];

  const columns = [
    {
      title: 'Invoice',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      render: (text: string) => <Text strong>{text}</Text>,
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
      title: 'Amount',
      key: 'amount',
      align: 'right' as const,
      render: (_: any, record: any) => (
        <Text strong>
          ₹{(Number(record.amount) + Number(record.late_fee || 0)).toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Dropdown menu={{ items: getActionItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const filteredBills = bills?.filter(bill => {
    const matchesSearch = 
      bill.invoice_number.toLowerCase().includes(searchText.toLowerCase()) ||
      bill.units?.unit_number.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Title level={3} className="!mb-1">Maintenance Billing</Title>
          <Text type="secondary">
            Manage bills, payments, and send reminders
          </Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />}>Export</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Generate Bills
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Billed"
              value={stats?.totalBilled || 0}
              prefix="₹"
              loading={statsLoading}
              valueStyle={{ color: '#1e3a5f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Collected"
              value={stats?.collected || 0}
              prefix="₹"
              loading={statsLoading}
              valueStyle={{ color: '#22c55e' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Pending"
              value={stats?.pending || 0}
              prefix="₹"
              loading={statsLoading}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Overdue"
              value={stats?.overdue || 0}
              prefix="₹"
              loading={statsLoading}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card>
        <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search by invoice or unit..."
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
              { value: 'pending', label: 'Pending' },
              { value: 'paid', label: 'Paid' },
              { value: 'overdue', label: 'Overdue' },
            ]}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredBills}
          rowKey="id"
          loading={billsLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Generate Bills Modal */}
      <Modal
        title="Generate Monthly Bills"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => {
          form.submit();
        }}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="billingMonth"
            label="Billing Month"
            rules={[{ required: true }]}
          >
            <DatePicker picker="month" className="w-full" />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount per Unit"
            rules={[{ required: true }]}
          >
            <InputNumber
              prefix="₹"
              min={0}
              className="w-full"
              placeholder="Enter amount"
            />
          </Form.Item>
          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
