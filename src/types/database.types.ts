export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          nome: string
          email: string
          senha_hash: string
          perfil: "admin" | "usuario"
          status: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          nome: string
          email: string
          senha_hash: string
          perfil?: "admin" | "usuario"
          status?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          senha_hash?: string
          perfil?: "admin" | "usuario"
          status?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          id: string
          nome: string
          telefone: string
          email: string | null
          endereco: string | null
          usuario_id: string
          created_at: string | null
          updated_at: string | null
          documento: string | null
          uf: string | null
        }
        Insert: {
          id?: string
          nome: string
          telefone: string
          email?: string | null
          endereco?: string | null
          usuario_id: string
          created_at?: string | null
          updated_at?: string | null
          documento?: string | null
          uf?: string | null
        }
        Update: {
          id?: string
          nome?: string
          telefone?: string
          email?: string | null
          endereco?: string | null
          usuario_id?: string
          created_at?: string | null
          updated_at?: string | null
          documento?: string | null
          uf?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_usuario_id_fkey"
            columns: ["usuario_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      produtos: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          imagem_url: string | null
          usuario_id: string
          created_at: string | null
          updated_at: string | null
          preco_sp: number | null
          preco_sul_sudeste: number | null
          preco_outros: number | null
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          imagem_url?: string | null
          usuario_id: string
          created_at?: string | null
          updated_at?: string | null
          preco_sp?: number | null
          preco_sul_sudeste?: number | null
          preco_outros?: number | null
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          imagem_url?: string | null
          usuario_id?: string
          created_at?: string | null
          updated_at?: string | null
          preco_sp?: number | null
          preco_sul_sudeste?: number | null
          preco_outros?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_usuario_id_fkey"
            columns: ["usuario_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      orcamentos: {
        Row: {
          id: string
          numero: number
          cliente_id: string
          usuario_id: string
          data_criacao: string | null
          data_envio: string | null
          data_aprovacao: string | null
          status: "rascunho" | "enviado" | "aprovado" | "rejeitado" | "cancelado" | null
          valor_total: number | null
          observacoes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          numero?: number
          cliente_id: string
          usuario_id: string
          data_criacao?: string | null
          data_envio?: string | null
          data_aprovacao?: string | null
          status?: "rascunho" | "enviado" | "aprovado" | "rejeitado" | "cancelado" | null
          valor_total?: number | null
          observacoes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          numero?: number
          cliente_id?: string
          usuario_id?: string
          data_criacao?: string | null
          data_envio?: string | null
          data_aprovacao?: string | null
          status?: "rascunho" | "enviado" | "aprovado" | "rejeitado" | "cancelado" | null
          valor_total?: number | null
          observacoes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_usuario_id_fkey"
            columns: ["usuario_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      itens_orcamento: {
        Row: {
          id: string
          orcamento_id: string
          produto_id: string
          quantidade: number
          valor_unitario: number
          subtotal: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          orcamento_id: string
          produto_id: string
          quantidade?: number
          valor_unitario: number
          subtotal: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          orcamento_id?: string
          produto_id?: string
          quantidade?: number
          valor_unitario?: number
          subtotal?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_orcamento_orcamento_id_fkey"
            columns: ["orcamento_id"]
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_orcamento_produto_id_fkey"
            columns: ["produto_id"]
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          }
        ]
      }
      condicoes_pagamento: {
        Row: {
          id: string
          orcamento_id: string
          descricao: string
          valor_entrada: number | null
          num_parcelas: number | null
          taxa_juros: number | null
          valor_parcela: number | null
          valor_total: number
          metodo: "cartao" | "boleto" | "pix" | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          orcamento_id: string
          descricao: string
          valor_entrada?: number | null
          num_parcelas?: number | null
          taxa_juros?: number | null
          valor_parcela?: number | null
          valor_total: number
          metodo?: "cartao" | "boleto" | "pix" | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          orcamento_id?: string
          descricao?: string
          valor_entrada?: number | null
          num_parcelas?: number | null
          taxa_juros?: number | null
          valor_parcela?: number | null
          valor_total?: number
          metodo?: "cartao" | "boleto" | "pix" | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "condicoes_pagamento_orcamento_id_fkey"
            columns: ["orcamento_id"]
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          }
        ]
      }
      opcoes_pagamento: {
        Row: {
          id: string
          descricao: string
          entrada_percentual: number | null
          num_parcelas: number | null
          dias_entre_parcelas: number | null
          ativo: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          descricao: string
          entrada_percentual?: number | null
          num_parcelas?: number | null
          dias_entre_parcelas?: number | null
          ativo?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          descricao?: string
          entrada_percentual?: number | null
          num_parcelas?: number | null
          dias_entre_parcelas?: number | null
          ativo?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      orcamentos_pdf: {
        Row: {
          id: string
          orcamento_id: string
          url: string
          versao: number
          created_at: string | null
        }
        Insert: {
          id?: string
          orcamento_id: string
          url: string
          versao?: number
          created_at?: string | null
        }
        Update: {
          id?: string
          orcamento_id?: string
          url?: string
          versao?: number
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_pdf_orcamento_id_fkey"
            columns: ["orcamento_id"]
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_produto_preco: {
        Args: {
          produto_id: string
          uf: string
        }
        Returns: number
      }
    }
    Enums: {
      user_profile: "admin" | "usuario"
      orcamento_status: "rascunho" | "enviado" | "aprovado" | "rejeitado" | "cancelado"
      metodo_pagamento: "cartao" | "boleto" | "pix"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]