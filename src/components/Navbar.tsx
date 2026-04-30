import { Link, NavLink } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import type { Category } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { username, logout } = useAuth();
  const closeTimerRef = useRef<number | null>(null);

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

  useEffect(() => {
    if (!dropdownOpen) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target?.closest('.dropdown')) setDropdownOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [dropdownOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  function clearCloseTimer() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function isDesktopViewport() {
    // Mobile (≤768px) thuần click; chỉ desktop mới phản hồi hover
    return window.matchMedia?.('(min-width: 769px)').matches;
  }

  function handleDropdownEnter() {
    if (!isDesktopViewport()) return;
    clearCloseTimer();
    setDropdownOpen(true);
  }

  function handleDropdownLeave() {
    if (!isDesktopViewport()) return;
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setDropdownOpen(false);
      closeTimerRef.current = null;
    }, 300);
  }

  function closeMobile() {
    setOpen(false);
    setDropdownOpen(false);
    clearCloseTimer();
  }

  return (
    <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link
          to="/"
          className="navbar-brand"
          onClick={() => {
            closeMobile();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <span className="brand-mark">TS</span>
          <span>TriShop</span>
        </Link>

        <nav className={`navbar-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={closeMobile}>Trang chủ</NavLink>
          <div
            className={`dropdown ${dropdownOpen ? 'open' : ''}`}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              type="button"
              className="dropdown-toggle"
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              onClick={(e) => {
                setDropdownOpen((v) => !v);
                // Bỏ focus để :focus-within không giữ menu mở khi user muốn đóng
                e.currentTarget.blur();
              }}
            >
              Danh mục
            </button>
            <div className="dropdown-menu" role="menu">
              {categories.length === 0 && <span className="dropdown-empty">Chưa có danh mục</span>}
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/danh-muc/${c.slug}`}
                  role="menuitem"
                  onClick={closeMobile}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          {username && (
            <>
              <NavLink to="/admin" onClick={closeMobile}>Quản trị</NavLink>
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  closeMobile();
                  logout();
                }}
              >
                Đăng xuất
              </button>
            </>
          )}
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          className={`navbar-toggle ${open ? 'open' : ''}`}
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
