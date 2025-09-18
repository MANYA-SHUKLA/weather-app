'use client';

import { useRef, useCallback } from 'react';

interface UseTouchSwipeProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export const useTouchSwipe = ({ onSwipeLeft, onSwipeRight, threshold = 50 }: UseTouchSwipeProps) => {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const xDiff = touchStart.current.x - touchEnd.x;
    const yDiff = touchStart.current.y - touchEnd.y;

    // Check if it's primarily a horizontal swipe
    if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > threshold) {
      if (xDiff > 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (xDiff < 0 && onSwipeRight) {
        onSwipeRight();
      }
    }

    touchStart.current = null;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return {
    onTouchStart,
    onTouchEnd,
  };
};