import { prisma } from '../lib/prisma'

async function main() {
  // First user: mittens
  const user1 = await prisma.user.upsert({
    where: { email: 'mittens@example.com' },
    update: {},
    create: {
      email: 'mittens@example.com',
      Profile: {
        create: {
          username: 'mittens',
          displayName: 'Mittens',
          bio: 'Just a cat sharing links 😺',
          avatarUrl: 'https://example.com/avatar.jpg',
          treatCount: 0,
          Link: {
            create: [
              {
                title: 'Twitter',
                url: 'https://twitter.com/mittens',
                orderIndex: 0,
              },
              {
                title: 'GitHub',
                url: 'https://github.com/mittens',
                orderIndex: 1,
              },
              {
                title: 'Instagram',
                url: 'https://instagram.com/mittens',
                orderIndex: 2,
              },
              {
                title: 'YouTube',
                url: 'https://youtube.com/@mittens',
                orderIndex: 3,
              },
            ],
          },
        },
      },
    },
  })

  // Second user: kittycats_lover
  const user2 = await prisma.user.upsert({
    where: { email: 'kittycats_lover@example.com' },
    update: {},
    create: {
      email: 'kittycats_lover@example.com',
      Profile: {
        create: {
          username: 'kittycats_lover',
          displayName: 'Kittycats Lover',
          bio: "Hello! I'm a pixel kitty lover living in a pastel wonderland. Welcome to my cozy corner of the internet!",
          avatarUrl: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
          treatCount: 0,
          Link: {
            create: [
              {
                title: 'Discord',
                url: 'https://discord.gg/kittycats',
                orderIndex: 0,
              },
              {
                title: 'Instagram',
                url: 'https://instagram.com/kittycats_lover',
                orderIndex: 1,
              },
              {
                title: 'GitHub',
                url: 'https://github.com/kittycats_lover',
                orderIndex: 2,
              },
              {
                title: 'Twitter',
                url: 'https://twitter.com/kittycats_lover',
                orderIndex: 3,
              },
            ],
          },
        },
      },
    },
  })

  console.log({ user1, user2 })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })