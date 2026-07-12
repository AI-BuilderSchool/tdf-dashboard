"use client";

import { useEffect, useState } from "react";

export function StageIndex({ stages }: { stages: string[] }) {
  const [active, setActive] = useState(stages[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id.replace("stage-", ""));
          }
        }
      },
      { rootMargin: "-40% 0px -40% 0px" },
    );

    const elements = stages
      .map((s) => document.getElementById(`stage-${s}`))
      .filter((el): el is HTMLElement => el !== null);
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [stages]);

  if (stages.length === 0) return null;

  const handleClick = (stage: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document
      .getElementById(`stage-${stage}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <nav
      aria-label="스테이지 목차"
      className="fixed top-1/2 right-3 z-40 hidden max-h-[70vh] -translate-y-1/2 flex-col gap-1.5 overflow-y-auto py-2 xl:flex"
    >
      {stages.map((s) => (
        <a
          key={s}
          href={`#stage-${s}`}
          onClick={handleClick(s)}
          aria-label={`Stage ${s}로 이동`}
          aria-current={active === s ? "true" : undefined}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium transition-colors ${
            active === s
              ? "bg-accent text-black"
              : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
          }`}
        >
          {s}
        </a>
      ))}
    </nav>
  );
}
