import { motion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { monogram, readLogo } from "../logo";
import { NAME_MAX, newId, parseBackup, save, standings, useLeague, type League, type Team } from "../store";

const STEPS = [1, 5, 10, 20];
const COLOURS = ["#3f5a4c", "#5b4a36", "#3d4a5c", "#5a3f47", "#4b5536", "#3b5257", "#56473f"];
const MINUS = "\u2212";

type Undo = { label: string; league: League };

function nameError(name: string, teams: Team[], selfId?: string) {
  const clean = name.trim().replace(/\s+/g, " ");
  if (!clean) return "Enter a team name.";
  if (clean.length > NAME_MAX) return `Keep the name under ${NAME_MAX} characters.`;
  if (teams.some((t) => t.id !== selfId && t.name.toLowerCase() === clean.toLowerCase())) return `A team called ${clean} is already on the board.`;
  return "";
}

export default function Operator() {
  const league = useLeague();
  const [undo, setUndo] = useState<Undo[]>([]);
  const [step, setStep] = useState(10);
  const [error, setError] = useState("");
  const rows = standings(league.teams);
  const hasSample = league.teams.some((t) => t.sample);

  useEffect(() => {
    document.title = "Operator, JCQL scoreboard";
  }, []);

  /** Applies a change, keeping the previous league for Undo. */
  const commit = (label: string, next: League) => {
    try {
      save(next);
      setUndo((u) => [...u.slice(-29), { label, league }]);
      setError("");
      return true;
    } catch {
      setError("The browser's storage is full. Use smaller logo images or remove teams you no longer need.");
      return false;
    }
  };
  const undoLast = () => {
    const last = undo[undo.length - 1];
    if (!last) return;
    try {
      save(last.league);
      setUndo((u) => u.slice(0, -1));
    } catch {
      setError("Undo could not be saved.");
    }
  };

  const updateTeam = (id: string, patch: Partial<Team>, label: string, delta = 0) =>
    commit(label, {
      ...league,
      teams: league.teams.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      lastChange: delta ? { teamId: id, delta, at: Date.now() } : league.lastChange,
    });

  const addScore = (team: Team, delta: number) =>
    updateTeam(team.id, { score: team.score + delta }, `${delta > 0 ? "+" : MINUS}${Math.abs(delta)} for ${team.name}`, delta);

  const setScore = (team: Team, score: number) => {
    if (score === team.score) return;
    updateTeam(team.id, { score }, `${team.name} set to ${score}`, score - team.score);
  };

  const removeTeam = (team: Team) =>
    commit(`Removed ${team.name}`, { ...league, teams: league.teams.filter((t) => t.id !== team.id), lastChange: null });

  return (
    <main className="wrap desk">
      <div className="desk-head">
        <h1>Operator</h1>
        <p className="lede">
          Add teams and keep the scores here. The <Link to="/">scoreboard</Link> re-sorts itself, highest score first, and updates in any other tab of
          this browser straight away.
        </p>
      </div>

      {hasSample && (
        <div className="notice notice-row">
          <p>The board is showing a sample league. Remove it before the real teams are added, or keep it to practise.</p>
          <button
            type="button"
            className="btn"
            onClick={() => commit("Removed the sample teams", { ...league, teams: league.teams.filter((t) => !t.sample), lastChange: null })}
          >
            Remove sample teams
          </button>
        </div>
      )}
      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      <div className="desk-grid">
        <div className="desk-side">
          <AddTeam league={league} onAdd={(team) => commit(`Added ${team.name}`, { ...league, teams: [...league.teams, team] })} />
          <RoundForm league={league} onSave={(round) => commit(round ? `Round set to ${round}` : "Round cleared", { ...league, round })} />
          <Backup league={league} onRestore={(next, label) => commit(label, next)} onError={setError} />
        </div>

        <section className="panel teams-panel" aria-labelledby="teams-title">
          <div className="panel-head">
            <h2 id="teams-title">Teams and scores</h2>
            <div className="panel-tools">
              <fieldset className="steps">
                <legend>Step</legend>
                {STEPS.map((s) => (
                  <label key={s} className={s === step ? "on" : ""}>
                    <input type="radio" name="step" value={s} checked={s === step} onChange={() => setStep(s)} />
                    {s}
                  </label>
                ))}
              </fieldset>
              <button type="button" className="btn btn-quiet" onClick={undoLast} disabled={!undo.length} title={undo.length ? `Undo: ${undo[undo.length - 1].label}` : "Nothing to undo"}>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 3 2 6l3 3" />
                  <path d="M2 6h8a4 4 0 0 1 0 8H7" />
                </svg>
                Undo
              </button>
            </div>
          </div>
          {undo.length > 0 && <p className="last-action">Last change: {undo[undo.length - 1].label}</p>}

          {rows.length === 0 ? (
            <p className="empty-line">No teams yet. Add the first one with the form.</p>
          ) : (
            <ol className="op-list">
              {rows.map(({ team, rank }) => (
                <motion.li key={team.id} layout="position" className="op-row">
                  <TeamRow
                    team={team}
                    rank={rank}
                    step={step}
                    teams={league.teams}
                    onAdd={(d) => addScore(team, d)}
                    onSet={(s) => setScore(team, s)}
                    onEdit={(patch) => updateTeam(team.id, { ...patch, sample: false }, `Edited ${patch.name ?? team.name}`)}
                    onRemove={() => removeTeam(team)}
                  />
                </motion.li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}

function LogoPicker({ id, logo, onLogo, onError }: { id: string; logo: string; onLogo: (l: string) => void; onError: (e: string) => void }) {
  const [fileName, setFileName] = useState("");
  return (
    <div className="logo-pick">
      {logo ? <img src={logo} alt="Logo preview" width={56} height={56} /> : <span className="logo-blank" aria-hidden="true" />}
      <div>
        <label className="btn file-btn" htmlFor={id}>
          {logo ? "Change image" : "Upload image"}
        </label>
        <input
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              onLogo(await readLogo(file));
              setFileName(file.name);
              onError("");
            } catch (err) {
              onError((err as Error).message);
            }
            e.target.value = "";
          }}
        />
        <p className="hint">{fileName ? <span className="file-name">{fileName}</span> : "PNG, JPG, SVG or WebP. Square images look best."}</p>
      </div>
    </div>
  );
}

function AddTeam({ league, onAdd }: { league: League; onAdd: (t: Team) => boolean }) {
  const [name, setName] = useState("");
  const [score, setScore] = useState("0");
  const [logo, setLogo] = useState("");
  const [error, setError] = useState("");
  const [added, setAdded] = useState("");
  const [formKey, setFormKey] = useState(0);
  const nameRef = useRef<HTMLInputElement>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const problem = nameError(name, league.teams);
    const start = Number(score || 0);
    if (problem || !Number.isInteger(start)) {
      setError(problem || "The starting score must be a whole number.");
      setAdded("");
      nameRef.current?.focus();
      return;
    }
    const clean = name.trim().replace(/\s+/g, " ");
    const team = { id: newId(), name: clean, score: start, logo: logo || monogram(clean, COLOURS[league.teams.length % COLOURS.length]) };
    if (!onAdd(team)) return;
    setAdded(`${clean} is on the board.`);
    setName("");
    setScore("0");
    setLogo("");
    setError("");
    setFormKey((k) => k + 1);
    nameRef.current?.focus();
  };

  return (
    <section className="panel" aria-labelledby="add-title">
      <h2 id="add-title">Add a team</h2>
      <form onSubmit={submit} noValidate className="form" key={formKey}>
        <div className="field">
          <label htmlFor="team-name">Team name</label>
          <input
            id="team-name"
            ref={nameRef}
            name="teamName"
            value={name}
            maxLength={NAME_MAX + 10}
            autoComplete="off"
            aria-invalid={!!error}
            aria-describedby={error ? "add-error" : undefined}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <span className="field-label" id="team-logo-label">Logo</span>
          <LogoPicker id="team-logo" logo={logo} onLogo={setLogo} onError={setError} />
        </div>
        <div className="field field-short">
          <label htmlFor="team-score">Starting score</label>
          <input id="team-score" name="startingScore" type="number" inputMode="numeric" step={1} value={score} onChange={(e) => setScore(e.target.value)} />
        </div>
        {error && (
          <p id="add-error" className="field-error" role="alert">
            {error}
          </p>
        )}
        {added && !error && (
          <p className="field-ok" role="status">
            {added}
          </p>
        )}
        <button type="submit" className="btn btn-primary">
          Add team
        </button>
      </form>
    </section>
  );
}

function TeamRow(props: {
  team: Team;
  rank: number;
  step: number;
  teams: Team[];
  onAdd: (d: number) => void;
  onSet: (s: number) => void;
  onEdit: (p: Partial<Team>) => boolean;
  onRemove: () => void;
}) {
  const { team, rank, step, teams } = props;
  const [draft, setDraft] = useState(String(team.score));
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [name, setName] = useState(team.name);
  const [logo, setLogo] = useState(team.logo);
  const [error, setError] = useState("");

  useEffect(() => setDraft(String(team.score)), [team.score]);
  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 5000);
    return () => clearTimeout(t);
  }, [confirming]);

  const commitDraft = () => {
    const n = Number(draft);
    if (draft.trim() === "" || !Number.isInteger(n)) return setDraft(String(team.score));
    props.onSet(n);
  };

  if (editing) {
    const saveEdit = (e: FormEvent) => {
      e.preventDefault();
      const problem = nameError(name, teams, team.id);
      if (problem) return setError(problem);
      if (props.onEdit({ name: name.trim().replace(/\s+/g, " "), logo })) setEditing(false);
    };
    return (
      <form className="edit-row" onSubmit={saveEdit} noValidate>
        <div className="field">
          <label htmlFor={`name-${team.id}`}>Team name</label>
          <input id={`name-${team.id}`} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!error} />
        </div>
        <div className="field">
          <span className="field-label">Logo</span>
          <LogoPicker id={`logo-${team.id}`} logo={logo} onLogo={setLogo} onError={setError} />
        </div>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <div className="edit-actions">
          <button type="submit" className="btn btn-primary">
            Save changes
          </button>
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => {
              setEditing(false);
              setName(team.name);
              setLogo(team.logo);
              setError("");
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="op-team">
      <span className="rank">{rank}</span>
      <img className="team-logo" src={team.logo} alt={`${team.name} logo`} width={44} height={44} />
      <span className="op-name">{team.name}</span>
      <div className="scorer" role="group" aria-label={`Score for ${team.name}`}>
        <button type="button" className="btn btn-step" onClick={() => props.onAdd(-step)} aria-label={`Take ${step} from ${team.name}`}>
          {MINUS}
          {step}
        </button>
        <input
          type="number"
          inputMode="numeric"
          step={1}
          aria-label={`${team.name} score`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitDraft();
            if (e.key === "Escape") setDraft(String(team.score));
          }}
        />
        <button type="button" className="btn btn-step" onClick={() => props.onAdd(step)} aria-label={`Give ${step} to ${team.name}`}>
          +{step}
        </button>
      </div>
      <div className="row-actions">
        <button
          type="button"
          className="btn btn-quiet"
          onClick={() => {
            setName(team.name);
            setLogo(team.logo);
            setError("");
            setEditing(true);
          }}
          aria-label={`Edit ${team.name}`}
        >
          Edit
        </button>
        {confirming ? (
          <button type="button" className="btn btn-danger" onClick={props.onRemove} aria-label={`Confirm removing ${team.name}`}>
            Confirm
          </button>
        ) : (
          <button type="button" className="btn btn-quiet" onClick={() => setConfirming(true)} aria-label={`Remove ${team.name}`}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

function RoundForm({ league, onSave }: { league: League; onSave: (r: string) => boolean }) {
  const [round, setRound] = useState(league.round);
  useEffect(() => setRound(league.round), [league.round]);
  return (
    <section className="panel" aria-labelledby="round-title">
      <h2 id="round-title">Round</h2>
      <form
        className="inline-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(round.trim().slice(0, 60));
        }}
      >
        <label htmlFor="round" className="sr-only">
          Current round
        </label>
        <input id="round" value={round} placeholder="Round 2, visual round" onChange={(e) => setRound(e.target.value)} />
        <button type="submit" className="btn">
          Show on board
        </button>
      </form>
      <p className="hint">Shown under the league name. Leave it empty to hide it.</p>
    </section>
  );
}

function Backup({ league, onRestore, onError }: { league: League; onRestore: (l: League, label: string) => boolean; onError: (e: string) => void }) {
  const [resetting, setResetting] = useState(false);
  const download = () => {
    const blob = new Blob([JSON.stringify(league, null, 1)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `jcql-backup-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  return (
    <section className="panel" aria-labelledby="backup-title">
      <h2 id="backup-title">Backup and reset</h2>
      <p className="hint">Scores are saved in this browser only. Download a backup before clearing the browser or moving to another laptop.</p>
      <div className="button-row">
        <button type="button" className="btn" onClick={download}>
          Download backup
        </button>
        <label className="btn file-btn">
          Restore backup
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              try {
                onRestore(parseBackup(await file.text()), "Restored a backup");
              } catch (err) {
                onError(err instanceof SyntaxError ? "This file is not a JCQL backup." : (err as Error).message);
              }
            }}
          />
        </label>
      </div>
      <div className="button-row">
        {resetting ? (
          <>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                onRestore({ ...league, teams: league.teams.map((t) => ({ ...t, score: 0 })), lastChange: null }, "Reset every score to 0");
                setResetting(false);
              }}
            >
              Set every score to 0
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => setResetting(false)}>
              Keep scores
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-quiet" onClick={() => setResetting(true)} disabled={!league.teams.length}>
            Reset scores
          </button>
        )}
      </div>
    </section>
  );
}
