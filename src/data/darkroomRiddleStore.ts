/**
 * Store for Darkroom Riddle solved state and 50% Postcard Discount coupon code.
 */
export interface DarkroomDiscountRecord {
  isSolved: boolean;
  code: string;
  discountPercent: number; // 50
  title: string;
  solvedAt: string | null;
  hasAutoOpened?: boolean;
}

const STORAGE_DARKROOM_STATE = 'museum_darkroom_riddle_state_v1';

export function getDarkroomRiddleState(): DarkroomDiscountRecord {
  const defaultState: DarkroomDiscountRecord = {
    isSolved: false,
    code: '',
    discountPercent: 50,
    title: 'تخفیف ۵۰٪ کارت‌پستال',
    solvedAt: null,
    hasAutoOpened: false,
  };

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_DARKROOM_STATE);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          isSolved: Boolean(parsed.isSolved),
          code: parsed.code || '',
          discountPercent: parsed.discountPercent || 50,
          title: parsed.title || 'تخفیف ۵۰٪ کارت‌پستال',
          solvedAt: parsed.solvedAt || null,
          hasAutoOpened: Boolean(parsed.hasAutoOpened),
        };
      }
    }
  } catch (err) {
    console.error('Error reading darkroom riddle state:', err);
  }

  return defaultState;
}

export function hasDarkroomRiddleAutoOpened(): boolean {
  return Boolean(getDarkroomRiddleState().hasAutoOpened);
}

export function markDarkroomRiddleAutoOpened(): void {
  const current = getDarkroomRiddleState();
  if (current.hasAutoOpened) return;

  const newState: DarkroomDiscountRecord = {
    ...current,
    hasAutoOpened: true,
  };

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_DARKROOM_STATE, JSON.stringify(newState));
    }
  } catch (err) {
    console.error('Error saving darkroom auto-opened state:', err);
  }
}

export function saveDarkroomRiddleSuccess(): DarkroomDiscountRecord {
  const current = getDarkroomRiddleState();
  if (current.isSolved && current.code) {
    return current;
  }

  // Generate unique code e.g. POST-8K2N-41XP
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let p1 = '';
  let p2 = '';
  for (let i = 0; i < 4; i++) {
    p1 += chars[Math.floor(Math.random() * chars.length)];
    p2 += chars[Math.floor(Math.random() * chars.length)];
  }
  const code = `POST-${p1}-${p2}`;

  const newState: DarkroomDiscountRecord = {
    isSolved: true,
    code,
    discountPercent: 50,
    title: 'تخفیف ۵۰٪ کارت‌پستال',
    solvedAt: new Date().toISOString(),
    hasAutoOpened: true,
  };

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_DARKROOM_STATE, JSON.stringify(newState));
      window.dispatchEvent(
        new CustomEvent('museum_darkroom_solved_updated', {
          detail: newState,
        })
      );
    }
  } catch (err) {
    console.error('Error saving darkroom riddle state:', err);
  }

  return newState;
}

export function resetDarkroomRiddleState(force: boolean = false): void {
  try {
    const current = getDarkroomRiddleState();
    // Do not clear permanent darkroom completion and reward on regular game reset
    if (current.isSolved && !force) {
      return;
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_DARKROOM_STATE);
      window.dispatchEvent(
        new CustomEvent('museum_darkroom_solved_updated', {
          detail: { isSolved: false, code: '', hasAutoOpened: false },
        })
      );
    }
  } catch (err) {
    console.error('Error resetting darkroom riddle state:', err);
  }
}
