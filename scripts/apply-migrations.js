const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Importar configurações do ambiente
const SUPABASE_URL = "https://broetwrkuceepnqocpiw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyb2V0d3JrdWNlZXBucW9jcGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NjA2MTUsImV4cCI6MjA2ODMzNjYxNX0.jwgrsp3OizQLkWRVxicO2PSv8r5-RFmhJlKFJb5jBMM";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Deve ser definido como variável de ambiente

// Verificar se temos uma chave de serviço
if (!SUPABASE_SERVICE_KEY) {
  console.warn('Aviso: SUPABASE_SERVICE_KEY não definida. Usando chave anônima com permissões limitadas.');
}

// Criar cliente Supabase com a melhor chave disponível
const supabase = createClient(
  SUPABASE_URL, 
  SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY
);

// Diretório de migrações
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

// Tabela para controle de migrações aplicadas
const MIGRATIONS_TABLE = 'migrations_applied';

// Função para criar tabela de controle de migrações se não existir
async function ensureMigrationsTable() {
  try {
    const { error } = await supabase.rpc('pgmigrate', { 
      query: `
        CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (error) {
      console.warn('Não foi possível criar tabela de controle de migrações:', error);
    }
  } catch (error) {
    console.warn('Erro ao verificar tabela de migrações:', error);
  }
}

// Função para verificar se uma migração já foi aplicada
async function isMigrationApplied(migrationName) {
  try {
    const { data, error } = await supabase
      .from(MIGRATIONS_TABLE)
      .select('id')
      .eq('name', migrationName)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.warn(`Erro ao verificar migração ${migrationName}:`, error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.warn(`Erro ao verificar migração ${migrationName}:`, error);
    return false;
  }
}

// Função para registrar uma migração aplicada
async function recordMigrationApplied(migrationName) {
  try {
    const { error } = await supabase
      .from(MIGRATIONS_TABLE)
      .insert({ name: migrationName });
    
    if (error) {
      console.warn(`Não foi possível registrar migração ${migrationName}:`, error);
    }
  } catch (error) {
    console.warn(`Erro ao registrar migração ${migrationName}:`, error);
  }
}

// Função para aplicar uma migração
async function applyMigration(filePath) {
  try {
    const migrationName = path.basename(filePath);
    
    // Verificar se a migração já foi aplicada
    const alreadyApplied = await isMigrationApplied(migrationName);
    if (alreadyApplied) {
      console.log(`Migração ${migrationName} já foi aplicada anteriormente.`);
      return true;
    }
    
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Aplicando migração: ${migrationName}`);
    
    // Tentar aplicar via RPC
    try {
      const { error } = await supabase.rpc('pgmigrate', { query: sql });
      
      if (error) {
        console.error(`Erro ao aplicar migração ${migrationName} via RPC:`, error);
        throw error;
      }
    } catch (rpcError) {
      // Se falhar, tentar via API REST
      console.log(`Tentando aplicar migração ${migrationName} via API REST...`);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/pgmigrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ query: sql })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Erro ao aplicar migração ${migrationName} via API REST:`, errorData);
        return false;
      }
    }
    
    // Registrar migração como aplicada
    await recordMigrationApplied(migrationName);
    
    console.log(`Migração ${migrationName} aplicada com sucesso`);
    return true;
  } catch (error) {
    console.error(`Erro ao processar migração ${path.basename(filePath)}:`, error);
    return false;
  }
}

// Função principal
async function main() {
  try {
    // Garantir que a tabela de controle de migrações existe
    await ensureMigrationsTable();
    
    // Listar arquivos de migração
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ordenar por nome (importante para a ordem das migrações)
    
    console.log(`Encontradas ${files.length} migrações para verificar`);
    
    // Aplicar migrações em ordem
    let appliedCount = 0;
    let skippedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      
      // Verificar se já foi aplicada
      const alreadyApplied = await isMigrationApplied(file);
      if (alreadyApplied) {
        console.log(`Migração ${file} já foi aplicada anteriormente.`);
        skippedCount++;
        continue;
      }
      
      const success = await applyMigration(filePath);
      
      if (!success) {
        console.error(`Falha ao aplicar migração ${file}. Interrompendo.`);
        process.exit(1);
      }
      
      appliedCount++;
    }
    
    console.log(`Processo concluído: ${appliedCount} migrações aplicadas, ${skippedCount} ignoradas.`);
  } catch (error) {
    console.error('Erro ao aplicar migrações:', error);
    process.exit(1);
  }
}

// Executar função principal
main();