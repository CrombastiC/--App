import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, theme, Dropdown } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CoffeeOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { clearAuth, getUser } from '@/lib/auth';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: '/menu',
    icon: <CoffeeOutlined />,
    label: '菜单管理',
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
