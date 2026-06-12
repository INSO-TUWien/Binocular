import { useState, useRef, useEffect, useCallback } from 'react';

export interface OverlayStyle {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
}

export function useExpandOverlay(orientation?: string, maxWidth = 400) {
  const isHorizontal = orientation === 'horizontal';
  const [isOpen, setIsOpen] = useState(false);
  const [overlayStyle, setOverlayStyle] = useState<OverlayStyle | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const calcStyle = useCallback((): OverlayStyle | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const isAtBottom = rect.top > window.innerHeight / 2;
    const width = Math.min(maxWidth, window.innerWidth - rect.left - 8);
    return isAtBottom
      ? { bottom: window.innerHeight - rect.top, left: Math.max(4, rect.left), width }
      : { top: rect.bottom, left: Math.max(4, rect.left), width };
  }, [maxWidth]);

  const open = useCallback(() => {
    setOverlayStyle(calcStyle());
    setIsOpen(true);
  }, [calcStyle]);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => (isOpen ? close() : open()), [isOpen, open, close]);

  useEffect(() => {
    if (!isOpen || !isHorizontal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, isHorizontal, close]);

  useEffect(() => {
    if (!isOpen || !isHorizontal) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (containerRef.current?.contains(t) || overlayRef.current?.contains(t)) return;
      close();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [isOpen, isHorizontal, close]);

  if (!isHorizontal) {
    return { isOpen: false, containerRef, overlayRef, overlayStyle: null, open, close, toggle };
  }
  return { isOpen, containerRef, overlayRef, overlayStyle, open, close, toggle };
}
