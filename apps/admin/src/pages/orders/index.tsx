import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import OrderStatusTag from '@/components/OrderStatusTag';
import { api, type PaginatedResult } from '@/lib/request';
import type { AdminOrder, AdminOrderItem, OrderStatus } from '@/types/admin';

export default function OrdersPage() {
  const [data, setData] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus>();
  const [selected, setSelected] = useState<AdminOrder>();

  const fetchData = useCallback(async (targetPage = page) => {
    setLoading(true);
    try {
      const result = await api.get<PaginatedResult<AdminOrder>>('/admin/orders', {
        params: { page: targetPage, limit: 10, search: search || undefined, status },
      });
      setData(result.data);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (order: AdminOrder, nextStatus: 'paid' | 'completed' | 'cancelled') => {
    await api.put(`/admin/orders/${order.id}/status`, { status: nextStatus });
    message.success('订单状态已更新');
    setSelected(undefined);
    fetchData();
  };

  const columns: ColumnsType<AdminOrder> = [
    { title: '订单号', dataIndex: 'id', render: (id: string) => <Typography.Text code>#{id.slice(-8)}</Typography.Text> },
    {
      title: '用户',
      render: (_, order) => (
        <div><b>{order.user.username}</b><br /><Typography.Text type="secondary">{order.user.phone}</Typography.Text></div>
      ),
    },
    { title: '类型', dataIndex: 'orderType', render: (value) => <Tag>{value === 'dine-in' ? '堂食' : '外卖'}</Tag> },
    { title: '商品', render: (_, order) => `${order.orderItems.reduce((sum, item) => sum + item.quantity, 0)} 件` },
    { title: '实付', dataIndex: 'payAmount', render: (value: number) => <b style={{ color: '#FF7214' }}>¥{value.toFixed(2)}</b> },
    { title: '状态', dataIndex: 'status', render: (value: OrderStatus) => <OrderStatusTag status={value} /> },
    { title: '下单时间', dataIndex: 'createdAt', render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm') },
    {
      title: '操作',
      fixed: 'right',
      width: 230,
      render: (_, order) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => setSelected(order)}>详情</Button>
          {order.status === 'pending' && (
            <>
              <Popconfirm title="确认该订单已收款？" onConfirm={() => updateStatus(order, 'paid')}>
                <Button type="link">确认收款</Button>
              </Popconfirm>
              <Popconfirm title="确认取消这个待支付订单？" onConfirm={() => updateStatus(order, 'cancelled')}>
                <Button type="link" danger>取消</Button>
              </Popconfirm>
            </>
          )}
          {order.status === 'paid' && (
            <Popconfirm title="确认订单已完成？" onConfirm={() => updateStatus(order, 'completed')}>
              <Button type="link">完成</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const itemColumns: ColumnsType<AdminOrderItem> = [
    { title: '菜品', dataIndex: 'foodName' },
    { title: '单价', dataIndex: 'foodPrice', render: (value: number) => `¥${value.toFixed(2)}` },
    { title: '数量', dataIndex: 'quantity' },
    { title: '小计', dataIndex: 'subtotal', render: (value: number) => `¥${value.toFixed(2)}` },
  ];

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>订单管理</Typography.Title>
      <Card bordered={false}>
        <Space wrap style={{ marginBottom: 16 }}>
          <Input.Search
            allowClear
            prefix={<SearchOutlined />}
            placeholder="订单号、手机号或昵称"
            style={{ width: 300 }}
            onSearch={(value) => { setSearch(value.trim()); setPage(1); }}
          />
          <Select<OrderStatus>
            allowClear
            placeholder="全部状态"
            style={{ width: 150 }}
            value={status}
            options={[
              { value: 'pending', label: '待支付' },
              { value: 'paid', label: '已支付' },
              { value: 'completed', label: '已完成' },
              { value: 'cancelled', label: '已取消' },
            ]}
            onChange={(value) => { setStatus(value); setPage(1); }}
          />
        </Space>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{ current: page, pageSize: 10, total, showTotal: (value) => `共 ${value} 笔订单`, onChange: setPage }}
        />
      </Card>

      <Drawer title="订单详情" width={720} open={!!selected} onClose={() => setSelected(undefined)}>
        {selected && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="订单号" span={2}>{selected.id}</Descriptions.Item>
              <Descriptions.Item label="用户">{selected.user.username}</Descriptions.Item>
              <Descriptions.Item label="手机号">{selected.user.phone}</Descriptions.Item>
              <Descriptions.Item label="类型">{selected.orderType === 'dine-in' ? '堂食' : '外卖'}</Descriptions.Item>
              <Descriptions.Item label="状态"><OrderStatusTag status={selected.status} /></Descriptions.Item>
              <Descriptions.Item label="原价">¥{selected.totalAmount.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="实付">¥{selected.payAmount.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="人数">{selected.peopleCount || '-'}</Descriptions.Item>
              <Descriptions.Item label="地址">{selected.address || '-'}</Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{selected.remark || '-'}</Descriptions.Item>
              <Descriptions.Item label="下单时间" span={2}>{dayjs(selected.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
            </Descriptions>
            <Typography.Title level={5} style={{ marginTop: 24 }}>商品明细</Typography.Title>
            <Table columns={itemColumns} dataSource={selected.orderItems} rowKey="id" pagination={false} size="small" />
          </>
        )}
      </Drawer>
    </div>
  );
}
