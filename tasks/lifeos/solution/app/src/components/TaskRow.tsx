import { Check, Pencil, Trash2, CalendarDays } from "lucide-react";
import { dueLabel } from "../lib/dates";
import { isOverdue } from "../lib/stats";
import { useStore } from "../lib/store";
import { PRIORITY_LABEL, type Task } from "../lib/types";

export function Checkbox({ checked, label, onChange }: { checked: boolean; label: string; onChange(): void }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} aria-label={label} className={`check${checked ? " is-checked" : ""}`} onClick={onChange}>
      {checked && <Check size={14} strokeWidth={3} />}
    </button>
  );
}

export function TaskRow({ task, onEdit, compact = false }: { task: Task; onEdit?(t: Task): void; compact?: boolean }) {
  const { toggleTask, deleteTask, askConfirm, toast } = useStore();
  const overdue = isOverdue(task);
  const toggle = () => {
    toggleTask(task.id);
    toast(task.completed ? `Moved "${task.title}" back to pending` : `Completed "${task.title}"`);
  };
  const remove = () => askConfirm({
    title: "Delete task?",
    message: `"${task.title}" will be removed permanently.`,
    confirmLabel: "Delete task",
    onConfirm: () => { deleteTask(task.id); toast("Task deleted", "info"); },
  });
  return (
    <li className={`task-row${task.completed ? " is-done" : ""}${overdue ? " is-overdue" : ""}`} data-task-id={task.id}>
      <Checkbox checked={task.completed} label={`Mark "${task.title}" as ${task.completed ? "not completed" : "completed"}`} onChange={toggle} />
      <div className="task-main">
        <p className="task-title">{task.title}</p>
        <div className="task-meta">
          <span className={`prio prio-${task.priority}`}>{PRIORITY_LABEL[task.priority]}</span>
          <span className="task-cat">{task.category}</span>
          {task.due && (
            <span className={`task-due${overdue ? " is-overdue" : ""}`}>
              <CalendarDays size={14} aria-hidden="true" />
              {dueLabel(task.due, task.completed)}
            </span>
          )}
        </div>
      </div>
      {!compact && (
        <div className="row-actions">
          {onEdit && <button type="button" className="icon-btn" aria-label={`Edit "${task.title}"`} onClick={() => onEdit(task)}><Pencil size={16} /></button>}
          <button type="button" className="icon-btn icon-danger" aria-label={`Delete "${task.title}"`} onClick={remove}><Trash2 size={16} /></button>
        </div>
      )}
    </li>
  );
}
