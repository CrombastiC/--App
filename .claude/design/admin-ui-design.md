# 管理后台（admin）界面设计文档

基于 `.claude/rules/code-style.md` 设计规范，为 `apps/admin/` 管理后台提供 4 张核心界面的高保真设计。

---

## 1. 管理后台登录页

### 1.1 布局

```
┌─────────────────────────────────────┐
│                                     │
│    ┌─────────────────────────┐      │
│    │      🍴 管理后台        │      │
│    │                         │      │
│    │   手机号                │      │
│    │   ┌─────────────────┐   │      │
│    │   │ 13800138000     │   │      │
│    │   └─────────────────┘   │      │
│    │                         │      │
│    │   密码                  │      │
│    │   ┌─────────────────┐   │      │
│    │   │ ●●●●●●          │   │      │
│    │   └─────────────────┘   │      │
│    │                         │      │
│    │   ┌─────────────────┐   │      │
│    │   │    登  录        │   │      │
│    │   └─────────────────┘   │      │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

### 1.2 设计 Token

| 元素 | Token | 值 |
|------|-------|-----|
| 页面背景 | `bgPage` | `#F6EAE3` |
| 卡片背景 | `surface` | `#FFFFFF` |
| 卡片圆角 | `xl` | `16px` |
| 卡片阴影 | 浮层阴影 | `shadowOffset: {0, 4}, shadowOpacity: 0.15, shadowRadius: 12` |
| 输入框背景 | `bgInput` | `#F5F5F5` |
| 输入框圆角 | `md` | `8px` |
| 输入框高度 | — | `48px` |
| 按钮背景 | `primary` | `#FF7214` |
| 按钮圆角 | `lg` | `12px` |
| 按钮内边距 | — | `12px 24px` |
| 标题字号 | `h1` | `24px` |
| 标题颜色 | `textPrimary` | `#333333` |
| 卡片宽度 | — | `420px`，水平居中 |

### 1.3 组件代码框架

```tsx
// apps/admin/app/login/page.tsx
import { Card, Input, Button, Typography } from 'antd';
import styles from './page.module.css';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <h1 className={styles.title}>🍴 管理后台</h1>
        <Input placeholder="手机号" className={styles.input} />
        <Input.Password placeholder="密码" className={styles.input} />
        <Button type="primary" block className={styles.btn}>
          登录
        </Button>
      </Card>
    </div>
  );
}
```

```css
/* apps/admin/app/login/page.module.css */
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F6EAE3;
}

.card {
  width: 420px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 32px;
}

.title {
  font-size: 24px;
  color: #333;
  text-align: center;
  margin-bottom: 24px;
}

.input {
  height: 48px;
  background: #F5F5F5;
  border-radius: 8px;
  margin-bottom: 16px;
}

.btn {
  height: 48px;
  background: #FF7214;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
}
```

---

## 2. 管理后台仪表盘（Dashboard）

### 2.1 布局

```
┌────────────────────────────────────────────────────────────┐
│  🍴 OrderFood                    管理员  |  退出            │
├────────┬───────────────────────────────────────────────────┤
│        │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  仪表盘 │  │ 今日订单│  │ 今日营收│  │ 新增用户│  │ 待处理  │   │
│  菜单管理│  │  128   │  │ ¥5,280 │  │   23   │  │   8    │   │
│  订单管理│  └────────┘ └────────┘ └────────┘ └────────┘   │
│  用户管理│                                                 │
│  优惠券  │  ┌───────────────────────────────────────┐     │
│  积分商城│  │        近7天营收趋势（折线图）         │     │
│  奖品管理│  │                                       │     │
│  充值配置│  └───────────────────────────────────────┘     │
│  系统设置│                                                 │
│        │  ┌──────────────┐  ┌──────────────────────┐    │
│        │  │  最新订单     │  │    热销菜品 Top5      │    │
│        │  │  #1001 ¥128  │  │  1. 宫保鸡丁  x45    │    │
│        │  │  #1002 ¥256  │  │  2. 麻婆豆腐  x38    │    │
│        │  │  ...         │  │  ...                 │    │
│        │  └──────────────┘  └──────────────────────┘    │
└────────┴───────────────────────────────────────────────────┘
```

