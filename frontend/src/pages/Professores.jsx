import React, { useEffect, useState } from 'react';

export default function Professores({ data, setData, role, token, user }) {
  const [students, setStudents] = useState(data.students || []);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', student_id: '' });

  useEffect(() => {
    if (token) {
      fetch('http://localhost:4000/students', { headers: { Authorization: 'Bearer ' + token } })
        .then((r) => r.json())
        .then(setStudents)
        .catch(() => setStudents([]));
      fetch('http://localhost:4000/my/tasks', { headers: { Authorization: 'Bearer ' + token } })
        .then((r) => r.json())
        .then(setTasks)
        .catch(() => setTasks([]));
    } else {
      setStudents(data.students || []);
      setTasks(data.tasks || []);
    }
  }, [token, data.students, data.tasks]);

  const submit = async (e) => {
    e.preventDefault();
    if (token) {
      await fetch('http://localhost:4000/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(form) });
      const rows = await (await fetch('http://localhost:4000/my/tasks', { headers: { Authorization: 'Bearer ' + token } })).json();
      setTasks(rows);
    } else {
      // local fallback
      setData((current) => ({ ...current, tasks: [{ id: Date.now(), title: form.title, description: form.description }, ...current.tasks] }));
      setTasks((prev) => [{ id: Date.now(), title: form.title, description: form.description }, ...prev]);
    }
    setForm({ title: '', description: '', student_id: '' });
  };

  const toggle = async (id) => {
    if (token) {
      await fetch('http://localhost:4000/tasks/' + id + '/toggle', { method: 'PUT', headers: { Authorization: 'Bearer ' + token } });
      setTasks(await (await fetch('http://localhost:4000/my/tasks', { headers: { Authorization: 'Bearer ' + token } })).json());
    } else {
      setData((current) => ({ ...current, tasks: current.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    }
  };

  const remove = async (id) => {
    if (token) {
      await fetch('http://localhost:4000/tasks/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
      setTasks(await (await fetch('http://localhost:4000/my/tasks', { headers: { Authorization: 'Bearer ' + token } })).json());
    } else {
      setData((current) => ({ ...current, tasks: current.tasks.filter((t) => t.id !== id) }));
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Professores</p>
          <h2>Turmas, alunos e notas</h2>
        </div>
      </div>

      <section style={{ marginBottom: 20 }}>
        <h3>Criar tarefa</h3>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 500 }}>
          <input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
            <option value="">-- selecionar aluno --</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.classroom || s.class})</option>
            ))}
          </select>
          <button type="submit">Criar</button>
        </form>
      </section>

      <section>
        <h3>Minhas tarefas</h3>
        <ul>{tasks.map((t) => (
          <li key={t.id} style={{ marginBottom: 8 }}>
            <strong>{t.title}</strong> — {t.done ? 'feito' : 'a fazer'}
            <div><small>{t.description}</small></div>
            <div style={{ marginTop: 6 }}>
              <button onClick={() => toggle(t.id)}>{t.done ? 'Marcar como não feito' : 'Marcar como feito'}</button>
              <button onClick={() => remove(t.id)} style={{ marginLeft: 8 }}>Remover</button>
            </div>
          </li>
        ))}</ul>
      </section>

    </div>
  );
}
