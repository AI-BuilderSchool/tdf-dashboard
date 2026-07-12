export function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-white/30">
      <p>
        경기 데이터 출처:{" "}
        <a
          href="https://en.wikipedia.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white/50"
        >
          Wikipedia
        </a>{" "}
        (CC BY-SA 4.0). 본 사이트는 Tour de France, ASO와 관련이 없는 비공식 팬 프로젝트입니다.
      </p>
    </footer>
  );
}
