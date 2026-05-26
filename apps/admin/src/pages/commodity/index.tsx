import { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Switch, Space,
  Popconfirm, message, Tag, Image,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import request from '@/lib/request';

interface Commodity {
  id: string;
  commodityName: string;
  commodityImage: string;
  commodityIntegral: number;
  stock: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export default function CommodityPage() {
  const [data, setData] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Commodity | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async (p: number = page) => {
    setLoading(true);
    try {
      const res = await request.get('/points/commodity/list', { params: { page: p, limit: 10 } });
      const result = (res as { data: { data: Commodity[]; total: number } }).data;
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
    form.setFieldsValue({ stock: 100, sortOrder: 0, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (record: Commodity) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await request.put(`/points/commodity/update/${editing.id}`, values);
        message.success('更新成功');
      } else {
        await request.post('/points/commodity/create', values);
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
      await request.delete(`/points/commodity/delete/${id}`);
      message.success('删除成功');
      fetchData();
    } catch {
      // interceptor 已处理错误提示
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await request.put(`/points/commodity/toggle/${id}`);
      message.success('状态已切换');
      fetchData();
    } catch {
      // interceptor 已处理错误提示
    }
  };

  const columns = [
    {
      title: '商品图片',
      dataIndex: 'commodityImage',
      width: 80,
      render: (url: string) => (
        <Image src={url} width={48} height={48} style={{ borderRadius: 8, objectFit: 'cover' }} fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F/PQAJhAN4kGk5RAAAAABJRU5ErkJggg==" />
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'commodityName',
      render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span>,
    },
    {
      title: '兑换积分',
      dataIndex: 'commodityIntegral',
      render: (v: number) => (
        <Tag color="orange" style={{ fontWeight: 600 }}>{v} 积分</Tag>
      ),
    },
    {
      title: '库存',
      dataIndex: 'stock',
      width: 80,
      render: (v: number) => (
        <span style={{ color: v <= 10 ? '#D32F2F' : '#333', fontWeight: v <= 10 ? 600 : 400 }}>
          {v}
        </span>
      ),
    },
    { title: '排序', dataIndex: 'sortOrder', width: 80 },
    {
      title: '状态',
      dataIndex: 'isActive',
      width: 80,
      render: (v: boolean, record: Commodity) => (
        <Switch
          checked={v}
          size="small"
          onChange={() => handleToggle(record.id)}
        />
      ),
    },
    {
      title: '操作',
      width: 140,
      render: (_: unknown, record: Commodity) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            style={{ color: '#FF7214' }}
            onClick={() => openEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm title="确定删除该商品？" onConfirm={() => handleDelete(record.id)}>
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
        <h2 style={{ fontSize: 18, color: '#333', margin: 0 }}>积分礼品管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: '#FF7214', borderRadius: 8 }}
          onClick={openCreate}
        >
          新增商品
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
        title={editing ? '编辑积分商品' : '新增积分商品'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        cancelText="取消"
        okButtonProps={{ style: { background: '#FF7214' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="commodityName"
            label="商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
          >
            <Input placeholder="请输入商品名称" />
          </Form.Item>
          <Form.Item
            name="commodityImage"
            label="商品图片 URL"
            rules={[{ required: true, message: '请输入商品图片地址' }]}
          >
            <Input placeholder="请输入图片 URL" />
          </Form.Item>
          <Form.Item
            name="commodityIntegral"
            label="兑换积分"
            rules={[{ required: true, message: '请输入兑换所需积分' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入兑换积分" />
          </Form.Item>
          <Form.Item name="stock" label="库存">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入库存数量" />
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
