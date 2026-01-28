import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  InputNumber,
  Typography,
  Tag,
  message,
  Popconfirm,
  Row,
  Col,
  Tabs,
  Empty,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  HomeOutlined,
  BuildOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { useBuildings, useWings, useUnits, useCreateBuilding, useCreateWing, useCreateUnit } from '@/hooks/useSupabaseData';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function Buildings() {
  const [activeTab, setActiveTab] = useState('buildings');
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'building' | 'wing' | 'unit'>('building');
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedWing, setSelectedWing] = useState<string | null>(null);
  const [form] = Form.useForm();

  const { data: buildings, isLoading: buildingsLoading } = useBuildings();
  const { data: wings, isLoading: wingsLoading } = useWings();
  const { data: units, isLoading: unitsLoading } = useUnits();
  
  const createBuildingMutation = useCreateBuilding();
  const createWingMutation = useCreateWing();
  const createUnitMutation = useCreateUnit();

  const openModal = (type: 'building' | 'wing' | 'unit', buildingId?: string, wingId?: string) => {
    setModalType(type);
    setSelectedBuilding(buildingId || null);
    setSelectedWing(wingId || null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (modalType === 'building') {
        await createBuildingMutation.mutateAsync({
          name: values.name,
          address: values.address,
          totalFloors: values.totalFloors,
        });
        message.success('Building created successfully');
      } else if (modalType === 'wing') {
        if (!selectedBuilding) return;
        await createWingMutation.mutateAsync({
          name: values.name,
          buildingId: selectedBuilding,
          totalUnits: values.totalUnits,
        });
        message.success('Wing created successfully');
      } else if (modalType === 'unit') {
        if (!selectedBuilding || !selectedWing) return;
        await createUnitMutation.mutateAsync({
          unitNumber: values.unitNumber,
          block: values.block,
          floorNumber: values.floorNumber,
          areaSqft: values.areaSqft,
          buildingId: selectedBuilding,
          wingId: selectedWing,
        });
        message.success('Unit created successfully');
      }
      
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const buildingColumns = [
    {
      title: 'Building Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <BuildOutlined className="text-[#2d9676]" />
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (text: string) => text || '-',
    },
    {
      title: 'Total Floors',
      dataIndex: 'total_floors',
      key: 'total_floors',
      render: (value: number) => value || '-',
    },
    {
      title: 'Wings',
      key: 'wings',
      render: (_: any, record: any) => {
        const buildingWings = wings?.filter(w => w.building_id === record.id) || [];
        return <Tag color="blue">{buildingWings.length} Wings</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => openModal('wing', record.id)}
          >
            Add Wing
          </Button>
          <Button size="small" icon={<EditOutlined />} />
          <Popconfirm title="Delete this building?" okText="Yes" cancelText="No">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const wingColumns = [
    {
      title: 'Wing Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <ApartmentOutlined className="text-[#1e3a5f]" />
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Building',
      key: 'building',
      render: (_: any, record: any) => {
        const building = buildings?.find(b => b.id === record.building_id);
        return building?.name || '-';
      },
    },
    {
      title: 'Total Units',
      dataIndex: 'total_units',
      key: 'total_units',
      render: (value: number) => value || 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => openModal('unit', record.building_id, record.id)}
          >
            Add Unit
          </Button>
          <Button size="small" icon={<EditOutlined />} />
          <Popconfirm title="Delete this wing?" okText="Yes" cancelText="No">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const unitColumns = [
    {
      title: 'Unit Number',
      dataIndex: 'unit_number',
      key: 'unit_number',
      render: (text: string, record: any) => (
        <div className="flex items-center gap-2">
          <HomeOutlined className="text-[#2d9676]" />
          <Text strong>{record.block}-{text}</Text>
        </div>
      ),
    },
    {
      title: 'Floor',
      dataIndex: 'floor_number',
      key: 'floor_number',
      render: (value: number) => value ? `Floor ${value}` : '-',
    },
    {
      title: 'Area (sq.ft)',
      dataIndex: 'area_sqft',
      key: 'area_sqft',
      render: (value: number) => value ? `${value} sq.ft` : '-',
    },
    {
      title: 'Status',
      dataIndex: 'is_occupied',
      key: 'is_occupied',
      render: (occupied: boolean) => (
        <Tag color={occupied ? 'green' : 'orange'}>
          {occupied ? 'Occupied' : 'Vacant'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button size="small" icon={<EditOutlined />} />
          <Popconfirm title="Delete this unit?" okText="Yes" cancelText="No">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const getModalTitle = () => {
    switch (modalType) {
      case 'building': return 'Add New Building';
      case 'wing': return 'Add New Wing';
      case 'unit': return 'Add New Unit';
    }
  };

  const renderModalForm = () => {
    switch (modalType) {
      case 'building':
        return (
          <>
            <Form.Item
              name="name"
              label="Building Name"
              rules={[{ required: true, message: 'Please enter building name' }]}
            >
              <Input placeholder="e.g., Tower A, Block 1" />
            </Form.Item>
            <Form.Item name="address" label="Address">
              <Input.TextArea placeholder="Building address" rows={2} />
            </Form.Item>
            <Form.Item name="totalFloors" label="Total Floors">
              <InputNumber min={1} max={100} className="w-full" />
            </Form.Item>
          </>
        );
      case 'wing':
        return (
          <>
            <Form.Item
              name="name"
              label="Wing Name"
              rules={[{ required: true, message: 'Please enter wing name' }]}
            >
              <Input placeholder="e.g., Wing A, West Wing" />
            </Form.Item>
            <Form.Item name="totalUnits" label="Total Units">
              <InputNumber min={1} max={1000} className="w-full" />
            </Form.Item>
          </>
        );
      case 'unit':
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="block"
                  label="Block"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input placeholder="e.g., A" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="unitNumber"
                  label="Unit Number"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input placeholder="e.g., 101" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="floorNumber" label="Floor Number">
                  <InputNumber min={0} max={100} className="w-full" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="areaSqft" label="Area (sq.ft)">
                  <InputNumber min={100} max={10000} className="w-full" />
                </Form.Item>
              </Col>
            </Row>
          </>
        );
    }
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Title level={3} className="!mb-1">Building Management</Title>
          <Text type="secondary">
            Manage buildings, wings, and units in your society
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => openModal('building')}
        >
          Add Building
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={8}>
          <Card className="text-center">
            <BuildOutlined className="text-3xl text-[#2d9676] mb-2" />
            <Title level={3} className="!mb-0">{buildings?.length || 0}</Title>
            <Text type="secondary">Buildings</Text>
          </Card>
        </Col>
        <Col xs={8}>
          <Card className="text-center">
            <ApartmentOutlined className="text-3xl text-[#1e3a5f] mb-2" />
            <Title level={3} className="!mb-0">{wings?.length || 0}</Title>
            <Text type="secondary">Wings</Text>
          </Card>
        </Col>
        <Col xs={8}>
          <Card className="text-center">
            <HomeOutlined className="text-3xl text-[#f59e0b] mb-2" />
            <Title level={3} className="!mb-0">{units?.length || 0}</Title>
            <Text type="secondary">Units</Text>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Buildings" key="buildings">
            <div className="mb-4">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search buildings..."
                className="max-w-md"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <Table
              columns={buildingColumns}
              dataSource={buildings?.filter(b => 
                b.name.toLowerCase().includes(searchText.toLowerCase())
              )}
              rowKey="id"
              loading={buildingsLoading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          
          <TabPane tab="Wings" key="wings">
            <div className="mb-4">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search wings..."
                className="max-w-md"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <Table
              columns={wingColumns}
              dataSource={wings?.filter(w => 
                w.name.toLowerCase().includes(searchText.toLowerCase())
              )}
              rowKey="id"
              loading={wingsLoading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          
          <TabPane tab="Units" key="units">
            <div className="mb-4">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search units..."
                className="max-w-md"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <Table
              columns={unitColumns}
              dataSource={units?.filter(u => 
                u.unit_number.toLowerCase().includes(searchText.toLowerCase()) ||
                u.block.toLowerCase().includes(searchText.toLowerCase())
              )}
              rowKey="id"
              loading={unitsLoading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal */}
      <Modal
        title={getModalTitle()}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={
          createBuildingMutation.isPending ||
          createWingMutation.isPending ||
          createUnitMutation.isPending
        }
      >
        <Form form={form} layout="vertical" className="mt-4">
          {renderModalForm()}
        </Form>
      </Modal>
    </div>
  );
}
