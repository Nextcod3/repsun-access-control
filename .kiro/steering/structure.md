# Estrutura do Projeto RepSUN

## Organização de Pastas

```
src/
├── components/       # Componentes React reutilizáveis
│   ├── layout/       # Componentes de layout (AdminLayout, etc.)
│   └── ui/           # Componentes de UI (shadcn/ui)
├── config/           # Configurações da aplicação
├── hooks/            # Hooks personalizados
│   ├── useAuth.tsx   # Hook de autenticação
│   ├── useToast.ts   # Hook para notificações
│   └── ...
├── integrations/     # Integrações com serviços externos
│   └── supabase/     # Cliente e tipos do Supabase
├── lib/              # Bibliotecas e utilitários
├── pages/            # Páginas da aplicação
│   ├── admin/        # Páginas administrativas
│   ├── auth/         # Páginas de autenticação
│   └── ...
├── routes/           # Configuração de rotas
├── schemas/          # Esquemas de validação (Zod)
├── services/         # Serviços para comunicação com o backend
│   ├── produtoService.ts
│   ├── usuarioService.ts
│   └── ...
├── store/            # Gerenciamento de estado global (Zustand)
├── types/            # Tipos TypeScript
└── utils/            # Utilitários
    ├── format.ts     # Funções de formatação
    └── ...

supabase/
├── migrations/       # Migrações SQL do banco de dados
└── config.toml       # Configuração do Supabase

scripts/              # Scripts utilitários
├── add-admin-user.js
└── apply-migrations.js
```

## Convenções de Código

### Nomenclatura

- **Arquivos**: PascalCase para componentes React, camelCase para outros
- **Variáveis e Funções**: camelCase
- **Componentes e Tipos**: PascalCase
- **Constantes**: UPPER_SNAKE_CASE para constantes globais

### Importações

- Usar imports absolutos com alias `@/` quando possível
- Agrupar imports por categoria (React, bibliotecas externas, componentes, etc.)

### Componentes

- Componentes funcionais com TypeScript
- Props tipadas explicitamente
- Uso de React.FC para componentes funcionais
- Comentários JSDoc para documentação

### Estilização

- TailwindCSS para estilização
- Uso de classes utilitárias do Tailwind
- Componentes shadcn/ui para UI consistente
- Variantes com class-variance-authority quando necessário

## Padrões de Arquitetura

### Autenticação

- Contexto de autenticação global (AuthProvider)
- Hook useAuth para acesso ao contexto
- Rotas protegidas com componente ProtectedRoute

### Gerenciamento de Estado

- Zustand para estado global
- React Query para estado de servidor
- Context API para estados específicos de componentes

### Formulários

- React Hook Form para gerenciamento de formulários
- Zod para validação de esquemas
- Componentes de formulário reutilizáveis

### Comunicação com Backend

- Serviços específicos para cada entidade
- Funções assíncronas com tratamento de erros
- Uso de tipos TypeScript para dados

## Banco de Dados

### Tabelas Principais

- **users**: Usuários do sistema
- **clientes**: Clientes cadastrados
- **produtos**: Produtos com preços por região
- **orcamentos**: Orçamentos gerados
- **itens_orcamento**: Itens de cada orçamento
- **condicoes_pagamento**: Condições de pagamento