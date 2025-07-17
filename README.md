# RepSUN - Sistema de Orçamentos para Representante Comercial

RepSUN é um sistema web para geração de orçamentos de produtos para oficinas mecânicas. O sistema permite cadastro de produtos (com imagem, descrição e preço), montagem de orçamentos, simulação de condições de pagamento, geração de PDF e envio fácil pelo WhatsApp.

## Funcionalidades

- **Autenticação de Usuários**: Login, registro e recuperação de senha
- **Gerenciamento de Clientes**: Cadastro, edição e exclusão de clientes
- **Gerenciamento de Produtos**: Cadastro de produtos com preços diferenciados por região
- **Criação de Orçamentos**: Interface intuitiva para montagem de orçamentos
- **Condições de Pagamento**: Simulação de diferentes condições de pagamento
- **Geração de PDF**: Criação de orçamentos em PDF para compartilhamento
- **Compartilhamento**: Envio de orçamentos via WhatsApp

## Tecnologias Utilizadas

- **Frontend**: React, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Gerenciamento de Estado**: Zustand, React Query
- **Validação de Formulários**: Zod, React Hook Form
- **Roteamento**: React Router
- **Estilização**: TailwindCSS, shadcn/ui

## Pré-requisitos

- Node.js (v18 ou superior)
- npm (v9 ou superior)
- Conta no Supabase

## Instalação

1. Clone o repositório:
```sh
git clone <URL_DO_REPOSITORIO>
cd repsun
```

2. Instale as dependências:
```sh
npm install
```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione as seguintes variáveis:
```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Inicie o servidor de desenvolvimento:
```sh
npm run dev
```

## Estrutura do Projeto

```
src/
├── components/       # Componentes React reutilizáveis
│   ├── layout/       # Componentes de layout
│   └── ui/           # Componentes de UI (shadcn/ui)
├── config/           # Configurações da aplicação
├── hooks/            # Hooks personalizados
├── integrations/     # Integrações com serviços externos
│   └── supabase/     # Cliente e tipos do Supabase
├── pages/            # Páginas da aplicação
├── routes/           # Configuração de rotas
├── schemas/          # Esquemas de validação (Zod)
├── services/         # Serviços para comunicação com o backend
│   ├── orcamento/    # Serviços relacionados a orçamentos
│   └── ...
├── store/            # Gerenciamento de estado global (Zustand)
├── types/            # Tipos TypeScript
└── utils/            # Utilitários
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila o projeto para produção
- `npm run preview` - Visualiza a versão de produção localmente
- `npm run lint` - Executa o linter
- `npm run test` - Executa os testes
- `npm run test:watch` - Executa os testes em modo de observação
- `npm run test:coverage` - Executa os testes com cobertura

## Documentação Adicional

Para mais detalhes sobre a arquitetura do projeto, consulte o arquivo [ARCHITECTURE.md](./ARCHITECTURE.md).

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.
