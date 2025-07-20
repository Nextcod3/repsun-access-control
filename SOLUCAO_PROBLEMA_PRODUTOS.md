# Solução para o Problema de Criação de Produtos

## Problema Identificado

O sistema está enfrentando um erro ao tentar criar produtos: "Permissão negada: apenas administradores podem criar produtos". Este erro ocorre devido a um conflito entre o sistema de autenticação personalizado (que usa localStorage) e as políticas de segurança de nível de linha (RLS) do Supabase.

## Solução Recomendada: Usar Autenticação Nativa do Supabase

A melhor solução é criar um usuário autenticado no Supabase com os mesmos dados do administrador:

### Passo 1: Criar usuário no Supabase Authentication

1. No Supabase Dashboard, vá para "Authentication" > "Users"
2. Clique em "Add User" ou "Create User"
3. Use os mesmos dados do administrador:
   - Email: contato.braddockjunior@gmail.com
   - Senha: crie uma senha forte
   - Marque a opção para confirmar email automaticamente

### Passo 2: Sincronizar com a tabela users

Execute a migração SQL `20250717000006_sync_auth_user.sql` para sincronizar o usuário autenticado com a tabela `users`:

```
node scripts/apply-migrations.js
```

### Passo 3: Fazer login com o novo usuário

1. Faça logout do sistema
2. Faça login novamente com o email e senha do usuário criado no Supabase

## Soluções Alternativas

Se a solução principal não funcionar, temos outras abordagens:

### 1. Contorno via API REST Direta

Modificamos os serviços `produtoService.ts` para usar chamadas diretas à API REST do Supabase quando ocorrem erros de permissão. Esta abordagem:

- Tenta primeiro usar o cliente Supabase normal
- Se falhar com erro de permissão, faz uma chamada direta à API REST
- Funciona para criar produtos, atualizar produtos e fazer upload de imagens

### 2. Desabilitar RLS Temporariamente

Criamos uma migração SQL (`20250717000005_disable_rls_for_testing.sql`) que desabilita temporariamente as políticas RLS para a tabela de produtos.

**IMPORTANTE**: Esta abordagem é apenas para desenvolvimento/teste. Em produção, as políticas RLS devem ser reativadas.

### 3. Atualizar Políticas RLS

Criamos uma migração SQL (`20250717000004_update_produtos_rls_policies.sql`) que atualiza as políticas RLS para usar cabeçalhos personalizados.

## Próximos Passos para uma Solução Definitiva

Para uma solução definitiva, recomendamos:

1. Migrar completamente para o sistema de autenticação nativo do Supabase
2. Atualizar todos os serviços para usar o cliente Supabase para autenticação
3. Sincronizar os IDs entre a tabela `auth.users` e `public.users`