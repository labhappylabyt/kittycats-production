import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProfileCard from '@/components/ProfileCard';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Fetch the profile data from the database
  const profile = await prisma.profile.findUnique({
    where: { username },
    include: {
      Link: {
        orderBy: {
          orderIndex: 'asc',
        },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 py-12 px-4">
      <ProfileCard profile={profile} />
    </main>
  );
}
