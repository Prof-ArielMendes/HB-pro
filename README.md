Gestão Escolar — scaffold PWA + Electron + SQLite

Resumo
Aplicação com frontend React (Vite) PWA, backend Node/Express com SQLite (better-sqlite3) e empacotamento desktop via Electron.

Pré-requisitos (Windows)
- Node.js v18+ and npm
- Python 3.8+ on PATH (required by node-gyp for native modules)
- Visual Studio Build Tools (C++ workload) or "windows-build-tools" equivalent

Instalação local (desenvolvimento)
1. Instalar dependências:
   - cd server && npm install
   - cd frontend && npm install
   - cd electron && npm install
2. Rodar backend (será em :4000):
   - cd server && npm start
3. Rodar frontend (Vite dev):
   - cd frontend && npm run dev  # abre em http://localhost:5173
4. (Opcional) Rodar Electron em dev:
   - cd electron && npm start
   - defina NODE_ENV=development para apontar para Vite

Variáveis de ambiente úteis
- JWT_SECRET: segredo para tokens JWT (mudar para produção)

Notas sobre better-sqlite3 e erros de build
- Se npm install falhar ao compilar better-sqlite3, instale Python e Visual Studio Build Tools e tente novamente.
- Em CI (GitHub Actions) o runner já possui as ferramentas necessárias; o workflow .github/workflows/ci-build.yml gera instalador Windows.

Registrar usuário inicial (exemplo curl)
- Registrar coordenação:
  curl -X POST http://localhost:4000/auth/register -H "Content-Type: application/json" -d '{"username":"coord","password":"senha","role":"coord"}'
- Login:
  curl -X POST http://localhost:4000/auth/login -H "Content-Type: application/json" -d '{"username":"coord","password":"senha"}'

Empacotamento e CI
- Local: electron-packager é configurado em electron/package.json (script: npm run package). Gera dist/Gestao Escolar-win32-x64.
- CI: configurado para usar electron-builder no workflow ci-build.yml; artefatos do build são publicados como artifacts no Actions.

Suporte
Abra uma issue ou peça para eu configurar mais funções (autenticação social, permissões finas, editor visual).
