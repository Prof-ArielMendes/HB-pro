import { useEffect, useMemo, useState } from 'react';
import Agenda from './pages/Agenda';
import Aluno from './pages/Aluno';
import Professores from './pages/Professores';
import Gestao from './pages/Gestao';

const defaultData = {
  schoolName: 'Colégio Aurora',
  accent: '#7c3aed',
  nav: [
    { id: 'agenda', label: 'Agenda do aluno' },
    { id: 'aluno', label: 'Aluno' },
    { id: 'professores', label: 'Professores' },
    { id: 'gestao', label: 'Gestão' },
  ],
  agenda: [
    { id: 1, title: 'Aula de Matemática', date: '2026-08-17', type: 'Aula', description: 'Revisão de funções e gráficos.' },
    { id: 2, title: 'Reunião de pais', date: '2026-08-18', type: 'Reunião', description: 'Discussão do desempenho acadêmico.' },
  ],
  tasks: [
    { id: 1, title: 'Leitura do capítulo 5', dueDate: '2026-08-19', subject: 'Português', done: false },
    { id: 2, title: 'Lista de exercícios 3', dueDate: '2026-08-20', subject: 'Matemática', done: true },
  ],
  students: [
    { id: 1, name: 'Ana Ribeiro', classroom: '7A' },
    { id: 2, name: 'Pedro Souza', classroom: '7B' },
    { id: 3, name: 'Laura Costa', classroom: '9C' },
  ],
  grades: [
    { id: 1, student: 'Ana Ribeiro', subject: 'Matemática', value: 9.5 },
    { id: 2, student: 'Pedro Souza', subject: 'Português', value: 8.3 },
  ],
  purchases: [
    { id: 1, item: 'Papel A4', provider: 'Material Escola', value: 120.5 },
    { id: 2, item: 'Tinta para quadro', provider: 'Papelaria Central', value: 90 },
  ],
  meetings: [
    { id: 1, title: 'Planejamento trimestral', date: '2026-08-25', participants: 'Coordenação e professores' },
  ],
};

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('gestao-token'));
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('gestao-user');
    return u ? JSON.parse(u) : null;
  });
  const [role, setRole] = useState(user?.role || 'coord');
  const [activeTab, setActiveTab] = useState('agenda');
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('gestao-escolar-data');
    return saved ? JSON.parse(saved) : defaultData;
  });

  useEffect(() => {
    localStorage.setItem('gestao-escolar-data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (user && user.role) setRole(user.role);
  }, [user]);

  const handleLogin = (tok, u) => {
    if (tok) {
      setToken(tok);
      setUser(u);
      localStorage.setItem('gestao-token', tok);
      localStorage.setItem('gestao-user', JSON.stringify(u));
    } else {
      // guest
      setToken(null);
      setUser(u);
      localStorage.removeItem('gestao-token');
      localStorage.setItem('gestao-user', JSON.stringify(u));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('gestao-token');
    localStorage.removeItem('gestao-user');
  };

  const pageMap = useMemo(
    () => ({
      agenda: <Agenda data={data} setData={setData} role={role} token={token} user={user} />,
      aluno: <Aluno data={data} setData={setData} role={role} token={token} user={user} />,
      professores: <Professores data={data} setData={setData} role={role} token={token} user={user} />,
      gestao: <Gestao data={data} setData={setData} role={role} token={token} user={user} />,
    }),
    [data, role, token, user]
  );

  if (!token && !user) {
    const Login = require('./pages/Login').default;
    return <div style={{padding:24}}><Login onLogin={handleLogin} /></div>;
  }

  return (
    <div className="app-shell" style={{ '--accent': data.accent }}>
      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-mark">G</div>
          <div>
            <strong>{data.schoolName}</strong>
            <small>Sistema escolar</small>
          </div>
        </div>

        <nav className="nav-list">
          {data.nav.map((link) => (
            <button
              key={link.id}
              className={activeTab === link.id ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveTab(link.id)}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="content-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Painel principal</p>
            <h1>{data.schoolName}</h1>
          </div>
          <div className="topbar-actions">
            <label>
              Perfil
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Aluno</option>
                <option value="teacher">Professor</option>
                <option value="coord">Coordenação</option>
              </select>
            </label>
            <button onClick={logout} style={{marginLeft:12,background:'#ef4444'}}>Sair</button>
          </div>
        </header>

        {pageMap[activeTab]}
      </main>
    </div>
  );
}

export default App;
