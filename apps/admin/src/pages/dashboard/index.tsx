import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Col,
  Empty,
  Row,
  Skeleton,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  CoffeeOutlined,
  WarningOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { api } from '@/lib/request';
import type { DashboardData, DashboardOrder } from '@/types/admin';
import OrderStatusTag from '@/components/OrderStatusTag';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardData>('/admin/dashboard')
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const columns: ColumnsType<DashboardOrder> = [
    {
      title: '订单号',
      dataIndex: 'id',
      render: (id: string) => <Typography.Text code>#{id.slice(-8)}</Typography.Text>,
    },
    {
      title: '用户',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.user.username}</div>
          <Typography.Text type="secondary">{record.user.phone}</Typography.Text>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'orderType',
      render: (type: DashboardOrder['orderType']) => (
        <Tag>{type === 'dine-in' ? '堂食' : '外卖'}</Tag>
      ),
    },
    { title: '商品', render: (_, record) => `${record._count.orderItems} 项` },
    {
      title: '实付',
      dataIndex: 'payAmount',
      render: (amount: number) => <b style={{ color: '#FF7214' }}>¥{amount.toFixed(2)}</b>,
    },
    { title: '状态', dataIndex: 'status', render: (status) => <OrderStatusTag status={status} /> },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      render: (value: string) => dayjs(value).format('MM-DD HH:mm'),
    },
  ];

  if (loading) return <Skeleton active paragraph={{ rows: 10 }} />;
  if (!data) return <Empty description="经营数据加载失败" />;

  const statistics = [
    { title: '今日营业额', value: data.todayRevenue, prefix: '¥', icon: <DollarOutlined />, color: '#FF7214' },
    { title: '今日订单', value: data.todayOrderCount, icon: <ShoppingCartOutlined />, color: '#1677ff' },
    { title: '注册用户', value: data.userCount, icon: <TeamOutlined />, color: '#52c41a' },
    { title: '在售菜品', value: data.foodCount, icon: <CoffeeOutlined />, color: '#722ed1' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>经营概览</Typography.Title>
        <Typography.Text type="secondary">实时掌握订单、营收与运营资源</Typography.Text>
      </div>

      <Row gutter={[16, 16]}>
        {statistics.map((item) => (
          <Col xs={24} sm={12} xl={6} key={item.title}>
            <Card bordered={false} style={{ height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Statistic title={item.title} value={item.value} prefix={item.prefix} precision={item.prefix ? 2 : 0} />
                <div style={{ fontSize: 28, color: item.color }}>{item.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={8}>
          <Card bordered={false}>
            <Statistic title="累计营业额" value={data.revenue} prefix="¥" precision={2} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false}>
            <Statistic title="待处理订单" value={data.pendingOrderCount} valueStyle={{ color: data.pendingOrderCount ? '#fa8c16' : undefined }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false}>
            <Statistic
              title="低库存积分礼品"
              value={data.lowStockCount}
              prefix={<WarningOutlined />}
              valueStyle={{ color: data.lowStockCount ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card bordered={false}>
            <Statistic title="可用优惠券" value={data.couponCount} prefix={<TagsOutlined />} suffix="种" />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card bordered={false}>
            <Statistic title="未兑换礼品卡" value={data.giftCardCount} suffix="张" />
          </Card>
        </Col>
      </Row>

      <Card
        title="最近订单"
        bordered={false}
        style={{ marginTop: 16 }}
        extra={<a onClick={() => navigate('/orders')}>查看全部</a>}
      >
        <Table columns={columns} dataSource={data.recentOrders} rowKey="id" pagination={false} scroll={{ x: 800 }} />
      </Card>
    </div>
  );
}
