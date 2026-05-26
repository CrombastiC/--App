import { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Form, InputNumber, Switch, Space,
  Popconfirm, message, Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import request from '@/lib/request';

interface MoneyOption {
  id: string;
  money: number;
  giveMoney: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export default function MoneyPage() {
  const [data, setData] = useState<MoneyOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MoneyOption | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async (p: number = page) => {
    setLoading(true);
    try {
      const res = await request.get('/money/all', { params: { page: p, limit: 10 } });
      const result = (res as { data: { data: MoneyOption[]; total: number } }).data;
      setData(result.data);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ giveMoney: 0, sortOrder: 0, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (record: MoneyOption) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await request.put(`/money/update/${editing.id}`, values);
        message.success('更新成功');
      } else {
        await request.post('/money/create', values);
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchData();
    } catch {
      // interceptor 已处理错误提示
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await request.delete(`/money/delete/${id}`);
      message.success('删除成功');
      fetchData();
    } catch {
      // interceptor 已处理错误提示
    }
  };

  const columns = [
    {
      title: '充值金额',
      dataIndex: 'money',
      render: (v: number) => <span style={{ fontWeight: 600 }}>¥{v}</span>,
    },
    {
      title: '赠送金额',
      dataIndex: 'giveMoney',
      render: (v: number) => v > 0 ? <Tag color="green">+¥{v}</Tag> : <span style={{ color: '#999' }}>无</span>,
    },
    {
      title: '实际到账',
      render: (_: unknown, r: MoneyOption) => (
        <span style={{ color: '#FF7214', fontWeight: 600 }}>
          ¥{r.money + r.giveMoney}
        </span>
      ),
    },
    { title: '排序', dataIndex: 'sortOrder', width: 80 },
    {
      title: '状态',
      dataIndex: 'isActive',
      width: 80,
      render: (v: boolean) => (
        <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '操作',
      width: 140,
      render: (_: unknown, record: MoneyOption) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            style={{ color: '#FF7214' }}
            onClick={() => openEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, color: '#333', margin: 0 }}>充值选项管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: '#FF7214', borderRadius: 8 }}
          onClick={openCreate}
        >
          新增选项
        </Button>
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
        title={editing ? '编辑充值选项' : '新增充值选项'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        cancelText="取消"
        okButtonProps={{ style: { background: '#FF7214' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="money"
            label="充值金额（元）"
            rules={[{ required: true, message: '请输入充值金额' }]}
          >
            <InputNumber
              min={1}
              precision={2}
              style={{ width: '100%' }}
              placeholder="请输入充值金额"
            />
          </Form.Item>
          <Form.Item
            name="giveMoney"
            label="赠送金额（元）"
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              placeholder="0 表示不赠送"
            />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序（小的排前面）">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isActive" label="是否启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
