import type { Gradient } from '../data/types';

const AVATAR_GRADIENTS: Gradient[] = [
  ['#7C6FFF', '#F5A623'],
  ['#FF6B9D', '#7C6FFF'],
  ['#2DD4BF', '#3B82F6'],
  ['#8B5CF6', '#EC4899'],
  ['#F5A623', '#FF6B9D'],
  ['#3B82F6', '#22D3EE'],
  ['#16A34A', '#84CC16'],
  ['#EA580C', '#FACC15'],
];

/** Picks a stable avatar gradient for a member, so their colour never changes between visits. */
export function gradientFor(seed: string | undefined): Gradient {
  if (!seed) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

/** Builds up-to-two-letter initials from a display name. */
export function initialsOf(name: string | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const letters = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0];
  return letters.toUpperCase();
}

/** Falls back from profile name to email local-part to a neutral label. */
export function displayNameFrom(
  displayName: string | undefined,
  email: string | undefined,
): string {
  return displayName?.trim() || email?.split('@')[0] || 'BookBridge member';
}
