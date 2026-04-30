import { RefObject, useEffect } from 'react';

const DRAG_THRESHOLD = 6;

export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let movedDistance = 0;

    function onPointerMove(e: PointerEvent) {
      if (!isDown || !el) return;
      e.preventDefault();
      const dx = e.clientX - startX;
      const abs = Math.abs(dx);
      if (abs > movedDistance) movedDistance = abs;
      el.scrollLeft = scrollStart - dx;
    }

    function onPointerUp(_e: PointerEvent) {
      if (!isDown) return;
      isDown = false;
      el?.classList.remove('is-dragging');

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      if (movedDistance > DRAG_THRESHOLD && el) {
        const blockClick = (ev: MouseEvent) => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        el.addEventListener('click', blockClick, { capture: true, once: true });
        setTimeout(() => el.removeEventListener('click', blockClick, true), 0);
      }
    }

    function onPointerDown(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return;
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest('button, input, select, textarea')) return;
      if (!el) return;

      isDown = true;
      movedDistance = 0;
      startX = e.clientX;
      scrollStart = el.scrollLeft;
      el.classList.add('is-dragging');

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    }

    el.addEventListener('pointerdown', onPointerDown);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [ref]);
}
