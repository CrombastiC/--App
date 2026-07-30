import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, theme, Dropdown } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CoffeeOutlined,
  DollarOutlined,
  GiftOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  TagsOutlined,
  CreditCardOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { clearAuth, getUser } from '@/lib/auth';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '经营概览',
  },
  {
    key: '/orders',
    icon: <ShoppingCartOutlined />,
    label: '订单管理',
  },
  {
    key: '/users',
    icon: <TeamOutlined />,
    label: '用户管理',
  },
  {
    key: '/menu',
    icon: <CoffeeOutlined />,
    label: '菜单管理',
  },
  {
    key: '/money',
    icon: <DollarOutlined />,
    label: '充值选项',
  },
  {
    key: '/commodity',
    icon: <GiftOutlined />,
    label: '积分礼品',
  },
  {
    key: '/prizes',
    icon: <TrophyOutlined />,
    label: '抽奖奖品',
  },
  {
    key: '/coupons',
    icon: <TagsOutlined />,
    label: '优惠券管理',
  },
  {
    key: '/gift-cards',
    icon: <CreditCardOutlined />,
    label: '礼品卡管理',
  },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const dropdownItems = {
    items: [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout style={styles.layout}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={styles.logo}>
          {collapsed ? 'OF' : 'OrderFood'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ ...styles.header, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Dropdown menu={dropdownItems} placement="bottomRight">
            <Button type="text" icon={<UserOutlined />}>
              {(user as { username?: string })?.username || '管理员'}
            </Button>
          </Dropdown>
        </Header>
        <Content style={{ ...styles.content, background: colorBgContainer, borderRadius: borderRadiusLG }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  layout: {
    minHeight: '100vh',
  },
  logo: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  header: {
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    margin: 24,
    padding: 24,
    overflow: 'auto',
  },
};
