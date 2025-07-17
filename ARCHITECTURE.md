# Arquitetura do Sistema RepSUN

## Visão Geral

O RepSUN é um sistema web para geração de orçamentos de produtos para oficinas mecânicas. O sistema permite cadastro de produtos (com imagem, descrição e preço), montagem de orçamentos, simulação de condições de pagamento, geração de PDF e envio fácil pelo WhatsApp.

## Tecnologias Utilizadas

- **Frontend**: React, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Gerenciamento de Estado**: Zustand, React Query
- **Validação de Formulários**: Zod, React Hook Form
- **Roteamento**: React Router
- **Estilização**: TailwindCSS, shadcn/ui

## Estrutura de Pastas

```
src/
├── components/       # Componentes React reutilizáveis
│   └── ui/           # Componentes de UI (shadcn/ui)
├── hooks/            # Hooks personalizados
├── integrations/     # Integrações com serviços externos
│   └── supabase/     # Cliente e tipos do Supabase
├── lib/             # Bibliotecas e utilitários
├── pages/           # Páginas da aplicação
├── schemas/         # Esquemas de validação (Zod)
├── services/        # Serviços para comunicação com o backend
│   ├── orcamento/   # Serviços relacionados a orçamentos
│   └── ...
├── store/           # Gerenciamento de estado global (Zustand)
├── types/           # Tipos TypeScript
└── utils/           # Utilitários
```

## Fluxo de Dados

1. **Componentes de UI**: Interagem com o usuário e disparam ações
2. **Stores**: Gerenciam o estado global da aplicação
3. **Serviços**: Comunicam-se com o backend (Supabase)
4. **Hooks**: Encapsulam lógica reutilizável
5. **Utilitários**: Fornecem funções auxiliares

## Autenticação e Autorização

- Autenticação baseada em localStorage
- Autorização baseada em perfis de usuário (admin, usuario)
- Proteção de rotas com componente `ProtectedRoute`
- Políticas de segurança (RLS) no Supabase

## Banco de Dados

### Tabelas

- **users**: Usuários do sistema
- **clientes**: Clientes cadastrados
- **produtos**: Produtos com preços por região
- **orcamentos**: Orçamentos gerados
- **itens_orcamento**: Itens de cada orçamento
- **condicoes_pagamento**: Condições de pagamento de cada orçamento
- **opcoes_pagamento**: Opções pré-configuradas de pagamento
- **orcamentos_pdf**: PDFs gerados para cada orçamento

### Relacionamentos

- Um usuário pode ter vários clientes e orçamentos
- Um cliente pode ter vários orçamentos
- Um orçamento pertence a um usuário e um cliente
- Um orçamento pode ter vários itens e condições de pagamento
- Um item de orçamento pertence a um orçamento e referencia um produto
- Uma condição de pagamento pertence a um orçamento

## Gerenciamento de Estado

- **useAuth**: Gerencia o estado de autenticação
- **useOrcamentoStore**: Gerencia o estado dos orçamentos
- **useClienteStore**: Gerencia o estado dos clientes

## Validação de Dados

- Esquemas Zod para validação de formulários
- Validação no cliente antes de enviar para o servidor
- Validação no servidor através de políticas RLS do Supabase

## Tratamento de Erros

- Tratamento centralizado de erros
- Conversão de erros do Supabase para erros da aplicação
- Exibição de mensagens de erro usando toast

## Convenções de Código

- **Nomenclatura**: camelCase para variáveis e funções, PascalCase para componentes e tipos
- **Tipagem**: Uso de TypeScript para tipagem estática
- **Componentes**: Componentes funcionais com hooks
- **Estilização**: TailwindCSS para estilização
- **Importações**: Importações absolutas usando aliases (@/)

## Boas Práticas

- Separação de responsabilidades
- Componentes pequenos e focados
- Reutilização de código
- Tratamento adequado de erros
- Validação de dados
- Documentação de código