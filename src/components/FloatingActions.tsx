import { useEffect, useState } from 'react';

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="floating-actions">
      <button
        type="button"
        className="floating-btn floating-chat"
        aria-label="Chat trực tuyến"
        onClick={() => alert('Chat online sẽ được tích hợp sau.')}
        title="Chat với chúng tôi"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M12 3a9 9 0 0 0-9 9c0 1.6.4 3.1 1.1 4.4L3 21l4.7-1.1A9 9 0 1 0 12 3zm-3 10.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm3 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm3 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
        </svg>
      </button>

      <button
        type="button"
        className={`floating-btn floating-top ${showTop ? 'is-visible' : ''}`}
        aria-label="Lên đầu trang"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Lên đầu trang"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 14l6-6 6 6" />
        </svg>
      </button>
    </div>
  );
}
