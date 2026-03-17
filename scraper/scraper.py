"""
Asterov Dashboard — Scraper
Extrae todos los datos de la Liga Asterov desde cdasterov.es
Genera archivos JSON en ./data/ para consumo del dashboard.

Estructura HTML de la web (plataforma Clupik/Leverade):
- Tablas con clases CSS descriptivas: colstyle-nombre, colstyle-puntos, etc.
- Nombres de equipo/jugador en celdas con "Look" prepended (botón de enlace)
- Calendario con todas las jornadas en una sola página (/all)
"""

import requests
from bs4 import BeautifulSoup
import json
import os
import re
from datetime import datetime

BASE_URL = "https://cdasterov.es"
TOURNAMENT_ID = "1317178"
DIVISIONS = {
    "1a_division": {"id": "3636052", "label": "1ª División"},
    "2a_division": {"id": "3636053", "label": "2ª División"},
}
FEATURED_TEAM = "SAN CLAUDIO"
FEATURED_TEAM_ID = "15612878"

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def fetch(url):
    print(f"  GET {url}")
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "lxml")


def save_json(filename, data):
    os.makedirs(DATA_DIR, exist_ok=True)
    path = os.path.join(DATA_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  -> Saved {filename}")


def clean_name(text):
    """Remove 'Look' prefix from team/player names."""
    return re.sub(r"^Look\s*", "", text.strip())


def cell_text(row, css_class):
    """Extract text from a cell with a specific CSS class."""
    cell = row.find("td", class_=css_class)
    if cell:
        return cell.get_text(strip=True)
    return ""


def cell_int(row, css_class):
    """Extract int from a cell with a specific CSS class."""
    text = cell_text(row, css_class)
    try:
        return int(text)
    except (ValueError, TypeError):
        return 0


# ---------------------------------------------------------------------------
# 1. STANDINGS
# ---------------------------------------------------------------------------
def scrape_standings():
    print("\n[1/6] Scraping standings...")
    all_standings = {}

    for div_key, div_info in DIVISIONS.items():
        url = f"{BASE_URL}/en/tournament/{TOURNAMENT_ID}/ranking/{div_info['id']}"
        soup = fetch(url)

        teams = []
        table = soup.find("table")
        if not table:
            print(f"    WARNING: No table found for {div_key}")
            continue

        rows = table.find_all("tr")[1:]  # Skip header
        for row in rows:
            # Team link and ID
            team_link = row.find("a", href=re.compile(r"/team/\d+"))
            team_id = ""
            if team_link:
                m = re.search(r"/team/(\d+)", team_link["href"])
                if m:
                    team_id = m.group(1)

            name = clean_name(cell_text(row, "colstyle-nombre"))
            if not name:
                continue

            # Team logo from img in row
            logo = ""
            img = row.find("img")
            if img and img.get("src"):
                logo = img["src"]

            teams.append({
                "position": cell_int(row, "colstyle-posicion"),
                "name": name,
                "team_id": team_id,
                "logo": logo,
                "points": cell_int(row, "colstyle-puntos"),
                "played": cell_int(row, "colstyle-partidos-jugados"),
                "won": cell_int(row, "colstyle-partidos-ganados"),
                "drawn": cell_int(row, "colstyle-partidos-empatados"),
                "lost": cell_int(row, "colstyle-partidos-perdidos"),
                "goals_for": cell_int(row, "colstyle-valor"),
                "goals_against": cell_int(row, "colstyle-contravalor"),
                "goal_diff": cell_int(row, "colstyle-diferencia-valor"),
            })

        all_standings[div_key] = {
            "label": div_info["label"],
            "division_id": div_info["id"],
            "teams": teams,
        }
        print(f"    {div_info['label']}: {len(teams)} teams")

    save_json("standings.json", all_standings)
    return all_standings


# ---------------------------------------------------------------------------
# 2. CALENDAR (all rounds, all matches)
# ---------------------------------------------------------------------------
def scrape_calendar():
    print("\n[2/6] Scraping calendar (all rounds)...")
    all_calendar = {}

    for div_key, div_info in DIVISIONS.items():
        url = f"{BASE_URL}/en/tournament/{TOURNAMENT_ID}/calendar/{div_info['id']}/all"
        soup = fetch(url)

        rounds = []
        # Each round has an h2 header followed by a table
        h2s = soup.find_all("h2")
        tables = soup.find_all("table")

        for i, h2 in enumerate(h2s):
            round_text = h2.get_text(strip=True)
            # Extract round name and dates
            round_match = re.match(r"(Jornada \d+)\((.+)\)", round_text)
            round_name = round_match.group(1) if round_match else round_text
            round_dates = round_match.group(2).strip() if round_match else ""

            matches = []
            if i < len(tables):
                table = tables[i]
                for row in table.find_all("tr")[1:]:  # Skip header
                    home = clean_name(cell_text(row, "colstyle-equipo-1"))
                    away = clean_name(cell_text(row, "colstyle-equipo-2"))
                    result_raw = cell_text(row, "colstyle-resultado")

                    # Parse result: could be "2 — 1" or date/time info
                    score_match = re.search(r"(\d+)\s*[\u2013\u2014\-]+\s*(\d+)", result_raw)
                    if score_match:
                        home_goals = int(score_match.group(1))
                        away_goals = int(score_match.group(2))
                        played = True
                    else:
                        home_goals = None
                        away_goals = None
                        played = False

                    # Extract date/time and venue from result cell
                    date_match = re.search(
                        r"(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s*(\d{2}/\d{2}/\d{4})\s*(\d{2}:\d{2})?",
                        result_raw
                    )
                    match_date = date_match.group(2) if date_match else ""
                    match_time = date_match.group(3) if date_match and date_match.group(3) else ""

                    # Venue: everything after the time
                    venue = ""
                    if date_match:
                        after_time = result_raw[date_match.end():]
                        # Clean up venue text
                        venue = re.sub(r"^[\s,GMT\+\d]+", "", after_time).strip()

                    # Match ID from link
                    match_link = row.find("a", href=re.compile(r"/match/\d+"))
                    match_id = ""
                    if match_link:
                        m = re.search(r"/match/(\d+)", match_link["href"])
                        if m:
                            match_id = m.group(1)

                    if home or away:
                        matches.append({
                            "home": home,
                            "away": away,
                            "home_goals": home_goals,
                            "away_goals": away_goals,
                            "played": played,
                            "date": match_date,
                            "time": match_time,
                            "venue": venue,
                            "match_id": match_id,
                        })

            rounds.append({
                "round": round_name,
                "dates": round_dates,
                "matches": matches,
            })

        all_calendar[div_key] = {
            "label": div_info["label"],
            "rounds": rounds,
        }
        print(f"    {div_info['label']}: {len(rounds)} rounds, {sum(len(r['matches']) for r in rounds)} matches")

    save_json("calendar.json", all_calendar)
    return all_calendar


# ---------------------------------------------------------------------------
# 3. TEAM DETAILS
# ---------------------------------------------------------------------------
def scrape_team(team_id, team_name=""):
    url = f"{BASE_URL}/en/team/{team_id}"
    soup = fetch(url)

    # Get actual team name from page
    h1 = soup.find("h1")
    actual_name = h1.get_text(strip=True) if h1 else team_name

    # Team logo (60x60 thumbnail)
    logo = ""
    logo_img = soup.find("img", alt=re.compile(r"Picture of", re.I))
    if logo_img and logo_img.get("src"):
        logo = logo_img["src"]

    players = []
    table = soup.find("table")
    if table:
        for row in table.find_all("tr")[1:]:  # Skip header
            name = clean_name(cell_text(row, "colstyle-nombre"))
            if not name:
                continue

            # Get player ID from link
            player_link = row.find("a", href=re.compile(r"/players/\d+"))
            player_id = ""
            if player_link:
                m = re.search(r"/players/(\d+)", player_link["href"])
                if m:
                    player_id = m.group(1)

            # Player photo
            photo = ""
            player_img = row.find("img", class_="img-circle")
            if player_img and player_img.get("src"):
                photo = player_img["src"]

            players.append({
                "name": name,
                "player_id": player_id,
                "photo": photo,
                "matches_played": cell_int(row, "colstyle-partidos-jugados"),
                "total_goals": cell_int(row, "colstyle-goles-totales"),
                "goals": cell_int(row, "colstyle-goles"),
                "own_goals": cell_int(row, "colstyle-goles-propia"),
                "yellow_cards": cell_int(row, "colstyle-tarjetas-amarillas"),
                "red_cards": cell_int(row, "colstyle-tarjetas-rojas"),
                "goals_conceded": cell_int(row, "colstyle-goles-encajados"),
            })

    return {
        "team_id": team_id,
        "name": actual_name,
        "logo": logo,
        "players": players,
        "total_players": len(players),
        "url": url,
    }


def scrape_all_teams(standings):
    print("\n[3/6] Scraping team details...")
    all_teams = {}

    for div_key, div_data in standings.items():
        for team in div_data.get("teams", []):
            tid = team.get("team_id")
            if not tid or tid in all_teams:
                continue
            try:
                detail = scrape_team(tid, team.get("name", ""))
                detail["division"] = div_key
                detail["standings"] = team
                all_teams[tid] = detail
                print(f"    {detail['name']}: {detail['total_players']} players")
            except Exception as e:
                print(f"    WARNING: {team.get('name', tid)}: {e}")

    save_json("teams.json", all_teams)
    return all_teams


# ---------------------------------------------------------------------------
# 4. STATISTICS (paginated — first page only for now)
# ---------------------------------------------------------------------------
def build_statistics(all_teams):
    """Build global statistics from team rosters (complete data, no JS pagination issue)."""
    print("\n[4/6] Building statistics from team data...")

    stats = []
    for tid, tdata in all_teams.items():
        for p in tdata.get("players", []):
            stats.append({
                "name": p["name"],
                "player_id": p.get("player_id", ""),
                "photo": p.get("photo", ""),
                "team": tdata["name"],
                "team_id": tid,
                "division": tdata.get("division", ""),
                "matches_played": p.get("matches_played", 0),
                "total_goals": p.get("total_goals", 0),
                "goals": p.get("goals", 0),
                "own_goals": p.get("own_goals", 0),
                "yellow_cards": p.get("yellow_cards", 0),
                "red_cards": p.get("red_cards", 0),
                "goals_conceded": p.get("goals_conceded", 0),
            })

    save_json("statistics.json", stats)
    print(f"    {len(stats)} player records (all teams)")
    return stats


# ---------------------------------------------------------------------------
# 5. SANCTIONS
# ---------------------------------------------------------------------------
def scrape_sanctions():
    """Sanctions: colstyle-nombre, colstyle-jornada, colstyle-partido,
    colstyle-equipo, colstyle-nombre-sancion, colstyle-partidos-sancion."""
    print("\n[5/6] Scraping sanctions...")
    url = f"{BASE_URL}/en/tournament/{TOURNAMENT_ID}/sanctions"
    soup = fetch(url)

    sanctions = []
    table = soup.find("table")
    if table:
        for row in table.find_all("tr")[1:]:
            name = clean_name(cell_text(row, "colstyle-nombre"))
            if not name:
                continue

            sanctions.append({
                "player": name,
                "round": cell_text(row, "colstyle-jornada"),
                "match": cell_text(row, "colstyle-partido"),
                "team": cell_text(row, "colstyle-equipo"),
                "sanction_type": cell_text(row, "colstyle-nombre-sancion"),
                "matches_banned": cell_int(row, "colstyle-partidos-sancion"),
            })

    save_json("sanctions.json", sanctions)
    print(f"    {len(sanctions)} sanctions")
    return sanctions


# ---------------------------------------------------------------------------
# 6. NEWS
# ---------------------------------------------------------------------------
def scrape_news():
    """News page: posts/news links with pattern /posts/news/ID.
    Titles are in Facebook share links as &t=TITLE parameter."""
    print("\n[6/6] Scraping news...")
    url = f"{BASE_URL}/en/posts/news"
    soup = fetch(url)

    news = []
    seen = set()

    # Strategy 1: Extract titles from Facebook share links (most reliable)
    fb_links = soup.find_all("a", href=re.compile(r"facebook.com/sharer"))
    for fb in fb_links:
        href = fb["href"]
        # Extract title from &t= parameter
        title_match = re.search(r"[&?]t=([^&]+)", href)
        url_match = re.search(r"[&?]u=([^&]+)", href)
        if title_match and url_match:
            from urllib.parse import unquote
            title = unquote(title_match.group(1))
            post_url = unquote(url_match.group(1))
            if title not in seen:
                seen.add(title)
                news.append({
                    "title": title,
                    "url": post_url,
                    "date": "",
                    "image": "",
                })

    # Strategy 2: Also find direct post links for dates/images
    post_links = soup.find_all("a", href=re.compile(r"/posts/news/\d+"))
    for link in post_links:
        href = link.get("href", "")
        full_url = f"{BASE_URL}{href}" if href.startswith("/") else href

        parent = link.find_parent("div")
        if parent:
            img = parent.find("img")
            time_tag = parent.find("time")
            # Update existing news items with image/date
            for item in news:
                if item["url"] == full_url or full_url in item["url"]:
                    if img and img.get("src"):
                        item["image"] = img["src"]
                    if time_tag:
                        item["date"] = time_tag.get("datetime", time_tag.get_text(strip=True))

    save_json("news.json", news)
    print(f"    {len(news)} news items")
    return news


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------
def main():
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print("=" * 60)
    print("  ASTEROV DASHBOARD — SCRAPER")
    print(f"  {timestamp}")
    print("=" * 60)

    standings = scrape_standings()
    calendar = scrape_calendar()
    all_teams = scrape_all_teams(standings)
    statistics = build_statistics(all_teams)
    sanctions = scrape_sanctions()
    news = scrape_news()

    # Build team index (id -> name, division)
    team_index = {}
    for tid, tdata in all_teams.items():
        team_index[tid] = {
            "name": tdata["name"],
            "division": tdata["division"],
            "total_players": tdata["total_players"],
        }

    # Metadata
    meta = {
        "last_updated": datetime.now().isoformat(),
        "source": BASE_URL,
        "tournament": "LIGA ASTEROV 2025/26",
        "tournament_id": TOURNAMENT_ID,
        "divisions": {k: v["label"] for k, v in DIVISIONS.items()},
        "featured_team": FEATURED_TEAM,
        "featured_team_id": FEATURED_TEAM_ID,
        "team_index": team_index,
        "stats_summary": {
            "total_teams": sum(len(d.get("teams", [])) for d in standings.values()),
            "total_players": sum(t["total_players"] for t in all_teams.values()),
            "total_matches": sum(
                sum(len(r["matches"]) for r in d["rounds"])
                for d in calendar.values()
            ),
        },
    }
    save_json("meta.json", meta)

    print("\n" + "=" * 60)
    print(f"  SCRAPING COMPLETE — {meta['stats_summary']['total_teams']} teams, "
          f"{meta['stats_summary']['total_players']} players, "
          f"{meta['stats_summary']['total_matches']} matches")
    print("=" * 60)


if __name__ == "__main__":
    main()
