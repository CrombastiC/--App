import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, type ReactNode } from 'react';
import { Spin } from 'antd';
import { isAuthenticated } from '@/lib/auth';

const LoginPage = lazy(() => import('@/pages/login'));
const AdminLayout = lazy(() => import('@/pages/layout'));
const MenuPage = lazy(() => import('@/pages/menu'));
const MoneyPage = lazy(() => import('@/pages/money'));
const CommodityPage = lazy(() => import('@/pages/commodity'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));
const OrdersPage = lazy(() => import('@/pages/orders'));
const UsersPage = lazy(() => import('@/pages/users'));
const CouponsPage = lazy(() => import('@/pages/coupons'));
const GiftCardsPage = lazy(() => import('@/pages/gift-cards'));
const PrizesPage = lazy(() => import('@/pages/prizes'));

/** 路由守卫：未登录跳转登录页 */
function RequireAuth({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}><Spin size="large" /></div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="money" element={<MoneyPage />} />
            <Route path="commodity" element={<CommodityPage />} />
            <Route path="prizes" element={<PrizesPage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="gift-cards" element={<GiftCardsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
