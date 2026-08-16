# Gestão Escolar

Aplicativo escolar com módulos de agenda do aluno, aluno, professores e gestão escolar. O projeto foi estruturado para funcionar em navegador e também empacotado como desktop Windows com Electron.

## Estrutura

- `frontend/`: interface web em React + Vite
- `server/`: API local em Express para persistência simples
- `electron/`: empacotamento desktop para Windows
- `.github/workflows/ci-build.yml`: pipeline de build

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie a aplicação local:
   ```bash
   npm run dev
   ```
3. Acesse o frontend em `http://localhost:5173`

## Build da web

```bash
npm run build
```

## Empacotamento desktop

```bash
npm run package
```

Este comando gera uma versão Windows em `electron/dist`.

## Recursos incluídos

- Agenda do aluno
- Área do aluno com tarefas
- Área de professores com notas e turmas
- Gestão escolar com compras, finanças e reuniões
- Personalização do nome da escola e itens de navegação
- Armazenamento local em `localStorage` e API local em JSON

## Regras de senha

- Senha mínima de 8 caracteres.
- Deve conter pelo menos uma letra (a-z, A-Z) e um número (0-9).
- O frontend exige confirmação da senha e valida força antes de permitir registro (frontend/src/pages/Login.jsx).
- O backend valida os mesmos requisitos em `/auth/register` e retorna erro em português se a senha não atender (server/index.js).

Como testar localmente:

1. Instale dependências e inicie o servidor:

   ```bash
   cd server
   npm install
   npm start
   ```

2. Abra o frontend (`npm run dev`) e tente registrar com uma senha curta ou sem números — deverá receber a mensagem: `Senha fraca: mínimo 8 caracteres e deve conter letras e números.`

3. Para registros válidos, confirme que o usuário é criado e o token é retornado.


