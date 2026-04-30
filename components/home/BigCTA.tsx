'use client';

import Reveal from '../Reveal';

export default function BigCTA() {
  return (
    <section className="section section-cta">
      <Reveal variant="fade-up">
        <div className="container cta-grid">
          <h2>
            <span>Một địa chỉ</span>
            <span className="cta-italic">cho phong cách</span>
            <span>của bạn.</span>
          </h2>
          <a
            href="#hot"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('hot')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="cta-link"
          >
            Bắt đầu mua sắm ↗
          </a>
        </div>
      </Reveal>
    </section>
  );
}
