import { useState } from "react";

type Assignment = {
  id: number;
  title: string;
  dueDate: string;
};

export default function AssignmentsPage() {
  const [items, setItems] = useState<Assignment[]>([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const add = () => {
    if (!title.trim() || !dueDate) return;
    setItems((prev) => [...prev, { id: Date.now(), title: title.trim(), dueDate }]);
    setTitle("");
    setDueDate("");
  };

  const remove = (id: number) => setItems((prev) => prev.filter((x) => x.id !== id));

  return (
    <div>
      <h2>Assignments</h2>

      <div className="card" style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <label className="label">
          Title
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label className="label">
          Due date
          <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>

        <button className="btn primary" onClick={add} type="button">
          Add assignment
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        {items.length === 0 ? (
          <p className="muted">No assignments yet.</p>
        ) : (
          <ul className="list">
            {items.map((a) => (
              <li key={a.id} className="listItem">
                <div>
                  <div style={{ fontWeight: 700 }}>{a.title}</div>
                  <div className="muted">Due: {a.dueDate}</div>
                </div>
                <button className="btn secondary" onClick={() => remove(a.id)} type="button">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}