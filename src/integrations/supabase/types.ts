export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          cep: string | null
          cidade: string | null
          created_at: string | null
          documento: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string
          uf: string
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          created_at?: string | null
          documento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone: string
          uf: string
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          created_at?: string | null
          documento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string
          uf?: string
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      condicoes_pagamento: {
        Row: {
          created_at: string | null
          descricao: string
          id: string
          metodo: Database["public"]["Enums"]["metodo_pagamento"] | null
          num_parcelas: number | null
          orcamento_id: string
          taxa_juros: number | null
          updated_at: string | null
          valor_entrada: number | null
          valor_parcela: number | null
          valor_total: number
        }
        Insert: {
          created_at?: string | null
          descricao: string
          id?: string
          metodo?: Database["public"]["Enums"]["metodo_pagamento"] | null
          num_parcelas?: number | null
          orcamento_id: string
          taxa_juros?: number | null
          updated_at?: string | null
          valor_entrada?: number | null
          valor_parcela?: number | null
          valor_total: number
        }
        Update: {
          created_at?: string | null
          descricao?: string
          id?: string
          metodo?: Database["public"]["Enums"]["metodo_pagamento"] | null
          num_parcelas?: number | null
          orcamento_id?: string
          taxa_juros?: number | null
          updated_at?: string | null
          valor_entrada?: number | null
          valor_parcela?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "condicoes_pagamento_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_orcamento: {
        Row: {
          created_at: string | null
          id: string
          orcamento_id: string
          produto_id: string
          quantidade: number
          subtotal: number
          updated_at: string | null
          valor_unitario: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          orcamento_id: string
          produto_id: string
          quantidade?: number
          subtotal: number
          updated_at?: string | null
          valor_unitario: number
        }
        Update: {
          created_at?: string | null
          id?: string
          orcamento_id?: string
          produto_id?: string
          quantidade?: number
          subtotal?: number
          updated_at?: string | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_orcamento_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_orcamento_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      opcoes_pagamento: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string
          dias_entre_parcelas: number | null
          entrada_percentual: number | null
          id: string
          num_parcelas: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao: string
          dias_entre_parcelas?: number | null
          entrada_percentual?: number | null
          id?: string
          num_parcelas?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string
          dias_entre_parcelas?: number | null
          entrada_percentual?: number | null
          id?: string
          num_parcelas?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      orcamentos: {
        Row: {
          cliente_id: string
          created_at: string | null
          data_aprovacao: string | null
          data_criacao: string | null
          data_envio: string | null
          id: string
          numero: number
          observacoes: string | null
          status: Database["public"]["Enums"]["orcamento_status"] | null
          updated_at: string | null
          usuario_id: string
          valor_total: number | null
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          data_aprovacao?: string | null
          data_criacao?: string | null
          data_envio?: string | null
          id?: string
          numero?: number
          observacoes?: string | null
          status?: Database["public"]["Enums"]["orcamento_status"] | null
          updated_at?: string | null
          usuario_id: string
          valor_total?: number | null
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          data_aprovacao?: string | null
          data_criacao?: string | null
          data_envio?: string | null
          id?: string
          numero?: number
          observacoes?: string | null
          status?: Database["public"]["Enums"]["orcamento_status"] | null
          updated_at?: string | null
          usuario_id?: string
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos_pdf: {
        Row: {
          created_at: string | null
          id: string
          orcamento_id: string
          url: string
          versao: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          orcamento_id: string
          url: string
          versao?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          orcamento_id?: string
          url?: string
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_pdf_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          imagem_url: string | null
          nome: string
          preco_outros: number | null
          preco_sp: number | null
          preco_sul_sudeste: number | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome: string
          preco_outros?: number | null
          preco_sp?: number | null
          preco_sul_sudeste?: number | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome?: string
          preco_outros?: number | null
          preco_sp?: number | null
          preco_sul_sudeste?: number | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nome: string
          perfil: Database["public"]["Enums"]["user_profile"]
          senha_hash: string
          status: boolean
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          nome: string
          perfil?: Database["public"]["Enums"]["user_profile"]
          senha_hash: string
          status?: boolean
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          perfil?: Database["public"]["Enums"]["user_profile"]
          senha_hash?: string
          status?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_produto_preco: {
        Args: { produto_id: string; uf: string }
        Returns: number
      }
    }
    Enums: {
      metodo_pagamento: "cartao" | "boleto" | "pix"
      orcamento_status:
        | "rascunho"
        | "enviado"
        | "aprovado"
        | "rejeitado"
        | "cancelado"
      user_profile: "admin" | "usuario"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      metodo_pagamento: ["cartao", "boleto", "pix"],
      orcamento_status: [
        "rascunho",
        "enviado",
        "aprovado",
        "rejeitado",
        "cancelado",
      ],
      user_profile: ["admin", "usuario"],
    },
  },
} as const
