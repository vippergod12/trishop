export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="footer-brand">
            <span className="brand-mark">D</span> Shop
          </div>
          <p className="footer-tag">Demo CRUD sản phẩm với React + Node + Neon Postgres.</p>
        </div>
        <div className="footer-meta">
          <span>© {new Date().getFullYear()} Shop Demo</span>
          <span>Deploy trên Vercel</span>
        </div>
      </div>
    </footer>
  );
}
