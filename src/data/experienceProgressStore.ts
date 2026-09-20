/**
 * Experience Points Progress Store
 * Tracks which interactive experiences the player has discovered / viewed in the museum.
 */

const STORAGE_KEY = 'museum_experience_progress_v1';

export function getDiscoveredExperiences(): string[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read experience progress from localStorage:', err);
    return [];
  }
}

export function isExperienceDiscovered(experienceId: string): boolean {
  if (!experienceId) return false;
  const list = getDiscoveredExperiences();
  const lower = experienceId.toLowerCase();
  return list.some((id) => id.toLowerCase() === lower);
}

export function markExperienceDiscovered(experienceId: string): void {
  if (!experienceId || typeof window === 'undefined' || !window.localStorage) return;
  try {
    const list = getDiscoveredExperiences();
    const lower = experienceId.toLowerCase();
    if (!list.some((id) => id.toLowerCase() === lower)) {
      list.push(experienceId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(
        new CustomEvent('museum_experience_progress_updated', {
          detail: { experienceId, totalDiscovered: list.length },
        })
      );
    }
  } catch (err) {
    console.error('Failed to save experience discovery:', err);
  }
}

export function getDiscoveredExperiencesCount(allActiveExperiences?: Array<{ id: string; experienceId?: string }>): number {
  const discovered = getDiscoveredExperiences();
  if (!allActiveExperiences || allActiveExperiences.length === 0) {
    return discovered.length;
  }
  return allActiveExperiences.filter((exp) => {
    return (
      isExperienceDiscovered(exp.id) ||
      (exp.experienceId && isExperienceDiscovered(exp.experienceId))
    );
  }).length;
}

export function resetExperienceProgress(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent('museum_experience_progress_updated', {
        detail: { totalDiscovered: 0 },
      })
    );
  } catch (err) {
    console.error('Failed to reset experience progress:', err);
  }
}
