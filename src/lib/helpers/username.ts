import db from '@/lib/db/client';

/**
 * Generate a unique username from display name.
 * Takes the name, slugifies it, and appends a number if needed.
 */
export async function generateUsername(displayName: string): Promise<string> {
  // Slugify: lowercase, replace spaces/special chars with hyphens
  let base = displayName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

  if (!base) base = 'user';

  // Check if base username is available
  let username = base;
  let suffix = 0;

  while (true) {
    const existing = await db.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!existing) break;

    suffix++;
    username = `${base}-${suffix}`;
  }

  return username;
}