### 2.2 设计 Token

| 元素 | Token | 值 |
|------|-------|-----|
| 侧边栏宽度 | — | `200px` |
| 侧边栏背景 | — | `#1A1512` |
| 侧边栏文字 | — | `#ECEAE8` |
| 顶部栏高度 | — | `56px` |
| 顶部栏背景 | `surface` | `#FFFFFF` |
| 顶部栏边框 | `border` | `#E8E8E8` |
| 数据卡片背景 | `surface` | `#FFFFFF` |
| 数据卡片圆角 | `lg` | `12px` |
| 数据卡片阴影 | 卡片阴影 | `shadowOffset: {0, 2}, shadowOpacity: 0.08, shadowRadius: 8` |
| 统计数字字号 | `display` | `36px` |
| 统计数字颜色 | `primary` | `#FF7214` |
| 卡片间隙 | `md` | `16px` |
| 图表区域高度 | — | `300px` |

### 2.3 组件代码框架

```tsx
// apps/admin/app/dashboard/page.tsx
import { Row, Col, Card, Statistic, Table } from 'antd';
import { Line } from '@ant-design/charts';

export default function DashboardPage() {
  const lineConfig = {
    data: [
      { date: '周一', revenue: 3200 },
      { date: '周二', revenue: 4500 },
      { date: '周三', revenue: 3800 },
      { date: '周四', revenue: 5280 },
      { date: '周五', revenue: 6100 },
      { date: '周六', revenue: 7200 },
      { date: '周日', revenue: 6800 },
    ],
    xField: 'date',
    yField: 'revenue',
    smooth: true,
    color: '#FF7214',
  };

  return (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="今日订单" value={128} valueStyle={{ color: '#FF7214', fontSize: 36 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日营收" value={5280} prefix="¥" valueStyle={{ color: '#FF7214', fontSize: 36 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="新增用户" value={23} valueStyle={{ color: '#FF7214', fontSize: 36 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待处理" value={8} valueStyle={{ color: '#FF7214', fontSize: 36 }} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="近7天营收趋势" style={{ borderRadius: 12 }}>
            <Line {...lineConfig} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="最新订单" style={{ borderRadius: 12 }}>
            <Table columns={orderColumns} dataSource={latestOrders} size="small" pagination={false} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="热销菜品 Top5" style={{ borderRadius: 12 }}>
            <Table columns={dishColumns} dataSource={topDishes} size="small" pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
```

---

## 3. 菜单管理页

### 3.1 布局

```
┌────────────────────────────────────────────────────────────┐
│  🍴 OrderFood                    管理员  |  退出            │
├────────┬───────────────────────────────────────────────────┤
│        │  菜单管理                              [+ 新增菜品] │
│        │  ┌─────────────────────────────────────────────┐  │
│        │  │  分类: [全部 ▼]  搜索: [________]  [筛选]    │  │
│        │  └─────────────────────────────────────────────┘  │
│        │                                                 │
│        │  ┌─────────┬──────────┬──────┬────────┬──────┐ │
│        │  │ 菜品图片 │ 菜品名称  │ 分类  │  价格  │ 操作  │ │
│        │  ├─────────┼──────────┼──────┼────────┼──────┤ │
│        │  │  [图]   │ 宫保鸡丁  │ 热菜  │ ¥38.0 │ 编辑  │ │
│        │  │  [图]   │ 麻婆豆腐  │ 热菜  │ ¥28.0 │ 删除  │ │
│        │  │  [图]   │ 凉拌黄瓜  │ 凉菜  │ ¥18.0 │ 编辑  │ │
│        │  └─────────┴──────────┴──────┴────────┴──────┘ │
│        │  [1][2][3]...                       共 45 条    │
└────────┴───────────────────────────────────────────────────┘
```

### 3.2 设计 Token

