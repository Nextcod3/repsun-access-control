import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// URL do Supabase (mesma do cliente normal)
const SUPABASE_URL = "https://broetwrkuceepnqocpiw.supabase.co";

// Chave de serviço (deve ser configurada como variável de ambiente em produção)
// ATENÇÃO: Esta chave tem permissões de administrador e não deve ser exposta no frontend
// Esta é uma solução temporária para desenvolvimento
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyb2V0d3JrdWNlZXBucW9jcGl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjc2MDYxNSwiZXhwIjoyMDY4MzM2NjE1fQ.example_key_replace_with_real_key";

// Cliente Supabase com chave de serviço para operações administrativas
export const adminSupabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false, // Não persistir sessão para este cliente
    }
  }
);