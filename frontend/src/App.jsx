import React, { useState, useEffect } from 'react';
import Agenda from './pages/Agenda';
import Aluno from './pages/Aluno';
import Professores from './pages/Professores';
import Gestao from './pages/Gestao';
import Login from './pages/Login';

export default function App(){
  const [route, setRoute] = useState('agenda');
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  const onLogin = (tokenVal, userVal) => {
    setToken(tokenVal);
    setUser(userVal);
    localStorage.setItem('token', tokenVal);
    localStorage.setItem('user', JSON.stringify(userVal));
    setRoute('agenda');
  };
  const logout = () => {
    setToken(null); setUser(null); localStorage.removeItem('token'); localStorage.removeItem('user');
  };

  if (!token) return <div style={{fontFamily:'sans-serif',padding:20}}><Login onLogin={onLogin} /></div>;

  return (
    <div style={{fontFamily:'sans-serif',padding:20}}>
      <header style={{display:'flex',gap:12,marginBottom:20,alignItems:'center'}}>
        <button onClick={()=>setRoute('agenda')}>Agenda do aluno</button>
        <button onClick={()=>setRoute('aluno')}>Aluno</button>
        <button onClick={()=>setRoute('professores')}>Professores</button>
        <button onClick={()=>setRoute('gestao')}>Gestão</button>
        <div style={{marginLeft:'auto'}}>
          <span style={{marginRight:8}}>Olá, {user?.username} ({user?.role})</span>
          <button onClick={logout}>Sair</button>
        </div>
      </header>
      <main>
        {route==='agenda' && <Agenda token={token} />}
        {route==='aluno' && <Aluno token={token} />}
        {route==='professores' && <Professores token={token} />}
        {route==='gestao' && <Gestao token={token} />}
      </main>
    </div>
  );
}
