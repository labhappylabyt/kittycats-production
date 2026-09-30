import { fallbackRepos, github, projects, type Repo } from '@/config/site'

/** Rough language colours — enough to read at a glance, not a full GitHub map. */
const LANG_COLOR: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  'C++': '#f34b7d',
  C: '#555555',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Rust: '#dea584',
  Java: '#b07219',
  Go: '#00ADD8',
  Shell: '#89e051',
}

type RawRepo = {
  name: string
  description: string | null
  language: string | null
  stargazers_count: number
  html_url: string
  fork: boolean
}

async function getRepos(): Promise<Repo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${github.username}/repos?sort=updated&per_page=100`,
      {
        next: { revalidate: github.revalidate },
        headers: { Accept: 'application/vnd.github+json' },
      },
    )
    if (!res.ok) return fallbackRepos
    const raw = (await res.json()) as RawRepo[]
    if (!Array.isArray(raw)) return fallbackRepos

    const repos = raw
      .filter((r) => !r.fork && !github.hidden.includes(r.name))
      .map((r) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        href: r.html_url,
      }))

    // An account with only forks would otherwise render an empty grid.
    return repos.length ? repos : fallbackRepos
  } catch {
    return fallbackRepos
  }
}

export async function ProjectsGrid() {
  const repos = await getRepos()
  const featured = projects.filter((p) => p.featured)

  return (
    <div className="grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-12">
      {featured.map((project) => (
        <a
          key={project.title}
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex min-h-64 flex-col justify-between rounded-2xl border p-6 text-left transition-all duration-300 hover:-translate-y-1 sm:col-span-7 sm:p-7"
          style={{
            background: 'linear-gradient(135deg, rgba(185,167,255,.16), rgba(255,255,255,.035))',
            color: 'var(--foreground)',
            borderColor: 'var(--edge)',
            boxShadow: '0 18px 50px rgba(0,0,0,.18)',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-pixel text-xl leading-tight sm:text-2xl">{project.title}</h3>
            <span
              className="shrink-0 rounded-full border-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{ borderColor: 'var(--ink)' }}
            >
              {project.status}
            </span>
          </div>

          <p className="mt-3 max-w-[62ch] text-[15px] font-medium leading-relaxed opacity-80">
            {project.blurb}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg border-2 px-2 py-0.5 text-[11px] font-bold"
                style={{ borderColor: 'var(--ink)' }}
              >
                {tag}
              </span>
            ))}
            <span className="ml-auto text-lg transition-transform duration-150 group-hover:translate-x-0.5">
              ↗
            </span>
          </div>
        </a>
      ))}

      {repos.map((repo) => (
        <a
          key={repo.name}
          href={repo.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex min-h-44 flex-col rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 sm:col-span-5"
          style={{
            background: 'rgba(255,255,255,.035)',
            borderColor: 'var(--edge)',
            boxShadow: 'none',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="truncate font-pixel text-sm text-foreground">{repo.name}</h3>
            <span
              className="shrink-0 text-sm text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              ↗
            </span>
          </div>

          <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted-foreground">
            {repo.description ?? 'No description yet.'}
          </p>

          <div className="mt-4 flex items-center gap-3 text-[11px] font-semibold text-muted-foreground">
            {repo.language && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: LANG_COLOR[repo.language] ?? 'var(--edge)' }}
                  aria-hidden="true"
                />
                {repo.language}
              </span>
            )}
            {repo.stars > 0 && <span aria-label={`${repo.stars} stars`}>★ {repo.stars}</span>}
          </div>
        </a>
      ))}
    </div>
  )
}
