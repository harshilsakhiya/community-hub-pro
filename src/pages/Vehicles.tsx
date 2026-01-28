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
  DatePicker,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  CarOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useVehicles, useUnits } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const { Title, Text } = Typography;

export default function Vehicles() {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: vehicles, isLoading } = useVehicles();
  const { data: units } = useUnits();

  const createVehicleMutation = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase.from('vehicles').insert({
        vehicle_number: values.vehicleNumber,
        vehicle_type: values.vehicleType,
        make: values.make,
        model: values.model,
        color: values.color,
        parking_slot: values.parkingSlot,
        unit_id: values.unitId,
        owner_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      message.success('Vehicle registered successfully');
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to register vehicle');
    },
  });

  const columns = [
    {
      title: 'Vehicle',
      key: 'vehicle',
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <CarOutlined className="text-[#1e3a5f] text-lg" />
          </div>
          <div>
            <Text strong>{record.vehicle_number}</Text>
            <br />
            <Text type="secondary" className="text-xs">
              {record.make} {record.model}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'vehicle_type',
      key: 'vehicle_type',
      render: (type: string) => (
        <Tag color={type === 'car' ? 'blue' : type === 'bike' ? 'green' : 'orange'}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => color || '-',
    },
    {
      title: 'Parking Slot',
      dataIndex: 'parking_slot',
      key: 'parking_slot',
      render: (slot: string) => slot ? <Tag>{slot}</Tag> : '-',
    },
    {
      title: 'Unit',
      key: 'unit',
      render: (_: any, record: any) => (
        record.units ? (
          <Tag color="green">{record.units.block}-{record.units.unit_number}</Tag>
        ) : '-'
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button size="small" icon={<EditOutlined />} />
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  const stats = {
    total: vehicles?.length || 0,
    cars: vehicles?.filter(v => v.vehicle_type === 'car').length || 0,
    bikes: vehicles?.filter(v => v.vehicle_type === 'bike').length || 0,
    active: vehicles?.filter(v => v.is_active).length || 0,
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Title level={3} className="!mb-1">Vehicle Management</Title>
          <Text type="secondary">
            Register and manage resident vehicles
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => {
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          Register Vehicle
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Vehicles"
              value={stats.total}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Cars"
              value={stats.cars}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Bikes"
              value={stats.bikes}
              valueStyle={{ color: '#22c55e' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Active"
              value={stats.active}
              valueStyle={{ color: '#2d9676' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Card>
        <div className="mb-4">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search by vehicle number..."
            className="max-w-md"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        
        <Table
          columns={columns}
          dataSource={vehicles?.filter(v => 
            v.vehicle_number.toLowerCase().includes(searchText.toLowerCase())
          )}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Register Vehicle Modal */}
      <Modal
        title="Register New Vehicle"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createVehicleMutation.isPending}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => createVehicleMutation.mutate(values)}
          className="mt-4"
        >
          <Form.Item
            name="vehicleNumber"
            label="Vehicle Number"
            rules={[{ required: true, message: 'Please enter vehicle number' }]}
          >
            <Input placeholder="e.g., MH 12 AB 1234" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="vehicleType"
                label="Vehicle Type"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Select type"
                  options={[
                    { value: 'car', label: 'Car' },
                    { value: 'bike', label: 'Bike' },
                    { value: 'scooter', label: 'Scooter' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="color" label="Color">
                <Input placeholder="e.g., White" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="make" label="Make">
                <Input placeholder="e.g., Honda" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="model" label="Model">
                <Input placeholder="e.g., City" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="parkingSlot" label="Parking Slot">
                <Input placeholder="e.g., P-101" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unitId"
                label="Unit"
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
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
