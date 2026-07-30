import { useCallback, useEffect, useState } from 'react';
import { Avatar, Card, Input, Select, Space, Table, Tag, Typography } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { api, type PaginatedResult } from '@/lib/request';
import type { AdminUser } from '@/types/admin';

export default function UsersPage() {
  const [data, setData] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string>();

  const fetchData = useCallback(async (targetPage = page) => {
    setLoading(true);
    try {
      const result = await api.get<PaginatedResult<AdminUser>>('/admin/users', {
        params: { page: targetPage, limit: 10, search: search || undefined, role },
      });
      setData(result.data);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [page, role, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: ColumnsType<AdminUser> = [
    {
      title: '用户',
      render: (_, user) => (
        <Space>
          <Avatar src={user.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 600 }}>{user.username}</div>
            <Typography.Text type="secondary">{user.phone}</Typography.Text>
          </div>
        </Space>
      ),
    },
    {
      title: '身份',
      dataIndex: 'role',
      render: (value: AdminUser['role']) => <Tag color={value === 'admin' ? 'purple' : 'blue'}>{value === 'admin' ? '管理员' : '用户'}</Tag>,
    },
    { title: '余额', dataIndex: 'balance', render: (value: number) => `¥${value.toFixed(2)}` },
    { title: '积分', dataIndex: 'integral', render: (value: number) => value.toLocaleString() },
    { title: '订单', render: (_, user) => user._count.orders },
    { title: '优惠券', render: (_, user) => user._count.userCoupons },
    { title: '注册时间', dataIndex: 'createdAt', render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm') },
  ];

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>用户管理</Typography.Title>
      <Card bordered={false}>
        <Space wrap style={{ marginBottom: 16 }}>
          <Input.Search
            allowClear
            prefix={<SearchOutlined />}
            placeholder="手机号或昵称"
            style={{ width: 280 }}
            onSearch={(value) => { setSearch(value.trim()); setPage(1); }}
          />
          <Select
            allowClear
            placeholder="全部身份"
            style={{ width: 140 }}
            value={role}
            options={[{ value: 'user', label: '普通用户' }, { value: 'admin', label: '管理员' }]}
            onChange={(value) => { setRole(value); setPage(1); }}
          />
        </Space>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            current: page,
            pageSize: 10,
            total,
            showTotal: (value) => `共 ${value} 位用户`,
            onChange: setPage,
          }}
        />
      </Card>
    </div>
  );
}
