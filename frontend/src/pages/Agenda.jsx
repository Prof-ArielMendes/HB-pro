import React, { useState, useEffect } from 'react';

export default function Agenda(){
  const [students, setStudents] = useState([]);
  useEffect(()=>{fetch('http://localhost:4000/students').then(r=>r.json()).then(setStudents).catch(()=>{});},[]);
  return (
    <div>
      <h2>Agenda do aluno</h2>
      <p>Cadastre rotina e visualize agendas.</p>
      <ul>{students.map(s=> <li key={s.id}>{s.name} — {s.class}</li>)}</ul>
    </div>
  );
}
