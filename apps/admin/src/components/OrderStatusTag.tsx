import { Tag } from 'antd';
import type { OrderStatus } from '@/types/admin';

const STATUS_META: Record<OrderStatus, { color: string; label: string }> = {
  pending: { color: 'gold', label: '待支付' },
  paid: { color: 'blue', label: '已支付' },
  completed: { color: 'green', label: '已完成' },
  cancelled: { color: 'default', label: '已取消' },
};

export default function OrderStatusTag({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status];
  return <Tag color={meta.color}>{meta.label}</Tag>;
}
