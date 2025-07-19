export const DEFAULT_PROFILE_PICTURE = "https://picsum.photos/seed/profile/100/100";

/**
 * Returns a fully-qualified URL for a user's profile image. If the supplied URL is
 *  – undefined or empty      → default placeholder is returned
 *  – already absolute/data   → returned unchanged
 *  – relative                → prepended with VITE_API_BASE_URL (or empty string)
 */
export function getProfileImage(url?: string | null): string {
  if (!url) return DEFAULT_PROFILE_PICTURE;
  if (/^(https?:|data:)/.test(url)) return url;
  const base = import.meta.env.VITE_API_BASE_URL || '';
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${base}${normalized}`;
}
