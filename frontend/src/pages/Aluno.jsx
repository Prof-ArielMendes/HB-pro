import React, { useState, useEffect } from 'react';

export default function Aluno(){
  const [tasks, setTasks] = useState([]);
  useEffect(()=>{fetch('http://localhost:4000/tasks').then(r=>r.json()).then(setTasks).catch(()=>{});},[]);
  return (
    <div>
      <h2>Área do Aluno</h2>
      <p>Tarefas feitas e a fazer:</p>
      <ul>{tasks.map(t=> <li key={t.id}>{t.title} — {t.done? 'feito':'a fazer'}</li>)}</ul>
    </div>
  );
}
