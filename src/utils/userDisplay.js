/**
 * Shared helpers for user initials and avatar colors.
 * Accepts user object { name, email } or plain name string for initials.
 */

const AVATAR_COLORS = [
  'bg-gradient-to-br from-blue-500 to-blue-600',
  'bg-gradient-to-br from-purple-500 to-purple-600',
  'bg-gradient-to-br from-pink-500 to-pink-600',
  'bg-gradient-to-br from-green-500 to-green-600',
  'bg-gradient-to-br from-orange-500 to-orange-600',
  'bg-gradient-to-br from-indigo-500 to-indigo-600',
  'bg-gradient-to-br from-teal-500 to-teal-600',
  'bg-gradient-to-br from-rose-500 to-rose-600',
];

export function getUserInitials(userOrName) {
  if (!userOrName) return '?';
  const name = typeof userOrName === 'string' ? userOrName : (userOrName.name || userOrName.email || '');
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name[0]?.toUpperCase() || '?';
}

export function getUserAvatarColor(userId) {
  if (!userId) return AVATAR_COLORS[0];
  const index = parseInt(String(userId).slice(-1), 16) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index] || AVATAR_COLORS[0];
}
