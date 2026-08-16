import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro no login');
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{display:'grid',placeItems:'center',minHeight:'60vh'}}>
      <form onSubmit={submit} style={{width:360,display:'grid',gap:12,padding:20,borderRadius:12,background:'white',boxShadow:'0 6px 18px rgba(2,6,23,0.12)'}}>
        <h3>Entrar</h3>
        <input placeholder="Usuário" value={username} onChange={e=>setUsername(e.target.value)} required />
        <input placeholder="Senha" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        {error && <div style={{color:'crimson'}}>{error}</div>}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <button type="submit" disabled={loading}>{loading? 'Entrando...' : 'Entrar'}</button>
          <button type="button" onClick={() => { onLogin(null, { username: 'guest', role: 'student' }); }} style={{background:'transparent',color:'#334155',border:'1px solid #cbd5e1'}}>Acessar como visitante</button>
        </div>
      </form>
    </div>
  );
}
