import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pin, PinOff, Trash2, NotebookPen } from "lucide-react";
import { useStore } from "../lib/store";
import { modifiedLabel } from "../lib/dates";
import { NOTE_CATEGORIES, type Note } from "../lib/types";
import { EmptyState } from "../components/Feedback";

function Editor({ note, onDone }: { note: Note; onDone(): void }) {
  const { updateNote, deleteNote, askConfirm, toast } = useStore();
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [category, setCategory] = useState(note.category);
  const [error, setError] = useState("");
  useEffect(() => { setTitle(note.title); setBody(note.body); setCategory(note.category); setError(""); }, [note.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const dirty = title !== note.title || body !== note.body || category !== note.category;
  const save = () => {
    if (!title.trim()) return setError("Give the note a title.");
    updateNote(note.id, { title: title.trim(), body, category });
    toast("Note saved");
  };
  return (
    <section className="card note-editor" aria-label="Note editor">
      <form className="form" onSubmit={(e) => { e.preventDefault(); save(); }} noValidate>
        <div className="field">
          <label htmlFor="note-title">Title</label>
          <input id="note-title" value={title} aria-invalid={!!error} onChange={(e) => { setTitle(e.target.value); setError(""); }} />
          {error && <p className="field-error" role="alert">{error}</p>}
        </div>
        <div className="field">
          <label htmlFor="note-category">Category</label>
          <select id="note-category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {NOTE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="note-body">Note</label>
          <textarea id="note-body" rows={10} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div className="editor-foot">
          <p className="muted">{modifiedLabel(note.updatedAt)}</p>
          <div className="editor-actions">
            <button type="button" className="icon-btn icon-danger" aria-label="Delete note" onClick={() => askConfirm({
              title: "Delete note?", message: `"${note.title}" will be removed permanently.`, confirmLabel: "Delete note",
              onConfirm: () => { deleteNote(note.id); toast("Note deleted", "info"); onDone(); },
            })}><Trash2 size={16} /></button>
            <button type="submit" className="btn btn-primary" disabled={!dirty}>Save note</button>
          </div>
        </div>
      </form>
    </section>
  );
}

export function Notes() {
  const { data, addNote, updateNote, toast } = useStore();
  const [q, setQ] = useState(() => new URLSearchParams(location.search).get("q") ?? "");
  const [cat, setCat] = useState("All");
  const [activeId, setActiveId] = useState<string | null>(null);

  const createNote = () => {
    const id = addNote({ title: "Untitled note", body: "", category: cat === "All" ? "Personal" : cat, pinned: false });
    setActiveId(id);
    toast("Note created");
  };
  useEffect(() => {
    if (new URLSearchParams(location.search).get("new")) { history.replaceState(null, "", "/notes"); createNote(); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.notes
      .filter((n) => (cat === "All" || n.category === cat) && (!term || (n.title + "\n" + n.body).toLowerCase().includes(term)))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
  }, [data.notes, q, cat]);
  const active = data.notes.find((n) => n.id === activeId) ?? null;

  return (
    <div className="stack">
      <section className="page-head">
        <p className="page-lead">{data.notes.length} notes, {data.notes.filter((n) => n.pinned).length} pinned. Saved on this device.</p>
        <button type="button" className="btn btn-primary" onClick={createNote}><Plus size={16} />Add note</button>
      </section>
      <div className={`notes-layout${active ? " has-active" : ""}`}>
        <section className="card notes-list-card" aria-label="Notes list">
          <div className="input-icon">
            <Search size={16} aria-hidden="true" />
            <input type="search" aria-label="Search notes" placeholder="Search notes" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="chips" role="group" aria-label="Filter by category">
            {["All", ...NOTE_CATEGORIES].map((c) => (
              <button type="button" key={c} aria-pressed={cat === c} className={`chip${cat === c ? " is-on" : ""}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          {list.length === 0 ? (
            <EmptyState icon={<NotebookPen size={20} />} title={data.notes.length ? "No matching notes" : "No notes yet"}
              text={data.notes.length ? "Try another search or category." : "Capture an idea, a list or meeting notes."} />
          ) : (
            <ul className="note-list">
              {list.map((n) => (
                <li key={n.id} className={`note-item${n.id === activeId ? " is-active" : ""}`} data-note-id={n.id}>
                  <button type="button" className="note-open" onClick={() => setActiveId(n.id)} aria-current={n.id === activeId}>
                    <span className="note-title">{n.title}</span>
                    <span className="note-snippet">{n.body.split("\n")[0] || "Empty note"}</span>
                    <span className="note-meta">{n.category}, {modifiedLabel(n.updatedAt).replace("Edited", "edited")}</span>
                  </button>
                  <button type="button" className={`icon-btn pin${n.pinned ? " is-pinned" : ""}`} aria-pressed={n.pinned}
                    aria-label={n.pinned ? `Unpin "${n.title}"` : `Pin "${n.title}"`}
                    onClick={() => { updateNote(n.id, { pinned: !n.pinned }); toast(n.pinned ? "Note unpinned" : "Note pinned", "info"); }}>
                    {n.pinned ? <PinOff size={16} /> : <Pin size={16} />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        {active ? <Editor note={active} onDone={() => setActiveId(null)} /> : (
          <section className="card note-editor note-placeholder">
            <EmptyState icon={<NotebookPen size={20} />} title="Select a note" text="Pick a note from the list to read or edit it." />
          </section>
        )}
      </div>
    </div>
  );
}
