import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";
import { getAvailableYears } from "@/lib/wikipedia";

export default function Home() {
  const years = getAvailableYears();

  return (
    <main className="flex-1">
      <section className="flex min-h-[85vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
          Le Grand Départ
        </p>
        <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-7xl">
          Tour de France
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/60 sm:text-xl">
          연도를 선택해 스테이지, 코스 정보, 순위를 확인하세요.
        </p>
      </section>

      <AnimatedSection className="mx-auto max-w-6xl px-6 pb-32">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {years.map((year, i) => (
            <Link
              key={year}
              href={`/${year}`}
              className="group relative aspect-square overflow-hidden rounded-3xl bg-surface p-6 transition duration-300 hover:bg-surface-2"
            >
              <div
                className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 20%, rgba(255,205,0,0.18), transparent 60%)",
                }}
              />
              <div className="relative flex h-full flex-col justify-between">
                <span className="text-xs text-white/40">
                  {i === 0 ? "최신 대회" : "대회"}
                </span>
                <span className="text-4xl font-semibold tracking-tight text-white transition group-hover:text-accent sm:text-5xl">
                  {year}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </AnimatedSection>
    </main>
  );
}
