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
  Avatar,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useUnits } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const { Title, Text } = Typography;

interface Resident {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  unit?: {
    id: string;
    block: string;
    unit_number: string;
  };
}

export default function Residents() {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [form] = Form.useForm();

  const { data: units } = useUnits();

  // Fetch residents with their units
  const { data: residents, isLoading, refetch } = useQuery({
    queryKey: ['residents'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Get unit assignments
      const { data: unitData } = await supabase
        .from('units')
        .select('id, owner_id, block, unit_number');

      return profiles.map(profile => ({
        ...profile,
        unit: unitData?.find(u => u.owner_id === profile.id),
      }));
    },
  });

  const handleAssignUnit = async () => {
    try {
      const values = await form.validateFields();
      
      if (selectedResident && values.unitId) {
        const { error } = await supabase
          .from('units')
          .update({ owner_id: selectedResident.id })
          .eq('id', values.unitId);

        if (error) throw error;
        
        message.success('Unit assigned successfully');
        setIsModalOpen(false);
        refetch();
      }
    } catch (error) {
      message.error('Failed to assign unit');
    }
  };

  const columns = [
    {
      title: 'Resident',
      key: 'resident',
      render: (_: any, record: Resident) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            src={record.avatar_url}
            icon={<UserOutlined />}
            className="bg-[#2d9676]"
          />
          <div>
            <Text strong>{record.full_name || 'Unknown'}</Text>
            <br />
            <Text type="secondary" className="text-xs">
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => (
        <div className="flex items-center gap-2">
          <PhoneOutlined className="text-gray-400" />
          <span>{phone || '-'}</span>
        </div>
      ),
    },
    {
      title: 'Unit',
      key: 'unit',
      render: (_: any, record: Resident) => (
        record.unit ? (
          <Tag color="green" icon={<HomeOutlined />}>
            {record.unit.block}-{record.unit.unit_number}
          </Tag>
        ) : (
          <Tag color="orange">Unassigned</Tag>
        )
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: Resident) => (
        <Tag color={record.unit ? 'green' : 'default'}>
          {record.unit ? 'Active' : 'Pending'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Resident) => (
        <Space>
          {!record.unit && (
            <Button
              type="primary"
              size="small"
              icon={<HomeOutlined />}
              onClick={() => {
                setSelectedResident(record);
                form.resetFields();
                setIsModalOpen(true);
              }}
            >
              Assign Unit
            </Button>
          )}
          <Button size="small" icon={<EditOutlined />}>
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  const stats = {
    total: residents?.length || 0,
    assigned: residents?.filter(r => r.unit).length || 0,
    pending: residents?.filter(r => !r.unit).length || 0,
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Title level={3} className="!mb-1">Resident Management</Title>
          <Text type="secondary">
            View and manage all residents in your society
          </Text>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={8}>
          <Card className="text-center">
            <UserOutlined className="text-3xl text-[#2d9676] mb-2" />
            <Title level={3} className="!mb-0">{stats.total}</Title>
            <Text type="secondary">Total Residents</Text>
          </Card>
        </Col>
        <Col xs={8}>
          <Card className="text-center">
            <HomeOutlined className="text-3xl text-[#22c55e] mb-2" />
            <Title level={3} className="!mb-0">{stats.assigned}</Title>
            <Text type="secondary">With Units</Text>
          </Card>
        </Col>
        <Col xs={8}>
          <Card className="text-center">
            <UserOutlined className="text-3xl text-[#f59e0b] mb-2" />
            <Title level={3} className="!mb-0">{stats.pending}</Title>
            <Text type="secondary">Pending Assignment</Text>
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Card>
        <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search residents by name, email, or phone..."
            className="max-w-md"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        
        <Table
          columns={columns}
          dataSource={residents?.filter(r => 
            r.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            r.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            r.phone?.includes(searchText)
          )}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Assign Unit Modal */}
      <Modal
        title="Assign Unit to Resident"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAssignUnit}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item label="Resident">
            <Input
              value={selectedResident?.full_name || selectedResident?.email}
              disabled
              prefix={<UserOutlined />}
            />
          </Form.Item>
          <Form.Item
            name="unitId"
            label="Select Unit"
            rules={[{ required: true, message: 'Please select a unit' }]}
          >
            <Select
              placeholder="Choose a unit"
              options={units
                ?.filter(u => !u.owner_id)
                .map(u => ({
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
