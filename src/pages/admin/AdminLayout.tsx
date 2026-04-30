import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">
          <span className="brand-mark">D</span> Shop Admin
        </Link>
        <nav className="admin-nav">
          <NavLink to="/admin/categories">Danh mục</NavLink>
          <NavLink to="/admin/products">Sản phẩm</NavLink>
          <NavLink to="/admin/featured">Tiêu biểu</NavLink>
          <Link to="/" target="_blank" rel="noreferrer">Xem website ↗</Link>
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
