const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Configurações do Supabase
const SUPABASE_URL = "https://broetwrkuceepnqocpiw.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Deve ser definido como variável de ambiente

if (!SUPABASE_SERVICE_KEY) {
  console.error('Erro: SUPABASE_SERVICE_KEY não definida');
  process.exit(1);
}

// Criar cliente Supabase com chave de serviço
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function addAdminUser() {
  try {
    // Verificar se o usuário já existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@repsun.com')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar usuário existente:', checkError);
      return;
    }

    if (existingUser) {
      console.log('Usuário administrador já existe');
      return;
    }

    // Gerar hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash('admin123', salt);

    // Inserir usuário administrador
    const { data, error } = await supabase
      .from('users')
      .insert({
        nome: 'Administrador',
        email: 'admin@repsun.com',
        senha_hash: senhaHash,
        perfil: 'admin',
        status: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar usuário administrador:', error);
      return;
    }

    console.log('Usuário administrador criado com sucesso:', data);
  } catch (error) {
    console.error('Erro ao executar script:', error);
  }
}

// Executar função
addAdminUser();