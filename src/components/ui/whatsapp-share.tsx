import React, { useState } from 'react';
import { Share2, MessageCircle, Copy, Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { compartilharViaWhatsApp } from '@/services/pdfService';
import { sendEmail } from '@/services/notificationService';

interface WhatsAppShareProps {
  cliente: {
    nome: string;
    telefone: string;
    email?: string;
  };
  orcamento: {
    id: string;
    numero: string;
    valor_total: number;
  };
  pdfUrl?: string;
  children?: React.ReactNode;
}

export const WhatsAppShare: React.FC<WhatsAppShareProps> = ({
  cliente,
  orcamento,
  pdfUrl,
  children
}) => {
  const [open, setOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState(
    `Olá ${cliente.nome}, segue o orçamento #${orcamento.numero} da RepSUN.`
  );
  const [emailSubject, setEmailSubject] = useState(`Orçamento #${orcamento.numero} - RepSUN`);
  const [emailMessage, setEmailMessage] = useState(
    `Prezado(a) ${cliente.nome},\n\nSegue anexo o orçamento solicitado.\n\nAtenciosamente,\nEquipe RepSUN`
  );
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const handleWhatsAppShare = () => {
    if (!pdfUrl) {
      toast({
        title: 'Erro',
        description: 'PDF não disponível. Gere o PDF primeiro.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const whatsappUrl = compartilharViaWhatsApp(
        cliente.telefone,
        customMessage,
        pdfUrl
      );
      
      window.open(whatsappUrl, '_blank');
      setOpen(false);
      
      toast({
        title: 'Sucesso',
        description: 'Redirecionado para WhatsApp'
      });
    } catch (error) {
      console.error('Erro ao compartilhar via WhatsApp:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível abrir o WhatsApp',
        variant: 'destructive'
      });
    }
  };

  const handleEmailSend = async () => {
    if (!cliente.email) {
      toast({
        title: 'Erro',
        description: 'Cliente não possui e-mail cadastrado',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSending(true);
      
      await sendEmail(cliente.email, 'custom', {
        subject: emailSubject,
        customContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2563eb, #06b6d4); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">RepSUN</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema de Orçamentos</p>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
              <div style="white-space: pre-line; color: #475569; line-height: 1.6;">
                ${emailMessage}
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                <h3 style="color: #1e293b; margin-top: 0;">Detalhes do Orçamento</h3>
                <p><strong>Número:</strong> #${orcamento.numero}</p>
                <p><strong>Valor Total:</strong> ${formatCurrency(orcamento.valor_total)}</p>
              </div>
              
              ${pdfUrl ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${pdfUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    📄 Visualizar Orçamento
                  </a>
                </div>
              ` : ''}
            </div>
          </div>
        `
      });
      
      setOpen(false);
      toast({
        title: 'Sucesso',
        description: 'E-mail enviado com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o e-mail',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = () => {
    if (!pdfUrl) {
      toast({
        title: 'Erro',
        description: 'PDF não disponível',
        variant: 'destructive'
      });
      return;
    }

    navigator.clipboard.writeText(pdfUrl).then(() => {
      setCopied(true);
      toast({
        title: 'Sucesso',
        description: 'Link copiado para a área de transferência'
      });
      
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar o link',
        variant: 'destructive'
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar Orçamento</DialogTitle>
          <DialogDescription>
            Escolha como deseja compartilhar o orçamento #{orcamento.numero} com {cliente.nome}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="whatsapp" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="whatsapp" className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1" disabled={!cliente.email}>
              <Mail className="h-3 w-3" />
              E-mail
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-1">
              <Copy className="h-3 w-3" />
              Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="whatsapp" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-message">Mensagem</Label>
              <Textarea
                id="whatsapp-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Digite a mensagem personalizada..."
                rows={4}
              />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span>Telefone: {cliente.telefone}</span>
            </div>
            
            <Button 
              onClick={handleWhatsAppShare} 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!pdfUrl}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Abrir WhatsApp
            </Button>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-subject">Assunto</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Assunto do e-mail..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-message">Mensagem</Label>
              <Textarea
                id="email-message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Digite a mensagem do e-mail..."
                rows={4}
              />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-blue-600" />
              <span>E-mail: {cliente.email || 'Não informado'}</span>
            </div>
            
            <Button 
              onClick={handleEmailSend} 
              className="w-full"
              disabled={!cliente.email || sending}
            >
              {sending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar E-mail
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <Label>Link do Orçamento</Label>
              <div className="flex gap-2">
                <Input
                  value={pdfUrl || 'PDF não disponível'}
                  readOnly
                  className="text-sm"
                />
                <Button 
                  variant="outline" 
                  onClick={handleCopyLink}
                  disabled={!pdfUrl}
                  className="min-w-[80px]"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Copie este link para compartilhar o orçamento em qualquer plataforma.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};