export interface UserProfile {
  name: string;
  avatarId: string;
}

const STORAGE_USER_PROFILE_KEY = 'museum_user_profile';

export function getUserProfile(): UserProfile | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_USER_PROFILE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (err) {
    console.error('Error reading user profile:', err);
  }
  return null;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_USER_PROFILE_KEY, JSON.stringify(profile));
      window.dispatchEvent(
        new CustomEvent('museum_user_profile_updated', {
          detail: profile,
        })
      );
    }
  } catch (err) {
    console.error('Error saving user profile:', err);
  }
}
