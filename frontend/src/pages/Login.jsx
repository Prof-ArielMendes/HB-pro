import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const url = mode === 'login' ? 'http://localhost:4000/auth/login' : 'http://localhost:4000/auth/register';
      const body = mode === 'login' ? { username, password } : { username, password, name: name || username, role };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (mode === 'login' ? 'Erro no login' : 'Erro no registro'));
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <form onSubmit={submit} style={{ width: 360, display: 'grid', gap: 12, padding: 20, borderRadius: 12, background: 'white', boxShadow: '0 6px 18px rgba(2,6,23,0.12)' }}>
        <h3>{mode === 'login' ? 'Entrar' : 'Registrar usuário'}</h3>

        {mode === 'register' && (
          <input placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
        )}

        <input placeholder="Usuário" value={username} onChange={e => setUsername(e.target.value)} required />
        <input placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required />

        {mode === 'register' && (
          <label>
            Perfil
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Aluno</option>
              <option value="teacher">Professor</option>
              <option value="coord">Coordenação</option>
            </select>
          </label>
        )}

        {error && <div style={{ color: 'crimson' }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="submit" disabled={loading}>{loading ? (mode === 'login' ? 'Entrando...' : 'Registrando...') : (mode === 'login' ? 'Entrar' : 'Registrar')}</button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => { onLogin(null, { username: 'guest', role: 'student' }); }} style={{ background: 'transparent', color: '#334155', border: '1px solid #cbd5e1' }}>Acessar como visitante</button>
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }} style={{ background: 'transparent', color: '#334155', border: '1px solid #cbd5e1' }}>
              {mode === 'login' ? 'Criar conta' : 'Já tenho conta'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
