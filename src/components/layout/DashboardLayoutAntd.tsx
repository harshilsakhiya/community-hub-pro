import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Typography,
  Space,
  Drawer,
  theme,
} from 'antd';
import {
  DashboardOutlined,
  CreditCardOutlined,
  UserOutlined,
  MessageOutlined,
  BellOutlined,
  SafetyOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  TeamOutlined,
  CarOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/dashboard/buildings', icon: <HomeOutlined />, label: 'Buildings' },
  { key: '/dashboard/residents', icon: <TeamOutlined />, label: 'Residents' },
  { key: '/dashboard/billing', icon: <CreditCardOutlined />, label: 'Billing' },
  { key: '/dashboard/visitors', icon: <UserOutlined />, label: 'Visitors' },
  { key: '/dashboard/vehicles', icon: <CarOutlined />, label: 'Vehicles' },
  { key: '/dashboard/complaints', icon: <MessageOutlined />, label: 'Complaints' },
  { key: '/dashboard/notices', icon: <BellOutlined />, label: 'Notices' },
  { key: '/dashboard/security', icon: <SafetyOutlined />, label: 'Security' },
  { key: '/dashboard/reports', icon: <BarChartOutlined />, label: 'Reports' },
  { key: '/dashboard/settings', icon: <SettingOutlined />, label: 'Settings' },
];

export default function DashboardLayoutAntd() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const { token } = theme.useToken();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      navigate('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to logout. Please try again.',
      });
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile',
      onClick: () => navigate('/dashboard/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/dashboard/settings'),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const siderContent = (
    <>
      <div className="h-16 flex items-center justify-center border-b border-gray-800">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2d9676] flex items-center justify-center">
            <HomeOutlined className="text-white text-lg" />
          </div>
          {!collapsed && (
            <Text strong className="text-white text-lg">
              SocietyHub
            </Text>
          )}
        </Link>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems.map((item) => ({
          ...item,
          label: <Link to={item.key}>{item.label}</Link>,
        }))}
        style={{
          borderRight: 0,
          backgroundColor: 'transparent',
        }}
      />
    </>
  );

  return (
    <Layout className="min-h-screen">
      {/* Desktop Sider */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth={80}
        className="!bg-[#1e3a5f] hidden lg:block fixed left-0 top-0 bottom-0 z-50"
        width={256}
      >
        {siderContent}
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
        styles={{ body: { padding: 0, backgroundColor: '#1e3a5f' } }}
        width={256}
        className="lg:hidden"
      >
        {siderContent}
      </Drawer>

      <Layout className={`${collapsed ? 'lg:ml-20' : 'lg:ml-64'} transition-all duration-300`}>
        {/* Header */}
        <Header
          className="!bg-white !px-4 lg:!px-6 flex items-center justify-between border-b border-gray-200 sticky top-0 z-40"
          style={{ height: 64 }}
        >
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={mobileOpen || collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileOpen(!mobileOpen);
                } else {
                  setCollapsed(!collapsed);
                }
              }}
              className="!w-10 !h-10"
            />
            <div className="hidden sm:block">
              <Text strong className="text-lg">
                {menuItems.find((item) => item.key === location.pathname)?.label || 'Dashboard'}
              </Text>
            </div>
          </div>

          <Space size="middle">
            <Button
              type="text"
              icon={<BellOutlined className="text-lg" />}
              className="!w-10 !h-10"
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
                <Avatar
                  size={36}
                  src={user?.avatar}
                  icon={<UserOutlined />}
                  className="bg-[#2d9676]"
                />
                <div className="hidden sm:block">
                  <Text strong className="block text-sm">
                    {user?.fullName || 'User'}
                  </Text>
                  <Text type="secondary" className="text-xs">
                    {user?.role || 'Resident'}
                  </Text>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Content */}
        <Content className="bg-gray-50 min-h-[calc(100vh-64px)]">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
