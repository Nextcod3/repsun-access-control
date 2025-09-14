import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  type: 'orcamento_enviado' | 'orcamento_aprovado' | 'orcamento_rejeitado' | 'custom';
  data?: {
    clienteNome?: string;
    orcamentoNumero?: string;
    valorTotal?: string;
    pdfUrl?: string;
    customContent?: string;
  };
}

const getEmailTemplate = (type: string, data: any) => {
  switch (type) {
    case 'orcamento_enviado':
      return {
        subject: `Orçamento #${data.orcamentoNumero} - RepSUN`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2563eb, #06b6d4); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">RepSUN</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema de Orçamentos</p>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1e293b; margin-top: 0;">Olá ${data.clienteNome}!</h2>
              
              <p style="color: #475569; line-height: 1.6;">
                Temos o prazer de enviar o orçamento <strong>#${data.orcamentoNumero}</strong> conforme solicitado.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                <h3 style="color: #1e293b; margin-top: 0;">Detalhes do Orçamento</h3>
                <p><strong>Número:</strong> #${data.orcamentoNumero}</p>
                <p><strong>Valor Total:</strong> ${data.valorTotal}</p>
                <p><strong>Status:</strong> Enviado</p>
              </div>
              
              ${data.pdfUrl ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${data.pdfUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    📄 Visualizar Orçamento
                  </a>
                </div>
              ` : ''}
              
              <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                Em caso de dúvidas, entre em contato conosco. Agradecemos pela confiança!
              </p>
              
              <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  Este e-mail foi enviado automaticamente pelo sistema RepSUN
                </p>
              </div>
            </div>
          </div>
        `
      };
      
    case 'orcamento_aprovado':
      return {
        subject: `✅ Orçamento #${data.orcamentoNumero} Aprovado - RepSUN`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">🎉 Orçamento Aprovado!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">RepSUN - Sistema de Orçamentos</p>
            </div>
            
            <div style="background: #f0fdf4; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #166534; margin-top: 0;">Parabéns ${data.clienteNome}!</h2>
              
              <p style="color: #15803d; line-height: 1.6;">
                Seu orçamento <strong>#${data.orcamentoNumero}</strong> foi aprovado com sucesso!
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
                <h3 style="color: #166534; margin-top: 0;">Próximos Passos</h3>
                <ul style="color: #15803d;">
                  <li>Nossa equipe entrará em contato para finalizar os detalhes</li>
                  <li>O prazo de entrega será confirmado em breve</li>
                  <li>Você receberá todas as informações de pagamento</li>
                </ul>
              </div>
              
              <p style="color: #15803d; line-height: 1.6; font-weight: 600;">
                Valor aprovado: ${data.valorTotal}
              </p>
              
              <p style="color: #4ade80; font-size: 14px; margin-top: 30px;">
                Obrigado por escolher a RepSUN! Estamos ansiosos para atendê-lo.
              </p>
            </div>
          </div>
        `
      };
      
    case 'orcamento_rejeitado':
      return {
        subject: `Orçamento #${data.orcamentoNumero} - RepSUN`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">RepSUN</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema de Orçamentos</p>
            </div>
            
            <div style="background: #fef2f2; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #991b1b; margin-top: 0;">Olá ${data.clienteNome},</h2>
              
              <p style="color: #dc2626; line-height: 1.6;">
                Recebemos o retorno sobre o orçamento <strong>#${data.orcamentoNumero}</strong>.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h3 style="color: #991b1b; margin-top: 0;">Não desista!</h3>
                <p style="color: #dc2626;">
                  Entendemos que desta vez não foi possível prosseguir, mas estamos sempre aqui para ajudar.
                  Nossa equipe pode trabalhar em uma nova proposta que atenda melhor às suas necessidades.
                </p>
              </div>
              
              <p style="color: #7f1d1d; font-size: 14px; margin-top: 30px;">
                Entre em contato conosco para discutir novas possibilidades. Valorizamos muito seu interesse!
              </p>
            </div>
          </div>
        `
      };
      
    case 'custom':
      return {
        subject: data.subject || 'Mensagem da RepSUN',
        html: data.customContent || '<p>Mensagem personalizada</p>'
      };
      
    default:
      return {
        subject: 'Mensagem da RepSUN',
        html: '<p>Conteúdo do e-mail</p>'
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, type, data }: EmailRequest = await req.json();

    if (!to || !type) {
      return new Response(
        JSON.stringify({ error: "Email e tipo são obrigatórios" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const template = getEmailTemplate(type, data || {});

    const emailResponse = await resend.emails.send({
      from: "RepSUN <noreply@resend.dev>",
      to: [to],
      subject: template.subject,
      html: template.html,
    });

    console.log("Email enviado com sucesso:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);