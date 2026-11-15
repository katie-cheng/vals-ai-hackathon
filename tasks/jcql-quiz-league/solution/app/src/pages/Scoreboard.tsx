import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { standings, useLeague } from "../store";

const CHANGE_SHOWN_MS = 6000;

export default function Scoreboard() {
  const league = useLeague();
  const rows = standings(league.teams);
  const top = Math.max(1, ...league.teams.map((t) => t.score));
  const hasSample = league.teams.some((t) => t.sample);
  const change = league.lastChange;
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!change) return;
    setNow(Date.now());
    const left = change.at + CHANGE_SHOWN_MS - Date.now();
    if (left <= 0) return;
    const t = setTimeout(() => setNow(Date.now()), left);
    return () => clearTimeout(t);
  }, [change]);
  const recent = change && now - change.at < CHANGE_SHOWN_MS ? change : null;

  useEffect(() => {
    document.title = "JCQL scoreboard, Jagadish Chandra Quiz League";
  }, []);

  return (
    <main className="wrap board">
      <div className="board-head">
        <h1>Jagadish Chandra Quiz League</h1>
        <p className="board-meta">
          <span>Jagadish Abas</span>
          {league.round && <span className="meta-round">{league.round}</span>}
        </p>
      </div>

      {hasSample && (
        <p className="notice">
          These are sample teams. Add the real ones on the <Link to="/operator">operator page</Link>.
        </p>
      )}

      {rows.length === 0 ? (
        <div className="empty">
          <h2>No teams on the board yet</h2>
          <p>
            Teams appear here, highest score first, as soon as they are added on the <Link to="/operator">operator page</Link>.
          </p>
        </div>
      ) : (
        <>
          <div className="standings-head" aria-hidden="true">
            <span>Rank</span>
            <span>Team</span>
            <span>Points</span>
          </div>
          <ol className={`standings${rows.length > 8 ? " compact" : ""}`} aria-label="Standings, highest score first">
            <AnimatePresence initial={false}>
              {rows.map(({ team, rank }) => {
                const delta = recent?.teamId === team.id ? recent.delta : 0;
                return (
                  <motion.li
                    key={team.id}
                    layout="position"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`standing${rank === 1 ? " lead" : ""}${delta ? " changed" : ""}`}
                    aria-label={`Rank ${rank}, ${team.name}, ${team.score} points`}
                  >
                    <span className="rank">{rank}</span>
                    <img className="team-logo" src={team.logo} alt={`${team.name} logo`} width={64} height={64} />
                    <div className="team">
                      <span className="team-name">{team.name}</span>
                      <span className="bar" aria-hidden="true">
                        <span style={{ width: `${Math.max(0, (team.score / top) * 100)}%` }} />
                      </span>
                    </div>
                    <div className="score">
                      <span className="score-value">{team.score}</span>
                      <span className={`delta${delta ? " show" : ""}`} aria-hidden={!delta}>
                        {delta > 0 ? `+${delta}` : delta < 0 ? `\u2212${-delta}` : ""}
                      </span>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
          <p className="board-foot">Equal scores share a rank.</p>
        </>
      )}
    </main>
  );
}
