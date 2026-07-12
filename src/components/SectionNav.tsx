"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "section-jerseys", label: "종합 정보" },
  { id: "section-teams", label: "참가팀" },
  { id: "section-stages", label: "스테이지 정보" },
];

export function SectionNav() {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );

    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleClick = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Mobile / tablet: sticky horizontal bar under the header */}
      <nav
        aria-label="페이지 목차"
        className="sticky top-[53px] z-40 flex justify-center gap-6 border-b border-white/10 bg-black/80 px-4 py-3 backdrop-blur-xl xl:hidden"
      >
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={handleClick(s.id)}
            aria-current={active === s.id ? "true" : undefined}
            className={`text-sm font-medium whitespace-nowrap transition-colors ${
              active === s.id ? "text-accent" : "text-white/50"
            }`}
          >
            {s.label}
          </a>
        ))}
      </nav>

      {/* Desktop: fixed vertical rail on the side */}
      <nav
        aria-label="페이지 목차"
        className="fixed top-1/2 right-6 z-40 hidden -translate-y-1/2 flex-col items-end gap-5 xl:flex"
      >
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={handleClick(s.id)}
            aria-current={active === s.id ? "true" : undefined}
            className="group flex items-center gap-3"
          >
            <span
              className={`text-sm font-medium whitespace-nowrap transition-colors ${
                active === s.id ? "text-white" : "text-white/40 group-hover:text-white/70"
              }`}
            >
              {s.label}
            </span>
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                active === s.id ? "bg-accent" : "bg-white/20 group-hover:bg-white/40"
              }`}
            />
          </a>
        ))}
      </nav>
    </>
  );
}
