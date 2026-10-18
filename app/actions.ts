'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

// ponytail: in-process cooldown, so it resets on restart and doesn't span
// instances, and the map grows one entry per username ever seen. Fine for a
// single SQLite-backed server; move it to a column on Profile if either of
// those stops being true.
const COOLDOWN_MS = 2000;
const lastTreatAt = new Map<string, number>();

export async function incrementTreatCount(username: string) {
  const now = Date.now();
  if (now - (lastTreatAt.get(username) ?? 0) < COOLDOWN_MS) {
    return { success: false as const, error: 'Easy there — one treat at a time.' };
  }
  lastTreatAt.set(username, now);

  try {
    // `username` is unique, so this is one query rather than a lookup plus an
    // update. A missing profile throws P2025, which the catch below reports.
    const updatedProfile = await prisma.profile.update({
      where: { username },
      data: { treatCount: { increment: 1 } },
    });

    revalidatePath(`/${username}`);

    return { success: true as const, treatCount: updatedProfile.treatCount };
  } catch (error) {
    console.error('Error incrementing treat count:', error);
    return { success: false as const, error: 'Failed to increment treat count' };
  }
}
