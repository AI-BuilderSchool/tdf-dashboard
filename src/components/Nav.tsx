import Link from "next/link";

export function Nav({
  crumbs,
}: {
  crumbs: { label: string; href?: string }[];
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-4 text-sm">
        <Link href="/" className="font-semibold tracking-tight text-white">
          Grand Tours
        </Link>
        {crumbs.map((c) => (
          <span key={c.label} className="flex items-center gap-2 text-white/50">
            <span>/</span>
            {c.href ? (
              <Link href={c.href} className="transition hover:text-accent">
                {c.label}
              </Link>
            ) : (
              <span className="text-white">{c.label}</span>
            )}
          </span>
        ))}
      </div>
    </header>
  );
}
