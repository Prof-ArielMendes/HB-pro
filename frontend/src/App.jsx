import React, { useState, useEffect } from 'react';
import Agenda from './pages/Agenda';
import Aluno from './pages/Aluno';
import Professores from './pages/Professores';
import Gestao from './pages/Gestao';

export default function App(){
  const [route, setRoute] = useState('agenda');
  return (
    <div style={{fontFamily:'sans-serif',padding:20}}>
      <header style={{display:'flex',gap:12,marginBottom:20}}>
        <button onClick={()=>setRoute('agenda')}>Agenda do aluno</button>
        <button onClick={()=>setRoute('aluno')}>Aluno</button>
        <button onClick={()=>setRoute('professores')}>Professores</button>
        <button onClick={()=>setRoute('gestao')}>Gestão</button>
      </header>
      <main>
        {route==='agenda' && <Agenda />}
        {route==='aluno' && <Aluno />}
        {route==='professores' && <Professores />}
        {route==='gestao' && <Gestao />}
      </main>
    </div>
  );
}
