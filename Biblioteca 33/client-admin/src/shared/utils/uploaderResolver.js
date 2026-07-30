import { getProfileById } from '../api/auth';

const uploaderNameCache = new Map();

export const truncateUserId = (userId) => {
  if (!userId) return '';
  if (userId.length <= 12) return userId;
  return `${userId.slice(0, 8)}…`;
};

const buildDisplayName = (profile, userId) => {
  const parts = [profile?.name, profile?.surname].filter(Boolean);
  if (parts.length > 0) return parts.join(' ');
  if (profile?.username) return profile.username;
  return truncateUserId(userId);
};

export const resolveUploaderDisplayName = async (userId) => {
  if (!userId) return '';

  if (uploaderNameCache.has(userId)) {
    return uploaderNameCache.get(userId);
  }

  try {
    const profile = await getProfileById(userId);
    const display = buildDisplayName(profile, userId);
    uploaderNameCache.set(userId, display);
    return display;
  } catch {
    const fallback = truncateUserId(userId);
    uploaderNameCache.set(userId, fallback);
    return fallback;
  }
};
