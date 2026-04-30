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

    function onMouseMove(e: MouseEvent) {
      if (!isDown || !el) return;
      e.preventDefault();
      const dx = e.clientX - startX;
      const abs = Math.abs(dx);
      if (abs > movedDistance) movedDistance = abs;
      el.scrollLeft = scrollStart - dx;
    }

    function onMouseUp(_e: MouseEvent) {
      if (!isDown) return;
      isDown = false;
      el?.classList.remove('is-dragging');

      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (movedDistance > DRAG_THRESHOLD && el) {
        const blockClick = (ev: MouseEvent) => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        el.addEventListener('click', blockClick, { capture: true, once: true });
        setTimeout(() => el.removeEventListener('click', blockClick, true), 0);
      }
    }

    function onMouseDown(e: MouseEvent) {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest('button, input, select, textarea')) return;
      if (!el) return;

      isDown = true;
      movedDistance = 0;
      startX = e.clientX;
      scrollStart = el.scrollLeft;
      el.classList.add('is-dragging');

      window.addEventListener('mousemove', onMouseMove, { passive: false });
      window.addEventListener('mouseup', onMouseUp);
    }

    function onDragStart(e: DragEvent) {
      e.preventDefault();
    }

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('dragstart', onDragStart);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('dragstart', onDragStart);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [ref]);
}
