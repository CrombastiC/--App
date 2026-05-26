import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from '@/lib/auth';
import LoginPage from '@/pages/login';
import AdminLayout from '@/pages/layout';
import MenuPage from '@/pages/menu';
import MoneyPage from '@/pages/money';
import CommodityPage from '@/pages/commodity';
import PrizePage from '@/pages/prize';
import OrderPage from '@/pages/order';

/** 路由守卫：未登录跳转登录页 */
function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
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
          <Route index element={<Navigate to="/menu" replace />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="money" element={<MoneyPage />} />
          <Route path="commodity" element={<CommodityPage />} />
          <Route path="prize" element={<PrizePage />} />
          <Route path="order" element={<OrderPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
