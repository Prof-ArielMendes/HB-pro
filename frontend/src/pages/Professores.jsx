import React, { useState, useEffect } from 'react';

export default function Professores({ token }){
  const [teachers, setTeachers] = useState([]);
  useEffect(()=>{
    fetch('http://localhost:4000/teachers', { headers: token ? { 'Authorization': 'Bearer '+token } : {} })
      .then(r=>r.json()).then(setTeachers).catch(()=>{});
  },[token]);
  return (
    <div>
      <h2>Professores</h2>
      <p>Visualize alunos, tarefas e notas.</p>
      <ul>{teachers.map(t=> <li key={t.id}>{t.name} — {t.subject}</li>)}</ul>
    </div>
  );
}
