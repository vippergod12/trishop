import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Đổi route -> đóng sidebar (chỉ ảnh hưởng mobile vì desktop sidebar luôn mở)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Khoá scroll body khi sidebar mở (mobile)
  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className={`admin-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div
        className="admin-backdrop"
        onClick={closeSidebar}
        aria-hidden={!sidebarOpen}
      />

      <button
        type="button"
        className="admin-sidebar-toggle"
        aria-label={sidebarOpen ? 'Đóng menu' : 'Mở menu'}
        aria-expanded={sidebarOpen}
        onClick={() => setSidebarOpen((v) => !v)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <Link to="/" className="admin-brand" onClick={closeSidebar}>
          <span className="brand-mark">D</span> Shop Admin
        </Link>
        <nav className="admin-nav">
          <NavLink to="/admin/categories" onClick={closeSidebar}>Danh mục</NavLink>
          <NavLink to="/admin/products" onClick={closeSidebar}>Sản phẩm</NavLink>
          <NavLink to="/admin/featured" onClick={closeSidebar}>Tiêu biểu</NavLink>
          <Link to="/" target="_blank" rel="noreferrer" onClick={closeSidebar}>
            Xem website ↗
          </Link>
        </nav>
        <div className="admin-user">
          <div>
            <div className="admin-user-label">Đang đăng nhập</div>
            <div className="admin-user-name">{username}</div>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              logout();
              navigate('/admin/login', { replace: true });
            }}
          >
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
