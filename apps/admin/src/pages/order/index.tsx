import { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Button, Select, message, Modal, Descriptions } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import request from '@/lib/request';

interface OrderItem {
  id: string;
  foodName: string;
  foodPrice: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  userId: string;
  orderType: string;
  status: string;
  totalAmount: number;
  payAmount: number;
  address?: string;
  peopleCount?: number;
  remark?: string;
  createdAt: string;
  orderItems: OrderItem[];
  user?: { username: string; phone: string };
}

const statusMap: Record<string, { color: string; text: string }> = {
  pending: { color: 'blue', text: '待支付' },
  paid: { color: 'orange', text: '已支付' },
  completed: { color: 'green', text: '已完成' },
  cancelled: { color: 'default', text: '已取消' },
};


export default function OrderPage() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const fetchData = useCallback(async (p: number = page, s: string = statusFilter) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: p, limit: 10 };
      if (s) params.status = s;
      const res = await request.get('/order/all', { params });
      const result = (res as { data: { data: Order[]; total: number } }).data;
      setData(result.data);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await request.put(`/order/status/${orderId}`, { status: newStatus });
      message.success('状态更新成功');
      fetchData();
    } catch {
      // interceptor 已处理错误提示
    }
  };

  const showDetail = (order: Order) => {
    setCurrentOrder(order);
    setDetailOpen(true);
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'id',
      width: 120,
      render: (id: string) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{id.slice(-8)}</span>,
    },
    {
      title: '用户',
      dataIndex: 'user',
      render: (user: Order['user']) => (
        <span>{user?.username || '-'}</span>
      ),
    },
    {
      title: '类型',
      dataIndex: 'orderType',
      width: 80,
      render: (t: string) => t === 'dine-in' ? '堂食' : '外卖',
    },
    {
      title: '金额',
      dataIndex: 'payAmount',
      width: 100,
      render: (v: number) => <span style={{ fontWeight: 600 }}>¥{v.toFixed(2)}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (s: string, record: Order) => (
        <Select
          value={s}
          size="small"
          style={{ width: 100 }}
          options={Object.entries(statusMap).map(([value, { text }]) => ({ value, label: text }))}
          onChange={(val) => handleStatusChange(record.id, val)}
        />
      ),
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      width: 80,
      render: (_: unknown, record: Order) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          style={{ color: '#FF7214' }}
          onClick={() => showDetail(record)}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, color: '#333', margin: 0 }}>订单管理</h2>
        <Select
          value={statusFilter}
          style={{ width: 140 }}
          options={[
            { value: '', label: '全部状态' },
            { value: 'pending', label: '待支付' },
            { value: 'paid', label: '已支付' },
            { value: 'completed', label: '已完成' },
            { value: 'cancelled', label: '已取消' },
          ]}
          onChange={(val) => { setStatusFilter(val); setPage(1); fetchData(1, val); }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p) => { setPage(p); fetchData(p); },
        }}
        style={{ background: '#fff', borderRadius: 12 }}
      />

      <Modal
        title="订单详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={600}
      >
        {currentOrder && (
          <Descriptions column={2} bordered size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="订单号" span={2}>
              <span style={{ fontFamily: 'monospace' }}>{currentOrder.id}</span>
            </Descriptions.Item>
            <Descriptions.Item label="用户">{currentOrder.user?.username || '-'}</Descriptions.Item>
            <Descriptions.Item label="手机号">{currentOrder.user?.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="类型">{currentOrder.orderType === 'dine-in' ? '堂食' : '外卖'}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusMap[currentOrder.status]?.color}>{statusMap[currentOrder.status]?.text}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="总金额">¥{currentOrder.totalAmount.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="实付">¥{currentOrder.payAmount.toFixed(2)}</Descriptions.Item>
            {currentOrder.address && <Descriptions.Item label="地址" span={2}>{currentOrder.address}</Descriptions.Item>}
            {currentOrder.peopleCount && <Descriptions.Item label="人数">{currentOrder.peopleCount}</Descriptions.Item>}
            {currentOrder.remark && <Descriptions.Item label="备注" span={2}>{currentOrder.remark}</Descriptions.Item>}
            <Descriptions.Item label="下单时间" span={2}>
              {new Date(currentOrder.createdAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
            <Descriptions.Item label="菜品明细" span={2}>
              <Table
                dataSource={currentOrder.orderItems}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  { title: '菜品', dataIndex: 'foodName' },
                  { title: '单价', dataIndex: 'foodPrice', render: (v: number) => `¥${v.toFixed(2)}` },
                  { title: '数量', dataIndex: 'quantity', width: 60 },
                  { title: '小计', dataIndex: 'subtotal', render: (v: number) => `¥${v.toFixed(2)}` },
                ]}
              />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
