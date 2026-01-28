import { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Select,
  Typography,
  Tag,
  message,
  List,
  Avatar,
  Dropdown,
  Spin,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  PushpinOutlined,
  PushpinFilled,
  CalendarOutlined,
  BellOutlined,
  AlertOutlined,
  TeamOutlined,
  ToolOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useNotices, useCreateNotice, useToggleNoticePin } from '@/hooks/useSupabaseData';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const getCategoryConfig = (category: string) => {
  const configs: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    meeting: { icon: <TeamOutlined />, color: '#2d9676', bg: 'rgba(45, 150, 118, 0.1)' },
    maintenance: { icon: <ToolOutlined />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    event: { icon: <BellOutlined />, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
    announcement: { icon: <AlertOutlined />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    default: { icon: <BellOutlined />, color: '#1e3a5f', bg: 'rgba(30, 58, 95, 0.1)' },
  };
  return configs[category] || configs.default;
};

export default function NoticesAntd() {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: notices, isLoading } = useNotices();
  const createNoticeMutation = useCreateNotice();
  const togglePinMutation = useToggleNoticePin();

  const handleSubmit = async (values: any) => {
    try {
      await createNoticeMutation.mutateAsync({
        title: values.title,
        content: values.content,
        category: values.category,
        priority: values.priority,
      });
      message.success('Notice posted successfully');
      setIsModalOpen(false);
      form.resetFields();
    } catch {
      message.error('Failed to post notice');
    }
  };

  const handleTogglePin = (noticeId: string, isPinned: boolean | null) => {
    togglePinMutation.mutate(
      { noticeId, isPinned: isPinned || false },
      {
        onSuccess: () => message.success(isPinned ? 'Notice unpinned' : 'Notice pinned'),
      }
    );
  };

  const getMenuItems = (notice: any): MenuProps['items'] => [
    {
      key: 'pin',
      icon: notice.is_pinned ? <PushpinOutlined /> : <PushpinFilled />,
      label: notice.is_pinned ? 'Unpin Notice' : 'Pin Notice',
      onClick: () => handleTogglePin(notice.id, notice.is_pinned),
    },
    { key: 'edit', label: 'Edit Notice' },
    { key: 'delete', label: 'Delete Notice', danger: true },
  ];

  const filteredNotices = notices
    ?.filter(n => {
      const matchesSearch = 
        n.title.toLowerCase().includes(searchText.toLowerCase()) ||
        n.content.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || n.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    ?.sort((a, b) => {
      // Pinned first
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
    });

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Title level={3} className="!mb-1">Notice Board</Title>
          <Text type="secondary">
            Announcements and updates for all residents
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setIsModalOpen(true)}
        >
          Post Notice
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search notices..."
            className="max-w-md"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Space wrap>
            {['all', 'general', 'meeting', 'event', 'maintenance', 'announcement'].map(cat => (
              <Button
                key={cat}
                type={categoryFilter === cat ? 'primary' : 'default'}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </Space>
        </div>
      </Card>

      {/* Notices List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <List
          itemLayout="vertical"
          dataSource={filteredNotices}
          renderItem={(notice) => {
            const config = getCategoryConfig(notice.category);
            const isUrgent = notice.priority === 'urgent';
            
            return (
              <Card 
                className={`mb-4 hover:shadow-md transition-shadow ${isUrgent ? 'border-l-4 border-l-red-500' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    icon={config.icon}
                    style={{ backgroundColor: config.bg, color: config.color }}
                    size={48}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Title level={5} className="!mb-0">{notice.title}</Title>
                      {notice.is_pinned && (
                        <PushpinFilled className="text-[#2d9676]" />
                      )}
                      {isUrgent && (
                        <Tag color="red">Urgent</Tag>
                      )}
                      <Tag color="blue">{notice.category}</Tag>
                    </div>
                    <Paragraph className="!mb-3 text-gray-600" ellipsis={{ rows: 2 }}>
                      {notice.content}
                    </Paragraph>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarOutlined />
                        {dayjs(notice.publish_date).format('DD MMM YYYY')}
                      </span>
                    </div>
                  </div>
                  <Dropdown menu={{ items: getMenuItems(notice) }} trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                </div>
              </Card>
            );
          }}
          locale={{ emptyText: 'No notices found' }}
        />
      )}

      {/* Post Notice Modal */}
      <Modal
        title="Post New Notice"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createNoticeMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Notice title" />
          </Form.Item>
          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} placeholder="Notice content..." />
          </Form.Item>
          <Space className="w-full" direction="horizontal">
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true }]}
              initialValue="general"
              className="flex-1"
            >
              <Select
                options={[
                  { value: 'general', label: 'General' },
                  { value: 'meeting', label: 'Meeting' },
                  { value: 'event', label: 'Event' },
                  { value: 'maintenance', label: 'Maintenance' },
                  { value: 'announcement', label: 'Announcement' },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="priority"
              label="Priority"
              rules={[{ required: true }]}
              initialValue="normal"
              className="flex-1"
            >
              <Select
                options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
              />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
