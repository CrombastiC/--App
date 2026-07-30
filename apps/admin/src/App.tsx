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

// 预加载所有后台页面组件，避免首次切换菜单时懒加载闪烁
const pageModules = [
  import('@/pages/dashboard'),
  import('@/pages/orders'),
  import('@/pages/users'),
  import('@/pages/menu'),
  import('@/pages/money'),
  import('@/pages/commodity'),
  import('@/pages/prizes'),
  import('@/pages/coupons'),
  import('@/pages/gift-cards'),
];
function preloadPages() {
  pageModules.forEach((mod) => mod.catch(() => {}));
}

/** 路由守卫：未登录跳转登录页 */
function RequireAuth({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  // 登录后预加载所有后台页面，消除首次切换菜单的懒加载闪烁
  if (isAuthenticated()) {
    preloadPages();
  }

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
