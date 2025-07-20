# Tecnologias e Stack do RepSUN

## Stack Principal

- **Frontend**: React 18 com TypeScript
- **Build System**: Vite
- **Estilização**: TailwindCSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Gerenciamento de Estado**: Zustand, React Query
- **Validação de Formulários**: Zod, React Hook Form
- **Roteamento**: React Router
- **Testes**: Jest, React Testing Library

## Bibliotecas Principais

- **UI Components**: shadcn/ui (baseado em Radix UI)
- **Autenticação**: Supabase Auth + sistema personalizado com localStorage
- **Formulários**: React Hook Form com validação Zod
- **Requisições HTTP**: Supabase Client + React Query
- **Formatação de Dados**: date-fns
- **Gráficos**: Recharts
- **Notificações**: Sonner (toast)

## Comandos Comuns

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Construir para produção
npm run build

# Construir para ambiente de desenvolvimento
npm run build:dev

# Visualizar build
npm run preview
```

### Testes

```bash
# Executar todos os testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage
```

### Linting

```bash
# Executar linter
npm run lint
```

## Supabase

### Migrações

Para aplicar migrações ao banco de dados:

```bash
node scripts/apply-migrations.js
```

### Usuários Admin

Para adicionar um usuário administrador:

```bash
node scripts/add-admin-user.js
```

## Autenticação

O sistema utiliza uma abordagem híbrida de autenticação:
- Sistema nativo do Supabase Auth
- Sistema personalizado baseado em localStorage

Está em andamento a migração completa para o sistema nativo do Supabase Auth.