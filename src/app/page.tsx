import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";
import { getAvailableYears } from "@/lib/db";

export default function Home() {
  const years = getAvailableYears();

  return (
    <main className="flex-1">
      <section className="flex min-h-[85vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-base font-semibold tracking-tight text-accent">
          Le Grand Départ
        </p>
        <h1 className="mt-4 max-w-5xl text-6xl font-semibold tracking-tighter text-white sm:text-8xl">
          Tour de France
        </h1>
        <p className="mt-6 max-w-xl text-xl font-normal tracking-tight text-white/60 sm:text-2xl">
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
              <div className="relative flex h-full flex-col">
                <span className="text-xs text-white/40">
                  {i === 0 ? "최신 대회" : "대회"}
                </span>
                <div className="flex flex-1 items-center justify-center">
                  <span className="text-4xl font-semibold tracking-tighter text-white transition group-hover:text-accent sm:text-5xl">
                    {year}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </AnimatedSection>
    </main>
  );
}