| 元素 | Token | 值 |
|------|-------|-----|
| 页面标题字号 | `h2` | `18px` |
| 页面标题颜色 | `textPrimary` | `#333333` |
| 新增按钮 | 主按钮 | `primary` `#FF7214` |
| 筛选栏背景 | `surface` | `#FFFFFF` |
| 筛选栏圆角 | `md` | `8px` |
| 筛选栏阴影 | 卡片阴影 | — |
| 表格行高 | — | `64px` |
| 表格奇数行 | — | `#FFF8F5` |
| 表格偶数行 | — | `#FFFFFF` |
| 操作按钮 | 文字按钮 | `primary` 色 |
| 分页 | — | 底部右对齐 |

### 3.3 组件代码框架

```tsx
// apps/admin/app/menu/page.tsx
import { Button, Table, Space, Tag, Image } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const columns = [
  {
    title: '菜品图片',
    dataIndex: 'foodImage',
    render: (url: string) => <Image src={url} width={60} height={60} style={{ borderRadius: 8, objectFit: 'cover' }} />,
  },
  { title: '菜品名称', dataIndex: 'foodName' },
  {
    title: '分类',
    dataIndex: 'category',
    render: (text: string) => <Tag color="#FF7214">{text}</Tag>,
  },
  {
    title: '价格',
    dataIndex: 'foodPrice',
    render: (price: number) => `¥${price.toFixed(1)}`,
  },
  {
    title: '操作',
    render: (_: any, record: any) => (
      <Space>
        <Button type="link" style={{ color: '#FF7214' }}>编辑</Button>
        <Button type="link" danger>删除</Button>
      </Space>
    ),
  },
];

export default function MenuPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, color: '#333', margin: 0 }}>菜单管理</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{ background: '#FF7214', borderRadius: 12 }}>
          新增菜品
        </Button>
      </div>
      <Table
        columns={columns}
        rowKey="id"
        style={{ background: '#fff', borderRadius: 12 }}
      />
    </div>
  );
}
```

---

## 4. 订单管理页

### 4.1 布局

```
┌────────────────────────────────────────────────────────────┐
│  🍴 OrderFood                    管理员  |  退出            │
├────────┬───────────────────────────────────────────────────┤
│        │  订单管理                                          │
│        │  ┌─────────────────────────────────────────────┐  │
│        │  │  状态: [全部 ▼] [待支付][已支付][已完成][已取消]│ │
│        │  └─────────────────────────────────────────────┘  │
│        │                                                 │
│        │  ┌────────┬────────┬──────┬────────┬──────────┐  │
│        │  │ 订单号  │  用户   │ 类型  │  金额   │  状态    │  │
│        │  ├────────┼────────┼──────┼────────┼──────────┤  │
│        │  │ #1001  │ 张三    │ 堂食  │ ¥128.0 │ 🔵待支付 │  │
│        │  │ #1002  │ 李四    │ 外卖  │ ¥256.0 │ 🟢已完成 │  │
│        │  │ #1003  │ 王五    │ 堂食  │  ¥88.0 │ 🟡已支付 │  │
│        │  └────────┴────────┴──────┴────────┴──────────┘  │
│        │                                                 │
│        │  点击订单可查看详情 / 修改状态                      │
└────────┴───────────────────────────────────────────────────┘
```

### 4.2 设计 Token

| 元素 | Token | 值 |
|------|-------|-----|
| 状态筛选选中态 | 主按钮 | `primary` `#FF7214` 背景 + 白色文字 |
| 状态标签-待支付 | — | `#356BFF` 蓝色 |
| 状态标签-已支付 | — | `#FFCDA6` 背景 + `#FF7214` 文字 |
| 状态标签-已完成 | — | `#4ECDC4` 青色 |
| 状态标签-已取消 | — | `#999999` 灰色 |
| 表格行高 | — | `64px` |
| 表格 hover | — | 背景 `#FFF5F0` |
| 表格同菜单管理页 | — | — |

### 4.3 状态标签映射

| 状态 | 背景色 | 文字色 | 文字 |
|------|--------|--------|------|
| `pending` | `#356BFF20` | `#356BFF` | 待支付 |
| `paid` | `#FFCDA620` | `#FF7214` | 已支付 |
| `completed` | `#4ECDC420` | `#4ECDC4` | 已完成 |
| `cancelled` | `#99999920` | `#999999` | 已取消 |

### 4.4 组件代码框架

