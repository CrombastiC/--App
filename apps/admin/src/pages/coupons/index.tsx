import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Progress,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SendOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { api, type PaginatedResult } from '@/lib/request';
import type { AdminCoupon, AdminUser } from '@/types/admin';

interface CouponFormValues {
  couponName: string;
  couponAmount: number;
  consumeMoney: number;
  couponUseTime: Dayjs;
  totalStock?: number;
  addStock?: number;
  isActive?: boolean;
}

export default function CouponsPage() {
  const [data, setData] = useState<AdminCoupon[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editing, setEditing] = useState<AdminCoupon>();
  const [formOpen, setFormOpen] = useState(false);
  const [granting, setGranting] = useState<AdminCoupon>();
  const [form] = Form.useForm<CouponFormValues>();
  const [grantForm] = Form.useForm<{ userId: string }>();

  const fetchData = useCallback(async (targetPage = page) => {
    setLoading(true);
    try {
      const result = await api.get<PaginatedResult<AdminCoupon>>('/admin/coupons', { params: { page: targetPage, limit: 10 } });
      setData(result.data);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(undefined);
    form.resetFields();
    form.setFieldsValue({ consumeMoney: 0, totalStock: 100, isActive: true });
    setFormOpen(true);
  };

  const openEdit = (coupon: AdminCoupon) => {
    setEditing(coupon);
    form.setFieldsValue({
      couponName: coupon.couponName,
      couponAmount: coupon.couponAmount,
      consumeMoney: coupon.consumeMoney,
      couponUseTime: dayjs(coupon.couponUseTime),
      isActive: coupon.isActive,
    });
    setFormOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const payload = { ...values, couponUseTime: values.couponUseTime.toISOString() };
    if (editing) {
      await api.put(`/admin/coupons/${editing.id}`, payload);
      message.success('优惠券已更新');
    } else {
      await api.post('/admin/coupons', payload);
      message.success('优惠券已创建');
    }
    setFormOpen(false);
    fetchData();
  };

  const remove = async (id: string) => {
    await api.delete(`/admin/coupons/${id}`);
    message.success('优惠券已删除');
    fetchData();
  };

  const openGrant = async (coupon: AdminCoupon) => {
    setGranting(coupon);
    grantForm.resetFields();
    if (users.length === 0) {
      const result = await api.get<PaginatedResult<AdminUser>>('/admin/users', { params: { page: 1, limit: 100, role: 'user' } });
      setUsers(result.data);
    }
  };

  const grant = async () => {
    if (!granting) return;
    const values = await grantForm.validateFields();
    await api.post(`/admin/coupons/${granting.id}/grant`, values);
    message.success('优惠券已发放');
    setGranting(undefined);
    fetchData();
  };

  const columns: ColumnsType<AdminCoupon> = [
    {
      title: '优惠券',
      render: (_, coupon) => (
        <div><b>{coupon.couponName}</b><br /><Typography.Text type="secondary">满 ¥{coupon.consumeMoney} 可用</Typography.Text></div>
      ),
    },
    { title: '面额', dataIndex: 'couponAmount', render: (value: number) => <b style={{ color: '#FF7214' }}>¥{value}</b> },
    {
      title: '库存',
      width: 180,
      render: (_, coupon) => (
        <Progress
          percent={coupon.totalStock ? Math.round((coupon.remainStock / coupon.totalStock) * 100) : 0}
          format={() => `${coupon.remainStock}/${coupon.totalStock}`}
          size="small"
          status={coupon.remainStock === 0 ? 'exception' : 'normal'}
        />
      ),
    },
    { title: '已领取', render: (_, coupon) => coupon._count.userCoupons },
    {
      title: '有效期',
      dataIndex: 'couponUseTime',
      render: (value: string) => (
        <span style={{ color: dayjs(value).isBefore(dayjs()) ? '#cf1322' : undefined }}>{dayjs(value).format('YYYY-MM-DD HH:mm')}</span>
      ),
    },
    { title: '状态', dataIndex: 'isActive', render: (value: boolean) => <Tag color={value ? 'green' : 'default'}>{value ? '启用' : '停用'}</Tag> },
    {
      title: '操作',
      fixed: 'right',
      width: 230,
      render: (_, coupon) => (
        <Space>
          <Button type="link" icon={<SendOutlined />} disabled={!coupon.isActive || coupon.remainStock <= 0} onClick={() => openGrant(coupon)}>发放</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(coupon)}>编辑</Button>
          <Popconfirm title="确定删除？已有领取记录时只能停用。" onConfirm={() => remove(coupon.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>优惠券管理</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建优惠券</Button>
      </div>
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{ current: page, pageSize: 10, total, showTotal: (value) => `共 ${value} 种优惠券`, onChange: setPage }}
        />
      </Card>

      <Modal title={editing ? '编辑优惠券' : '新建优惠券'} open={formOpen} onOk={submit} onCancel={() => setFormOpen(false)} okText="保存">
        <Form form={form} layout="vertical">
          <Form.Item name="couponName" label="名称" rules={[{ required: true, message: '请输入优惠券名称' }]}>
            <Input placeholder="例如：新客满减券" />
          </Form.Item>
          <Space align="start" style={{ display: 'flex' }}>
            <Form.Item name="couponAmount" label="优惠金额" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={0.01} precision={2} prefix="¥" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="consumeMoney" label="使用门槛" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={0} precision={2} prefix="¥" style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item name="couponUseTime" label="有效期" rules={[{ required: true, message: '请选择有效期' }]}>
            <DatePicker showTime style={{ width: '100%' }} disabledDate={(date) => date.isBefore(dayjs(), 'day')} />
          </Form.Item>
          {!editing ? (
            <Form.Item name="totalStock" label="发行数量" rules={[{ required: true }]}>
              <InputNumber min={1} precision={0} style={{ width: '100%' }} />
            </Form.Item>
          ) : (
            <>
              <Form.Item name="addStock" label="追加库存">
                <InputNumber min={1} precision={0} placeholder="不追加可留空" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="isActive" label="启用状态" valuePropName="checked"><Switch /></Form.Item>
            </>
          )}
        </Form>
      </Modal>

      <Modal title={`发放「${granting?.couponName || ''}」`} open={!!granting} onOk={grant} onCancel={() => setGranting(undefined)} okText="确认发放">
        <Form form={grantForm} layout="vertical">
          <Form.Item name="userId" label="选择用户" rules={[{ required: true, message: '请选择用户' }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="搜索手机号或昵称"
              options={users.map((user) => ({ value: user.id, label: `${user.username} · ${user.phone}` }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
