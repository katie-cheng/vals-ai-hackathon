import { useState, type FormEvent } from "react";
import { useStore } from "../lib/store";
import { PRIORITIES, PRIORITY_LABEL, TASK_CATEGORIES, type Priority, type Task } from "../lib/types";
import { Modal } from "./Modal";

export function TaskModal({ task, defaultDue, onClose }: { task?: Task; defaultDue?: string; onClose(): void }) {
  const { addTask, updateTask, toast, data } = useStore();
  const [title, setTitle] = useState(task?.title ?? "");
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? data.settings.defaultPriority);
  const [category, setCategory] = useState(task?.category ?? "Work");
  const [due, setDue] = useState(task?.due ?? defaultDue ?? "");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const clean = title.trim();
    if (!clean) return setError("Give the task a title.");
    if (clean.length > 120) return setError("Keep the title under 120 characters.");
    const fields = { title: clean, notes: notes.trim(), priority, category, due: due || null };
    if (task) {
      updateTask(task.id, fields);
      toast("Task updated");
    } else {
      addTask(fields);
      toast(`Added "${clean}"`);
    }
    onClose();
  };

  return (
    <Modal title={task ? "Edit task" : "New task"} onClose={onClose} footer={<>
      <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
      <button type="submit" form="task-form" className="btn btn-primary">{task ? "Save changes" : "Create task"}</button>
    </>}>
      <form id="task-form" className="form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="task-title">Title</label>
          <input id="task-title" name="title" value={title} aria-invalid={!!error} aria-describedby={error ? "task-title-error" : undefined}
            onChange={(e) => { setTitle(e.target.value); setError(""); }} placeholder="What needs to get done?" />
          {error && <p className="field-error" id="task-title-error" role="alert">{error}</p>}
        </div>
        <div className="field">
          <label htmlFor="task-notes">Notes <span className="optional">(optional)</span></label>
          <textarea id="task-notes" name="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="task-priority">Priority</label>
            <select id="task-priority" name="priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-category">Category</label>
            <select id="task-category" name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {TASK_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-due">Due date</label>
            <input id="task-due" name="due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
