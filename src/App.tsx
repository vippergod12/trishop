import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AllProductsPage from './pages/AllProductsPage';
import { useAuth } from './contexts/AuthContext';

// Admin chỉ dành cho người quản trị → tách thành chunk riêng,
// public visitor không phải tải về.
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminFeaturedPage = lazy(() => import('./pages/admin/AdminFeaturedPage'));

function PageFallback() {
  return <div className="page-loading">Đang tải...</div>;
}

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { username, loading } = useAuth();
  if (loading) return <PageFallback />;
  if (!username) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/cua-hang" element={<AllProductsPage />} />
        <Route path="/danh-muc/:slug" element={<CategoryPage />} />
        <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
      </Route>

      <Route
        path="/admin/login"
        element={
          <Suspense fallback={<PageFallback />}>
            <LoginPage />
          </Suspense>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedAdmin>
            <Suspense fallback={<PageFallback />}>
              <AdminLayout />
            </Suspense>
          </ProtectedAdmin>
        }
      >
        <Route index element={<Navigate to="categories" replace />} />
        <Route
          path="categories"
          element={
            <Suspense fallback={<PageFallback />}>
              <AdminCategoriesPage />
            </Suspense>
          }
        />
        <Route
          path="products"
          element={
            <Suspense fallback={<PageFallback />}>
              <AdminProductsPage />
            </Suspense>
          }
        />
        <Route
          path="featured"
          element={
            <Suspense fallback={<PageFallback />}>
              <AdminFeaturedPage />
            </Suspense>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
