import { useQuery } from '@tanstack/react-query';
import { useUnifiedAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function Applications() {
  const { user } = useUnifiedAuth();
  
  const { data: applications, isLoading } = useQuery({
    queryKey: ['/api/applications/my'],
    enabled: !!user && user.type === 'freelancer',
  });

  if (!user || user.type !== 'freelancer') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
            <p className="text-gray-600">Apenas freelancers podem ver suas candidaturas.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Aceita</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitada</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Candidaturas</h1>
        <p className="text-gray-600">Acompanhe o status das suas candidaturas</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : applications && applications.length > 0 ? (
        <div className="space-y-6">
          {applications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(application.status)}
                      <h3 className="text-xl font-semibold text-gray-900">
                        {application.job.title}
                      </h3>
                      {application.job.destaque && (
                        <Badge className="bg-accent/10 text-accent">DESTAQUE</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">
                      {application.job.subcategory.category.name} → {application.job.subcategory.name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getStatusBadge(application.status)}
                    <span className="text-sm text-gray-500">
                      Candidatura enviada em {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">{application.job.date}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">{application.job.time}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{application.job.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span className="text-sm font-semibold text-secondary">
                      R$ {application.job.payment}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      Contratante: {application.job.client.name}
                    </span>
                  </div>
                  <Link href={`/vaga/${application.job.id}`}>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>

                {application.status === 'accepted' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-green-800">
                        Parabéns! Sua candidatura foi aceita.
                      </span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Entre em contato com o contratante para combinar os detalhes.
                    </p>
                  </div>
                )}

                {application.status === 'rejected' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-sm font-medium text-red-800">
                        Sua candidatura não foi selecionada.
                      </span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      Não desanime! Continue explorando novas oportunidades.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma candidatura encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              Você ainda não se candidatou a nenhuma vaga. Explore as oportunidades disponíveis!
            </p>
            <Link href="/jobs">
              <Button>
                <Briefcase className="w-4 h-4 mr-2" />
                Explorar Vagas
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
