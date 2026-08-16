import React, { useEffect, useState } from 'react';

export default function Aluno({ data, setData, role, token, user }) {
  const [tasks, setTasks] = useState(() => data.tasks || []);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:4000/my/tasks', { headers: { Authorization: 'Bearer ' + token } })
        .then((r) => r.json())
        .then((rows) => setTasks(rows))
        .catch(() => setTasks([]));
    } else {
      setTasks(data.tasks || []);
    }
  }, [token, data.tasks]);

  const addLocalTask = (form) => {
    setData((current) => ({
      ...current,
      tasks: [{ id: Date.now(), title: form.title, done: false, dueDate: form.dueDate || '', subject: form.subject || 'Geral' }, ...current.tasks],
    }));
  };

  const addRemoteTask = async (form) => {
    await fetch('http://localhost:4000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ title: form.title, description: form.description, student_id: user?.id || form.student_id }),
    });
    const rows = await (await fetch('http://localhost:4000/my/tasks', { headers: { Authorization: 'Bearer ' + token } })).json();
    setTasks(rows);
  };

  const addTask = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = { title: formData.get('title')?.toString().trim(), dueDate: formData.get('dueDate'), subject: formData.get('subject'), description: formData.get('description') };
    if (!payload.title) return;
    if (token && (role === 'teacher' || role === 'coord')) {
      addRemoteTask(payload);
    } else {
      addLocalTask(payload);
    }
    e.currentTarget.reset();
  };

  const toggle = async (id) => {
    if (token) {
      await fetch(`http://localhost:4000/tasks/${id}/toggle`, { method: 'PUT', headers: { Authorization: 'Bearer ' + token } });
      const rows = await (await fetch('http://localhost:4000/my/tasks', { headers: { Authorization: 'Bearer ' + token } })).json();
      setTasks(rows);
    } else {
      setData((current) => ({
        ...current,
        tasks: current.tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
      }));
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    }
  };

  const remove = async (id) => {
    if (token) {
      await fetch(`http://localhost:4000/tasks/${id}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
      const rows = await (await fetch('http://localhost:4000/my/tasks', { headers: { Authorization: 'Bearer ' + token } })).json();
      setTasks(rows);
    } else {
      setData((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== id) }));
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Aluno</p>
          <h2>Atividades e tarefas</h2>
        </div>
      </div>

      <form className="form-grid" onSubmit={addTask}>
        <input name="title" placeholder="Nova tarefa" />
        <input name="dueDate" type="date" />
        <input name="subject" placeholder="Disciplina" defaultValue="Matemática" />
        <input name="description" placeholder="Descrição (opcional)" />
        <button type="submit">Adicionar</button>
      </form>

      <div className="card-list">
        {tasks.map((task) => (
          <div className="card" key={task.id}>
            <div className="card-topline">
              <span className={`chip ${task.done ? 'chip-success' : 'chip-warning'}`}>{task.done ? 'Concluída' : 'Pendente'}</span>
              <strong>{task.dueDate || 'Sem prazo'}</strong>
            </div>
            <h3>{task.title}</h3>
            <p>{task.subject || task.description}</p>
            <div className="inline-actions">
              <button onClick={() => toggle(task.id)}>{task.done ? 'Marcar como pendente' : 'Marcar como concluída'}</button>
              <button className="ghost-button" onClick={() => remove(task.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
