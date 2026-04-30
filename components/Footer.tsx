import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-col footer-brand-col">
          <Link href="/" className="footer-logo">
            <span className="brand-mark">TS</span>
            <span className="footer-logo-text">TriShop</span>
          </Link>
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
          <h4>Hỗ trợ khách hàng</h4>
          <ul>
            <li>
              <Link href="/">Câu hỏi thường gặp</Link>
            </li>
            <li>
              <Link href="/">Phương thức thanh toán</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Chính sách khách hàng</h4>
          <ul>
            <li>
              <Link href="/">Chính sách bảo mật</Link>
            </li>
            <li>
              <Link href="/">Chính sách đổi trả</Link>
            </li>
            <li>
              <Link href="/">Chính sách vận chuyển</Link>
            </li>
            <li>
              <Link href="/">Chính sách khiếu nại</Link>
            </li>
            <li>
              <Link href="/">Chính sách thành viên</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© Bản quyền thuộc về TienDN {year}. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
