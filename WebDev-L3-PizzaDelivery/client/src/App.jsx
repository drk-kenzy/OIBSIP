import { Navigate, Route, Routes } from 'react-router-dom';

import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import BuilderPage from './pages/BuilderPage';
import SummaryPage from './pages/SummaryPage';
import OrdersPage from './pages/OrdersPage';
import OrderStatusPage from './pages/OrderStatusPage';

import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminStockPage from './pages/admin/AdminStockPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';

import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/build" element={<ProtectedRoute><BuilderPage /></ProtectedRoute>} />
      <Route path="/summary" element={<ProtectedRoute><SummaryPage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><OrderStatusPage /></ProtectedRoute>} />

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/stock" element={<AdminProtectedRoute><AdminStockPage /></AdminProtectedRoute>} />
      <Route path="/admin/orders" element={<AdminProtectedRoute><AdminOrdersPage /></AdminProtectedRoute>} />
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
