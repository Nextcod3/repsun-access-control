import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card'
import { Calculator, Users, FileText, TrendingUp } from 'lucide-react'

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="glass-nav border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-urbanist font-bold">RepSUN</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-urbanist font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-fade-in">
              RepSUN
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-slide-up">
              Sistema Moderno de Geração de Orçamentos para Representantes Comerciais
            </p>
          </div>
          
          <div className="space-y-4 animate-slide-up">
            <Link to="/auth">
              <Button variant="gradient" size="lg" className="text-lg px-8 py-3">
                Entrar no Sistema
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              Transforme sua gestão comercial com tecnologia de ponta
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernCard variant="glass" className="animate-float" style={{ animationDelay: '0s' }}>
            <ModernCardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <ModernCardTitle className="text-lg">Orçamentos Inteligentes</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <ModernCardDescription>
                Crie orçamentos profissionais com cálculos automáticos e modelos personalizáveis.
              </ModernCardDescription>
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="glass" className="animate-float" style={{ animationDelay: '0.2s' }}>
            <ModernCardHeader>
              <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <ModernCardTitle className="text-lg">Gestão de Clientes</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <ModernCardDescription>
                Mantenha um cadastro completo de clientes com histórico de negociações.
              </ModernCardDescription>
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="glass" className="animate-float" style={{ animationDelay: '0.4s' }}>
            <ModernCardHeader>
              <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <ModernCardTitle className="text-lg">Relatórios Avançados</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <ModernCardDescription>
                Gere relatórios detalhados e exports em PDF com design profissional.
              </ModernCardDescription>
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="glass" className="animate-float" style={{ animationDelay: '0.6s' }}>
            <ModernCardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <ModernCardTitle className="text-lg">Analytics</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <ModernCardDescription>
                Acompanhe métricas de vendas e performance com dashboards interativos.
              </ModernCardDescription>
            </ModernCardContent>
          </ModernCard>
        </div>
      </main>
    </div>
  )
}