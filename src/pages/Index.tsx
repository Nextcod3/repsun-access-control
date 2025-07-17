
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, FileText, Users, TrendingUp } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  // Redirecionar usuários logados para suas respectivas páginas
  if (user) {
    if (user.perfil === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">RepSUN</h1>
            </div>
            <div>
              <Link to="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Sistema de Orçamentos
            <span className="block text-blue-600">para Representantes</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Simplifique a criação de orçamentos, gerencie propostas comerciais e 
            acompanhe suas vendas de forma eficiente e profissional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700">
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Orçamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Crie orçamentos profissionais de forma rápida e organizada
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calculator className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Calculadora</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Calcule comissões, descontos e valores automaticamente
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Gestão</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Gerencie clientes, produtos e histórico de propostas
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Acompanhe suas vendas e performance com relatórios detalhados
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Pronto para começar?
          </h3>
          <p className="text-gray-600 mb-6">
            Cadastre-se agora e transforme a forma como você cria orçamentos
          </p>
          <Link to="/auth">
            <Button size="lg" className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700">
              Criar Conta Gratuita
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Index;
