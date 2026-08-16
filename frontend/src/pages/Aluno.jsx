import React, { useState, useEffect } from 'react';

export default function Aluno({ token }){
  const [tasks, setTasks] = useState([]);
  useEffect(()=>{
    fetch('http://localhost:4000/my/tasks', { headers: token ? { 'Authorization': 'Bearer '+token } : {} })
      .then(r=>r.json()).then(setTasks).catch(()=>{});
  },[token]);

  const toggle = async (id) =>{
    await fetch('http://localhost:4000/tasks/'+id+'/toggle', { method: 'PUT', headers: { 'Authorization':'Bearer '+token } }).catch(()=>{});
    setTasks(await (await fetch('http://localhost:4000/my/tasks', { headers: { 'Authorization':'Bearer '+token } })).json());
  };

  return (
    <div>
      <h2>Área do Aluno</h2>
      <p>Tarefas feitas e a fazer:</p>
      <ul>{tasks.map(t=> (
        <li key={t.id} style={{marginBottom:8}}>
          <strong>{t.title}</strong> — {t.done? 'feito':'a fazer'}
          <div><small>{t.description}</small></div>
          <div style={{marginTop:6}}><button onClick={()=>toggle(t.id)}>{t.done? 'Marcar como não feito':'Marcar como feito'}</button></div>
        </li>
      ))}</ul>
    </div>
  );
}
