import { useQuery, useMutation } from '@tanstack/react-query';
import { useUnifiedAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { LocationDisplay } from '@/components/LocationDisplay';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Briefcase, 
  User, 
  CheckCircle,
  XCircle
} from 'lucide-react';

interface JobDetailsProps {
  params: { id: string };
}

export default function JobDetails({ params }: JobDetailsProps) {
  const { user } = useUnifiedAuth();
  const { toast } = useToast();
  
  const { data: job, isLoading } = useQuery({
    queryKey: ['/api/jobs', params.id],
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/applications/job', params.id],
    enabled: !!user && user.type === 'contratante',
  });

  const applyMutation = useMutation({
    mutationFn: (jobId: string) => 
      apiRequest('POST', '/api/applications', { jobId }),
    onSuccess: () => {
      toast({
        title: "Candidatura enviada!",
        description: "Sua candidatura foi enviada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na candidatura",
        description: error.message || "Não foi possível enviar sua candidatura.",
        variant: "destructive",
      });
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: string }) =>
      apiRequest('PATCH', `/api/applications/${applicationId}/status`, { status }),
    onSuccess: () => {
      toast({
        title: "Status atualizado!",
        description: "O status da candidatura foi atualizado.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Vaga não encontrada</h1>
            <p className="text-gray-600">A vaga que você procura não existe ou foi removida.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleApply = () => {
    if (user?.type === 'freelancer') {
      applyMutation.mutate(params.id);
    }
  };

  const handleUpdateApplication = (applicationId: string, status: string) => {
    updateApplicationMutation.mutate({ applicationId, status });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                {job.destaque && (
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg px-3 py-1">
                    ✨ DESTAQUE
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center text-gray-600 mb-4">
                <Briefcase className="w-5 h-5 mr-2" />
                <span className="text-lg font-medium">{job.subcategory.category.name} → {job.subcategory.name}</span>
              </div>
              
              <div className="text-sm text-gray-500 mb-6">
                Publicado em {new Date(job.createdAt).toLocaleDateString('pt-BR')} por {job.client.name}
              </div>
              
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h3>
                <p className="text-gray-700 leading-relaxed">{job.description}</p>
              </div>
            </div>
            
            <div className="lg:w-80">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    R$ {parseFloat(job.payment).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                  <div className="text-sm text-green-700">Valor do serviço</div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-3 text-green-600" />
                    <span className="font-medium">{job.date}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-3 text-green-600" />
                    <span className="font-medium">{job.time}</span>
                  </div>
                  <div className="flex items-start text-gray-700">
                    <MapPin className="w-4 h-4 mr-3 text-green-600 mt-0.5" />
                    <LocationDisplay 
                      location={job.location} 
                      className="text-gray-700 font-medium" 
                      showIcon={false}
                      showMapLink={true}
                    />
                  </div>
                </div>
                
                {user?.type === 'freelancer' && (
                  <Button 
                    onClick={handleApply}
                    disabled={applyMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-semibold"
                  >
                    {applyMutation.isPending ? 'Enviando...' : 'Candidatar-se à Vaga'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Client Info */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg text-gray-900">Sobre o Contratante</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-purple-100 text-purple-600 font-bold text-xl">
                      {job.client.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg text-gray-900">{job.client.name}</p>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.client.city}
                    </p>
                  </div>
                </div>
                {job.client.premium && (
                  <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200">
                    👑 Premium
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Applications (for contractors) */}
          {user?.type === 'contratante' && user.id === job.clientId && (
            <div className="lg:col-span-2">
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-lg text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Candidatos ({applications?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {applicationsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Carregando candidatos...</p>
                    </div>
                  ) : applications && applications.length > 0 ? (
                    <div className="space-y-6">
                      {applications.map((application) => (
                        <div key={application.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex items-start space-x-4 flex-1">
                              <Avatar className="h-14 w-14">
                                <AvatarFallback className="bg-purple-100 text-purple-600 font-bold text-lg">
                                  {application.freelancer.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="mb-3">
                                  <h3 className="font-bold text-xl text-gray-900 mb-1">{application.freelancer.name}</h3>
                                  <p className="text-gray-600 flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {application.freelancer.city}
                                  </p>
                                </div>
                                
                                {application.proposalDescription && (
                                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <h4 className="font-semibold text-gray-800 mb-2">Proposta:</h4>
                                    <p className="text-gray-700 leading-relaxed">{application.proposalDescription}</p>
                                  </div>
                                )}
                                
                                {application.proposedPrice && (
                                  <div className="mb-4">
                                    <div className="inline-flex items-center bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                                      <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                                      <span className="text-xl font-bold text-green-600">
                                        R$ {parseFloat(application.proposedPrice).toLocaleString('pt-BR', {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2
                                        })}
                                      </span>
                                      <span className="text-sm text-green-700 ml-2">proposta</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex sm:flex-col gap-3">
                              {application.status === 'pending' && (
                                <>
                                  <Button
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-semibold"
                                    onClick={() => handleUpdateApplication(application.id, 'accepted')}
                                    disabled={updateApplicationMutation.isPending}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Aceitar
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    className="px-6 py-2 font-semibold"
                                    onClick={() => handleUpdateApplication(application.id, 'rejected')}
                                    disabled={updateApplicationMutation.isPending}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Rejeitar
                                  </Button>
                                </>
                              )}
                              {application.status === 'accepted' && (
                                <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm font-semibold">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Aceito
                                </Badge>
                              )}
                              {application.status === 'rejected' && (
                                <Badge variant="destructive" className="px-4 py-2 text-sm font-semibold">
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Rejeitado
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum candidato ainda</h3>
                      <p className="text-gray-600">
                        Os freelancers interessados aparecerão aqui quando se candidatarem.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
