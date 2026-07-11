import * as cheerio from "cheerio";
import type { RosterRider, TeamEntry } from "./types";

/**
 * Parses the "By team" roster tables from a
 * "List of teams and cyclists in the {year} Tour de France" article.
 * Each team is its own small table; the team code comes from the
 * `{{anchor|CODE}}` span Wikipedia places right after the team name.
 */
export function parseTeamsAndRiders(html: string): TeamEntry[] {
  const $ = cheerio.load(html);

  // Each heading's content lives inside its own <section>, so the
  // parent of the h3 already scopes exactly to the "By team" subsection.
  const scope = $("h3#By_team").parent();

  const teams: TeamEntry[] = [];

  scope.find("table.wikitable.plainrowheaders").each((_, tableEl) => {
    const table = $(tableEl);
    const caption = table.find("caption").first();
    // The caption's first <a> is the (textless) flag link, e.g.
    // <a href="./Netherlands"><img .../></a> — skip to the first <a> with text.
    const teamLink = caption
      .find("a")
      .filter((_, el) => $(el).text().trim().length > 0)
      .first();
    const name = teamLink.text().trim();
    if (!name) return;

    const wikiHref = teamLink.attr("href") ?? "";
    const wikiTitle = decodeURIComponent(wikiHref.replace(/^\.\//, "").replace(/_/g, " "));
    const code = caption.find("span.anchor").first().attr("id") ?? name;

    const riders: RosterRider[] = [];
    table
      .find("tbody > tr")
      .slice(1) // header row: No. / Rider / Pos.
      .each((_, tr) => {
        const $tr = $(tr);
        const bib = $tr.find("th").first().text().trim();
        const tds = $tr.find("td");
        if (tds.length < 2) return;

        const riderCell = $(tds[0]);
        const posCell = $(tds[tds.length - 1]);
        const riderName = riderCell.find("a").first().text().trim();
        const country = riderCell.find("abbr").first().text().trim() || null;
        const position = posCell.text().trim();

        if (riderName) riders.push({ bib, name: riderName, country, position });
      });

    if (riders.length > 0) {
      teams.push({ code, name, wikiTitle, riders });
    }
  });

  return teams;
}
