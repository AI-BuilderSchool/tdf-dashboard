export function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-white/30">
      <p className="text-white/50">
        모든 대회·스테이지·순위 데이터의 출처:{" "}
        <a
          href="https://en.wikipedia.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          Wikipedia
        </a>{" "}
        (CC BY-SA 4.0 라이선스에 따라 사용)
      </p>
      <p className="mt-2">
        본 사이트는 Tour de France(ASO), Giro d&apos;Italia(RCS Sport), Vuelta a
        España(ASO)와 관련이 없는 비공식 팬 프로젝트이며, 각 대회의 공식 정보는 해당
        대회 공식 웹사이트를 참고하시기 바랍니다.
      </p>
    </footer>
  );
}
