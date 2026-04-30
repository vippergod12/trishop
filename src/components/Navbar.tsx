import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Category } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { username, logout } = useAuth();

  useEffect(() => {
    api.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link
          to="/"
          className="navbar-brand"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="brand-mark">TS</span>
          <span>TriShop</span>
        </Link>

        <nav className={`navbar-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={() => setOpen(false)}>Trang chủ</NavLink>
          <div className="dropdown">
            <button type="button" className="dropdown-toggle">Danh mục</button>
            <div className="dropdown-menu">
              {categories.length === 0 && <span className="dropdown-empty">Chưa có danh mục</span>}
              {categories.map((c) => (
                <Link key={c.id} to={`/danh-muc/${c.slug}`} onClick={() => setOpen(false)}>
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          {username && (
            <>
              <NavLink to="/admin" onClick={() => setOpen(false)}>Quản trị</NavLink>
              <button type="button" className="btn-link" onClick={logout}>Đăng xuất</button>
            </>
          )}
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          className="navbar-toggle"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
