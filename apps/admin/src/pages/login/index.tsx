import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import request from '@/lib/request';
import { setToken, setUser } from '@/lib/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { phone: string; password: string }) => {
    setLoading(true);
    try {
      const res = await request.post('/user/login', values);
      const data = (res as { data: { token: string; user: Record<string, unknown> } }).data;

      if (data.user.role !== 'admin') {
        message.error('该账号不是管理员');
        return;
      }

      setToken(data.token);
      setUser(data.user);
      message.success('登录成功');
      navigate('/');
    } catch {
      // 错误已在拦截器处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Card title="OrderFood 管理后台" style={styles.card}>
        <Form
          name="login"
          onFinish={onFinish}
          size="large"
          initialValues={{ phone: '13800000000', password: 'admin123' }}
        >
          <Form.Item name="phone" rules={[{ required: true, message: '请输入手机号' }]}>
            <Input prefix={<UserOutlined />} placeholder="手机号" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#f0f2f5',
  },
  card: {
    width: 400,
  },
};
