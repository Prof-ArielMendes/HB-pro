import React, { useState, useEffect } from 'react';

export default function Professores({ token }){
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title:'', description:'', student_id:'' });

  useEffect(()=>{
    fetch('http://localhost:4000/teachers', { headers: token ? { 'Authorization': 'Bearer '+token } : {} })
      .then(r=>r.json()).then(setTeachers).catch(()=>{});
    fetch('http://localhost:4000/students', { headers: token ? { 'Authorization': 'Bearer '+token } : {} })
      .then(r=>r.json()).then(setStudents).catch(()=>{});
    fetch('http://localhost:4000/my/tasks', { headers: token ? { 'Authorization': 'Bearer '+token } : {} })
      .then(r=>r.json()).then(setTasks).catch(()=>{});
  },[token]);

  const submit = async (e) =>{
    e.preventDefault();
    await fetch('http://localhost:4000/tasks', { method:'POST', headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+token }, body: JSON.stringify(form) });
    setForm({ title:'', description:'', student_id:'' });
    setTasks(await (await fetch('http://localhost:4000/my/tasks', { headers: { 'Authorization':'Bearer '+token } })).json());
  };

  const toggle = async (id) =>{
    await fetch('http://localhost:4000/tasks/'+id+'/toggle', { method: 'PUT', headers: { 'Authorization':'Bearer '+token } });
    setTasks(await (await fetch('http://localhost:4000/my/tasks', { headers: { 'Authorization':'Bearer '+token } })).json());
  };

  const remove = async (id) =>{
    await fetch('http://localhost:4000/tasks/'+id, { method: 'DELETE', headers: { 'Authorization':'Bearer '+token } });
    setTasks(await (await fetch('http://localhost:4000/my/tasks', { headers: { 'Authorization':'Bearer '+token } })).json());
  };

  return (
    <div>
      <h2>Professores</h2>
      <p>Visualize alunos, tarefas e notas.</p>

      <section style={{marginBottom:20}}>
        <h3>Criar tarefa</h3>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:8,maxWidth:500}}>
          <input placeholder="Título" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
          <textarea placeholder="Descrição" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          <select value={form.student_id} onChange={e=>setForm({...form,student_id:e.target.value})}>
            <option value="">-- selecionar aluno --</option>
            {students.map(s=> <option key={s.id} value={s.id}>{s.name} ({s.class})</option>)}
          </select>
          <button type="submit">Criar</button>
        </form>
      </section>

      <section>
        <h3>Minhas tarefas</h3>
        <ul>{tasks.map(t=> (
          <li key={t.id} style={{marginBottom:8}}>
            <strong>{t.title}</strong> — {t.done? 'feito':'a fazer'}
            <div><small>{t.description}</small></div>
            <div style={{marginTop:6}}>
              <button onClick={()=>toggle(t.id)}>{t.done? 'Marcar como não feito':'Marcar como feito'}</button>
              <button onClick={()=>remove(t.id)} style={{marginLeft:8}}>Remover</button>
            </div>
          </li>
        ))}</ul>
      </section>

    </div>
  );
}
