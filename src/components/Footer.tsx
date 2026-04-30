import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-col footer-brand-col">
          <div className="footer-logo">
            <span className="brand-mark">D</span>
            <span className="footer-logo-text">D-SHOP</span>
          </div>
          <p className="footer-tag">
          </p>
          <ul className="footer-contact">
            <li>
              <span className="footer-contact-label">Địa chỉ:</span>
              123 Đường ABC, Quận 1, TP. Hồ Chí Minh
            </li>
            <li>
              <span className="footer-contact-label">Hotline:</span>
              <a href="tel:0900000000">0900 000 000</a>
            </li>
            <li>
              <span className="footer-contact-label">Email:</span>
              <a href="mailto:hello@dshop.demo">hello@dshop.demo</a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>D-Shop</h4>
          <ul>
            <li>
              <Link to="/">Về chúng tôi</Link>
            </li>
            <li>
              <Link to="/">Liên hệ</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Hỗ trợ khách hàng</h4>
          <ul>
            <li>
              <Link to="/">Câu hỏi thường gặp</Link>
            </li>
            <li>
              <Link to="/">Phương thức thanh toán</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Chính sách khách hàng</h4>
          <ul>
            <li>
              <Link to="/">Chính sách bảo mật</Link>
            </li>
            <li>
              <Link to="/">Chính sách đổi trả</Link>
            </li>
            <li>
              <Link to="/">Chính sách vận chuyển</Link>
            </li>
            <li>
              <Link to="/">Chính sách khiếu nại</Link>
            </li>
            <li>
              <Link to="/">Chính sách thành viên</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col footer-connect-col">
          <h4>Kết nối với chúng tôi</h4>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M13.5 21v-7h2.4l.4-2.8h-2.8V9.4c0-.8.2-1.4 1.4-1.4h1.5V5.5c-.7-.1-1.5-.2-2.3-.2-2.2 0-3.7 1.3-3.7 3.8v2.1H8v2.8h2.4V21h3.1z" />
              </svg>
            </a>
            <a href="#" aria-label="TikTok" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M19.6 7.2a5.5 5.5 0 0 1-3.3-1.1V15a5.5 5.5 0 1 1-5.5-5.5c.4 0 .7 0 1 .1v2.7a2.7 2.7 0 1 0 1.9 2.6V3h2.6a3.5 3.5 0 0 0 3.3 3.3v.9z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
                <circle cx="12" cy="12" r="3.8" />
                <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="#" aria-label="Youtube" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M22 8.2c-.2-1.4-.8-2-2.1-2.2C17.6 5.7 12 5.7 12 5.7s-5.6 0-7.9.3C2.8 6.2 2.2 6.8 2 8.2 1.7 9.7 1.7 12 1.7 12s0 2.3.3 3.8c.2 1.4.8 2 2.1 2.2 2.3.3 7.9.3 7.9.3s5.6 0 7.9-.3c1.3-.2 1.9-.8 2.1-2.2.3-1.5.3-3.8.3-3.8s0-2.3-.3-3.8zM10 15V9l5 3-5 3z" />
              </svg>
            </a>
          </div>

          <h4 className="footer-subscribe-heading">Đăng ký nhận tin</h4>
          <form
            className="footer-subscribe"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input type="email" placeholder="Nhập email của bạn" aria-label="Email" />
            <button type="submit">Đăng ký</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© Bản quyền thuộc về D-Shop {year}. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
