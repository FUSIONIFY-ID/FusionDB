const checkpoints = [
  ['Toolchain', 'Pinned'],
  ['Console', 'Bootstrapped'],
  ['Control API', 'Bootstrapped'],
  ['PostgreSQL', 'Local compose ready'],
  ['Project provisioning', 'Next'],
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <div className="mb-10 flex items-center justify-between border-b border-neutral-800 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">FusionDB</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">M001 Bootstrap</h1>
        </div>
        <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">v0.1</span>
      </div>

      <section className="grid gap-px overflow-hidden rounded-xl border border-neutral-800 bg-neutral-800 md:grid-cols-2">
        {checkpoints.map(([label, status]) => (
          <article key={label} className="bg-neutral-950 p-5">
            <p className="text-sm text-neutral-500">{label}</p>
            <p className="mt-2 text-base font-medium">{status}</p>
          </article>
        ))}
      </section>

      <p className="mt-10 max-w-2xl text-sm leading-6 text-neutral-400">
        This page intentionally stays minimal. The first product milestone is not a marketing site. It is a verified
        path from account and project creation to an isolated PostgreSQL database that a Node.js application can use.
      </p>
    </main>
  );
}
