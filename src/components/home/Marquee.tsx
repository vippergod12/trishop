interface Props {
  items?: string[];
}

const DEFAULT_ITEMS = [
  'NEW DROP',
  'FREE SHIP TỪ 500K',
  'HÀNG HOT 2026',
  'CHẤT LIỆU CAO CẤP',
  'ĐỔI TRẢ 7 NGÀY',
  'LIMITED EDITION',
];

export default function Marquee({ items = DEFAULT_ITEMS }: Props) {
  const list = [...items, ...items, ...items];
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {list.map((it, i) => (
          <span key={i} className="marquee-item">
            {it}
            <span className="marquee-sep">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
