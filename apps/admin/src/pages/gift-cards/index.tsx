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
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { CopyOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { api, type PaginatedResult } from '@/lib/request';
import type { AdminGiftCard } from '@/types/admin';

interface GiftCardFormValues {
  code?: string;
  amount: number;
  expiresAt?: Dayjs;
  status?: 'active' | 'expired';
}

const statusMeta = {
  active: { color: 'green', label: '可兑换' },
  redeemed: { color: 'blue', label: '已兑换' },
  expired: { color: 'default', label: '已过期' },
} as const;

export default function GiftCardsPage() {
  const [data, setData] = useState<AdminGiftCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editing, setEditing] = useState<AdminGiftCard>();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<GiftCardFormValues>();

  const fetchData = useCallback(async (targetPage = page) => {
    setLoading(true);
    try {
      const result = await api.get<PaginatedResult<AdminGiftCard>>('/admin/gift-cards', { params: { page: targetPage, limit: 10 } });
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
    setOpen(true);
  };

  const openEdit = (card: AdminGiftCard) => {
    setEditing(card);
    form.setFieldsValue({
      amount: card.amount,
      expiresAt: card.expiresAt ? dayjs(card.expiresAt) : undefined,
      status: card.status === 'redeemed' ? undefined : card.status,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const payload = { ...values, code: values.code?.trim().toUpperCase() || undefined, expiresAt: values.expiresAt?.toISOString() };
    if (editing) {
      await api.put(`/admin/gift-cards/${editing.id}`, payload);
      message.success('礼品卡已更新');
    } else {
      await api.post('/admin/gift-cards', payload);
      message.success('礼品卡已创建');
    }
    setOpen(false);
    fetchData();
  };

  const remove = async (id: string) => {
    await api.delete(`/admin/gift-cards/${id}`);
    message.success('礼品卡已删除');
    fetchData();
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    message.success('兑换码已复制');
  };

  const columns: ColumnsType<AdminGiftCard> = [
    {
      title: '兑换码',
      dataIndex: 'code',
      render: (code: string) => (
        <Space><Typography.Text code copyable={false}>{code}</Typography.Text><Button type="text" size="small" icon={<CopyOutlined />} onClick={() => copyCode(code)} /></Space>
      ),
    },
    { title: '面额', dataIndex: 'amount', render: (value: number) => <b style={{ color: '#FF7214' }}>¥{value.toFixed(2)}</b> },
    {
      title: '状态',
      dataIndex: 'status',
      render: (value: AdminGiftCard['status']) => <Tag color={statusMeta[value].color}>{statusMeta[value].label}</Tag>,
    },
    { title: '有效期', dataIndex: 'expiresAt', render: (value: string | null) => value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '永久有效' },
    { title: '兑换时间', dataIndex: 'redeemedAt', render: (value: string | null) => value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-' },
    { title: '创建时间', dataIndex: 'createdAt', render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm') },
    {
      title: '操作',
      fixed: 'right',
      width: 130,
      render: (_, card) => card.status !== 'redeemed' ? (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(card)} />
          <Popconfirm title="确定删除这张礼品卡？" onConfirm={() => remove(card.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ) : <Typography.Text type="secondary">不可修改</Typography.Text>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>礼品卡管理</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>创建礼品卡</Button>
      </div>
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 950 }}
          pagination={{ current: page, pageSize: 10, total, showTotal: (value) => `共 ${value} 张礼品卡`, onChange: setPage }}
        />
      </Card>

      <Modal title={editing ? '编辑礼品卡' : '创建礼品卡'} open={open} onOk={submit} onCancel={() => setOpen(false)} okText="保存">
        <Form form={form} layout="vertical">
          {!editing && (
            <Form.Item name="code" label="兑换码" extra="留空将自动生成安全兑换码">
              <Input placeholder="例如 GIFT-100-ABCD" onChange={(event) => form.setFieldValue('code', event.target.value.toUpperCase())} />
            </Form.Item>
          )}
          <Form.Item name="amount" label="面额" rules={[{ required: true, message: '请输入面额' }]}>
            <InputNumber min={0.01} precision={2} prefix="¥" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expiresAt" label="有效期" extra="不选表示永久有效">
            <DatePicker showTime style={{ width: '100%' }} disabledDate={(date) => date.isBefore(dayjs(), 'day')} />
          </Form.Item>
          {editing && (
            <Form.Item name="status" label="状态" rules={[{ required: true }]}>
              <Select options={[{ value: 'active', label: '可兑换' }, { value: 'expired', label: '已过期' }]} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
