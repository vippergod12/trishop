export default function StorySection() {
  return (
    <section className="section section-dark">
      <div className="container story-grid">
        <div
          className="story-image"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200)",
          }}
          aria-hidden
        />
        <div className="story-content">
          <span className="section-eyebrow">Về chúng tôi</span>
          <h2>Cửa hàng nhỏ — gu thẩm mỹ lớn</h2>
          <p>
            Mỗi sản phẩm tại Shop được lựa chọn kỹ lưỡng với chất liệu tốt và thiết kế tinh tế.
            Chúng tôi tin rằng sự đơn giản đi kèm với chất lượng là cách bền nhất để tôn vinh
            phong cách của bạn.
          </p>
          <ul className="story-list">
            <li>
              <strong>Chọn lọc kỹ</strong>
              <span>Mỗi sản phẩm đều được thử và đánh giá trước khi lên kệ.</span>
            </li>
            <li>
              <strong>Giá thật</strong>
              <span>Không khuyến mãi ảo, chỉ một mức giá đúng giá trị.</span>
            </li>
            <li>
              <strong>Đổi trả 7 ngày</strong>
              <span>Yên tâm trải nghiệm, không hài lòng đổi trả miễn phí.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
