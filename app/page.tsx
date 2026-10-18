import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <h1 className="mb-2 text-3xl font-bold text-pink-800">
        Welcome to Kittycats
      </h1>
      <p className="mb-6 text-lg text-pink-700 font-mono">
        where pixels purr
      </p>
      <Link
        href="/lab"
        className="inline-flex min-h-11 items-center px-5 bg-pink-500/20 hover:bg-pink-500/30 backdrop-blur-sm border border-pink-500/30 rounded-full text-pink-700 hover:text-pink-800 transition-all duration-300"
      >
        Click Me →
      </Link>
    </main>
  );
}
