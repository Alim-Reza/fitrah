'use client';

/**
 * Track consecutive shorts viewing in session storage
 */

export function getConsecutiveShortsCount(): number {
  if (typeof window === 'undefined') return 0;
  const count = sessionStorage.getItem('consecutive-shorts-count');
  return count ? parseInt(count) : 0;
}

export function incrementConsecutiveShortsCount(): number {
  if (typeof window === 'undefined') return 0;
  const current = getConsecutiveShortsCount();
  const newCount = current + 1;
  sessionStorage.setItem('consecutive-shorts-count', newCount.toString());
  return newCount;
}

export function resetConsecutiveShortsCount(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('consecutive-shorts-count');
}

export function getLastVideoType(): 'video' | 'shorts' | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('last-video-type') as 'video' | 'shorts' | null;
}

export function setLastVideoType(type: 'video' | 'shorts'): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('last-video-type', type);
}
