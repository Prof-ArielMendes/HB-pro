import React, { useState } from 'react';

export default function Login({ onLogin }){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try{
      const res = await fetch('http://localhost:4000/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Login failed');
      onLogin(data.token, data.user);
    }catch(e){
      setError('Network error');
    }
  };

  return (
    <div style={{maxWidth:400}}>
      <h2>Entrar</h2>
      <form onSubmit={submit}>
        <div><label>Usuário<br/><input value={username} onChange={e=>setUsername(e.target.value)} /></label></div>
        <div><label>Senha<br/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label></div>
        <div style={{marginTop:10}}><button type="submit">Entrar</button></div>
        {error && <p style={{color:'red'}}>{error}</p>}
      </form>
    </div>
  );
}