```tsx
// apps/admin/app/order/page.tsx
import { Table, Tag, Space, Button } from 'antd';

const statusMap: Record<string, { bg: string; color: string; text: string }> = {
  pending: { bg: '#356BFF20', color: '#356BFF', text: '待支付' },
  paid: { bg: '#FFCDA620', color: '#FF7214', text: '已支付' },
  completed: { bg: '#4ECDC420', color: '#4ECDC4', text: '已完成' },
  cancelled: { bg: '#99999920', color: '#999999', text: '已取消' },
};

const columns = [
  {
    title: '订单号',
    dataIndex: 'id',
    render: (id: string) => `#${id.slice(-4)}`,
  },
  { title: '用户', dataIndex: 'userName' },
  {
    title: '类型',
    dataIndex: 'orderType',
    render: (t: string) => (t === 'dine-in' ? '堂食' : '外卖'),
  },
  {
    title: '金额',
    dataIndex: 'totalAmount',
    render: (p: number) => `¥${p.toFixed(1)}`,
  },
  {
    title: '状态',
    dataIndex: 'status',
    render: (s: string) => {
      const cfg = statusMap[s];
      return (
        <Tag style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.color }}>
          {cfg.text}
        </Tag>
      );
    },
  },
  {
    title: '操作',
    render: () => (
      <Space>
        <Button type="link" style={{ color: '#FF7214' }}>查看详情</Button>
      </Space>
    ),
  },
];

export default function OrderPage() {
  return (
    <div>
      <h2 style={{ fontSize: 18, color: '#333', marginBottom: 16 }}>订单管理</h2>
      <Table
        columns={columns}
        rowKey="id"
        style={{ background: '#fff', borderRadius: 12 }}
        onRow={() => ({
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  );
}
```

---

## 5. 通用布局框架（Layout）

```tsx
// apps/admin/app/layout.tsx
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  TeamOutlined,
  GiftOutlined,
  TrophyOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider, Header, Content } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/menu', icon: <AppstoreOutlined />, label: '菜单管理' },
  { key: '/order', icon: <ShoppingOutlined />, label: '订单管理' },
  { key: '/user', icon: <TeamOutlined />, label: '用户管理' },
  { key: '/coupon', icon: <GiftOutlined />, label: '优惠券' },
  { key: '/points', icon: <TrophyOutlined />, label: '积分商城' },
  { key: '/setting', icon: <SettingOutlined />, label: '系统设置' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} style={{ background: '#1A1512' }}>
        <div style={{ padding: '16px', color: '#ECEAE8', fontSize: 18, fontWeight: 600 }}>
          🍴 OrderFood
        </div>
        <Menu
          theme="dark"
          mode="inline"
          style={{ background: '#1A1512' }}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', borderBottom: '1px solid #E8E8E8', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: '100%' }}>
            <span style={{ color: '#666' }}>管理员</span>
            <Button type="link">退出</Button>
          </div>
        </Header>
        <Content style={{ padding: 24, background: '#F6EAE3' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
```

---

## 6. 设计规范速查

### 色彩

| Token | 色值 | 用途 |
|-------|------|------|
| `primary` | `#FF7214` | 主按钮、强调、统计数字 |
| `primaryLight` | `#FFCDA6` | 标签背景、高亮 |
| `success` | `#4ECDC4` | 已完成状态 |
| `danger` | `#D32F2F` | 删除按钮 |
| `info` | `#356BFF` | 待支付状态、链接 |
| `bgPage` | `#F6EAE3` | 页面背景 |
| `surface` | `#FFFFFF` | 卡片、面板 |
| `textPrimary` | `#333333` | 标题、正文 |
| `textSecondary` | `#666666` | 次要文字 |

### 圆角

| Token | 值 | 用途 |
|-------|-----|------|
| `md` | `8px` | 输入框、小卡片 |
| `lg` | `12px` | 卡片、按钮 |
| `xl` | `16px` | 登录卡片、大面板 |

### 阴影

| 场景 | shadowColor | shadowOffset | shadowOpacity | shadowRadius |
|------|-------------|--------------|---------------|--------------|
| 卡片 | `#000` | `{0, 2}` | `0.08` | `8` |
| 浮层 | `#000` | `{0, 4}` | `0.15` | `12` |
