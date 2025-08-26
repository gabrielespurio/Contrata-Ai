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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900">{job.title}</CardTitle>
                  <div className="flex items-center mt-2 text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span className="text-lg">{job.subcategory.category.name} → {job.subcategory.name}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {job.destaque && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                      ✨ DESTAQUE
                    </Badge>
                  )}
                  <div className="text-sm text-gray-500">
                    Criado em {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-gray-700">{job.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3" />
                  <span>{job.date}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-3" />
                  <span>{job.time}</span>
                </div>
                <LocationDisplay 
                  location={job.location} 
                  className="text-gray-600" 
                  showMapLink={true}
                />
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-5 h-5 mr-3" />
                  <span className="font-semibold text-secondary text-lg">R$ {job.payment}</span>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600">
                <User className="w-5 h-5 mr-3" />
                <span>Publicado por {job.client.name}</span>
              </div>
              
              {user?.type === 'freelancer' && (
                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleApply}
                    disabled={applyMutation.isPending}
                    className="w-full"
                  >
                    {applyMutation.isPending ? 'Enviando...' : 'Candidatar-se'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sobre o Contratante</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                <Avatar>
                  <AvatarFallback>
                    {job.client.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{job.client.name}</p>
                  <p className="text-sm text-gray-600">{job.client.city}</p>
                </div>
              </div>
              {job.client.premium && (
                <Badge className="bg-primary/10 text-primary">Premium</Badge>
              )}
            </CardContent>
          </Card>

          {/* Applications (for contractors) */}
          {user?.type === 'contratante' && user.id === job.clientId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Candidatos</CardTitle>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : applications && applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div key={application.id} className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">
                                {application.freelancer.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900 text-lg">{application.freelancer.name}</p>
                                  <p className="text-sm text-gray-500 mt-1">📍 {application.freelancer.city}</p>
                                </div>
                              </div>
                              {application.proposalDescription && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                  <p className="text-sm text-gray-700 leading-relaxed">{application.proposalDescription}</p>
                                </div>
                              )}
                              {application.proposedPrice && (
                                <div className="mt-2">
                                  <span className="text-lg font-bold text-green-600">
                                    R$ {parseFloat(application.proposedPrice).toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })}
                                  </span>
                                  <span className="text-sm text-gray-500 ml-2">proposta</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {application.status === 'pending' && (
                              <div className="flex flex-col space-y-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
                                  onClick={() => handleUpdateApplication(application.id, 'accepted')}
                                  disabled={updateApplicationMutation.isPending}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Aceitar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="px-4 py-2"
                                  onClick={() => handleUpdateApplication(application.id, 'rejected')}
                                  disabled={updateApplicationMutation.isPending}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Rejeitar
                                </Button>
                              </div>
                            )}
                            {application.status === 'accepted' && (
                              <Badge className="bg-green-100 text-green-800 px-3 py-1 text-sm">✓ Aceito</Badge>
                            )}
                            {application.status === 'rejected' && (
                              <Badge variant="destructive" className="px-3 py-1 text-sm">✗ Rejeitado</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">
                    Nenhuma candidatura ainda.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
