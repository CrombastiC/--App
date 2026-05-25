import { useState, useEffect, useCallback } from 'react';
import {
  Tabs, Table, Button, Modal, Form, Input, InputNumber, Switch, Space,
  Popconfirm, message, Tag, Upload, Image, Select,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import request from '@/lib/request';
import { getToken } from '@/lib/auth';

// ==================== 类型 ====================

interface Category {
  id: string;
  classifyName: string;
  icon: string | null;
  sortOrder: number;
  _count: { foods: number };
}

interface Food {
  id: string;
  classifyId: string;
  foodName: string;
  foodPrice: number;
  foodImage: string | null;
  sortOrder: number;
  isActive: boolean;
  category: { classifyName: string };
}

// ==================== 分类管理 ====================

function CategoryTab() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.get('/menu/categories');
      setData((res as { data: Category[] }).data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Category) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await request.put(`/menu/category/${editing.id}`, values);
      message.success('更新成功');
    } else {
      await request.post('/menu/category', values);
      message.success('创建成功');
    }
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await request.delete(`/menu/category/${id}`);
    message.success('删除成功');
    fetchData();
  };

  const columns = [
    { title: '分类名称', dataIndex: 'classifyName', key: 'name' },
    { title: '图标', dataIndex: 'icon', key: 'icon', render: (v: string | null) => v || '-' },
    { title: '排序', dataIndex: 'sortOrder', key: 'sort', width: 80 },
    { title: '菜品数', key: 'count', width: 80, render: (_: unknown, r: Category) => r._count.foods },
    {
      title: '操作', key: 'action', width: 150,
      render: (_: unknown, record: Category) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ marginBottom: 16 }}>
        新建分类
      </Button>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={false} />
      <Modal
        title={editing ? '编辑分类' : '新建分类'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="classifyName" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="icon" label="图标标识">
            <Input placeholder="如: fire, rice" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

// ==================== 菜品管理 ====================

function FoodTab() {
  const [data, setData] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Food | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [foodsRes, catsRes] = await Promise.all([
        request.get('/menu/foods'),
        request.get('/menu/categories'),
      ]);
      setData((foodsRes as { data: Food[] }).data);
      setCategories((catsRes as { data: Category[] }).data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setFileList([]);
    setModalOpen(true);
  };

  const openEdit = (record: Food) => {
    setEditing(record);
    form.setFieldsValue(record);
    setFileList(
      record.foodImage
        ? [{ uid: '-1', name: '图片', status: 'done', url: record.foodImage }]
        : [],
    );
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await request.put(`/menu/food/${editing.id}`, values);
      message.success('更新成功');
    } else {
      await request.post('/menu/food', values);
      message.success('创建成功');
    }
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await request.delete(`/menu/food/${id}`);
    message.success('删除成功');
    fetchData();
  };

  const handleToggle = async (id: string) => {
    await request.put(`/menu/food/${id}/toggle`);
    fetchData();
  };

  // 图片上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload/uploadImg',
    headers: { Authorization: `Bearer ${getToken()}` },
    maxCount: 1,
    listType: 'picture-card',
    accept: 'image/*',
    fileList,
    onChange(info) {
      setFileList(info.fileList);
      if (info.file.status === 'done') {
        const url = (info.file.response as { data: { url: string } }).data.url;
        form.setFieldsValue({ foodImage: url });
        message.success('上传成功');
      } else if (info.file.status === 'error') {
        message.error('上传失败');
      }
    },
    onRemove() {
      form.setFieldsValue({ foodImage: '' });
    },
  };

  const columns = [
    {
      title: '图片', key: 'image', width: 80,
      render: (_: unknown, r: Food) =>
        r.foodImage ? <Image src={r.foodImage} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 4 }} /> : '-',
    },
    { title: '菜品名称', dataIndex: 'foodName', key: 'name' },
    {
      title: '分类', key: 'category', width: 120,
      render: (_: unknown, r: Food) => r.category.classifyName,
    },
    {
      title: '价格', dataIndex: 'foodPrice', key: 'price', width: 100,
      render: (v: number) => `¥${v.toFixed(2)}`,
    },
    { title: '排序', dataIndex: 'sortOrder', key: 'sort', width: 80 },
    {
      title: '状态', key: 'status', width: 100,
      render: (_: unknown, r: Food) => (
        <Tag color={r.isActive ? 'green' : 'default'}>
          {r.isActive ? '上架' : '下架'}
        </Tag>
      ),
    },
    {
      title: '操作', key: 'action', width: 220,
      render: (_: unknown, record: Food) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
          <Button size="small" onClick={() => handleToggle(record.id)}>
            {record.isActive ? '下架' : '上架'}
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ marginBottom: 16 }}>
        新建菜品
      </Button>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={false} />
      <Modal
        title={editing ? '编辑菜品' : '新建菜品'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="classifyId" label="所属分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="请选择分类">
              {categories.map((c) => (
                <Select.Option key={c.id} value={c.id}>{c.classifyName}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="foodName" label="菜品名称" rules={[{ required: true, message: '请输入菜品名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="foodPrice" label="价格" rules={[{ required: true, message: '请输入价格' }]}>
            <InputNumber min={0} step={0.5} precision={2} style={{ width: '100%' }} addonBefore="¥" />
          </Form.Item>
          <Form.Item name="foodImage" label="菜品图片">
            <Upload {...uploadProps}>
              {fileList.length >= 1 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item name="sortOrder" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          {editing && (
            <Form.Item name="isActive" label="上架状态" valuePropName="checked">
              <Switch checkedChildren="上架" unCheckedChildren="下架" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}

// ==================== 菜单管理主页 ====================

export default function MenuPage() {
  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>菜单管理</h2>
      <Tabs
        items={[
          { key: 'category', label: '菜品分类', children: <CategoryTab /> },
          { key: 'food', label: '菜品列表', children: <FoodTab /> },
        ]}
      />
    </div>
  );
}
