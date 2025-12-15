import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useUnifiedAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { LocationDisplay } from '@/components/LocationDisplay';
import { 
  MapPin, 
  Calendar, 
  Briefcase, 
  User, 
  CheckCircle,
  XCircle,
  Building2,
  Utensils,
  Coffee,
  Wrench,
  Hammer,
  Car,
  Home as HomeIcon,
  Heart,
  Palette,
  GraduationCap,
  Check,
  X
} from 'lucide-react';

interface JobDetailsProps {
  params: { id: string };
}

export default function JobDetails({ params }: JobDetailsProps) {
  const { user } = useUnifiedAuth();
  const { toast } = useToast();
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [proposedPrice, setProposedPrice] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  
  const { data: job, isLoading } = useQuery({
    queryKey: ['/api/jobs', params.id],
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/applications/job', params.id],
    enabled: !!user && user.type === 'contratante',
  });

  const applyMutation = useMutation({
    mutationFn: (data: { jobId: string; proposedPrice: string; proposalDescription: string }) => 
      apiRequest('POST', '/api/applications', data),
    onSuccess: () => {
      toast({
        title: "Candidatura enviada!",
        description: "Sua candidatura foi enviada com sucesso.",
      });
      setIsApplyDialogOpen(false);
      setProposedPrice('');
      setProposalDescription('');
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
      queryClient.invalidateQueries({ queryKey: ['/api/applications/job', params.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    },
  });

  const categoryIcons: Record<string, any> = {
    'Eventos': Utensils,
    'Gastronomia': Coffee,
    'Serviços Gerais': Wrench,
    'Construção & Reparos': Hammer,
    'Automotivo & Mecânica': Car,
    'Limpeza': HomeIcon,
    'Saúde e Bem-estar': Heart,
    'Beleza & Cuidados Pessoais': Palette,
    'Logística & Transporte': Car,
    'Administração & Atendimento': Building2,
    'Aulas': GraduationCap,
    'Design': Palette
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Vaga não encontrada</h1>
            <p className="text-gray-600">A vaga que você procura não existe ou foi removida.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleOpenApplyDialog = () => {
    setProposedPrice((job as any).payment || '');
    setIsApplyDialogOpen(true);
  };

  const handleSubmitApplication = () => {
    if (!proposedPrice || !proposalDescription) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o valor da proposta e a descrição.",
        variant: "destructive",
      });
      return;
    }
    applyMutation.mutate({
      jobId: params.id,
      proposedPrice,
      proposalDescription,
    });
  };

  const handleUpdateApplication = (applicationId: string, status: string) => {
    updateApplicationMutation.mutate({ applicationId, status });
  };

  const categoryName = (job as any).subcategory?.category?.name || 'Serviços';
  const IconComponent = categoryIcons[categoryName] || Briefcase;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Left - Job Details Card */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-gray-100 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Category Icon Section */}
                  <div className="flex flex-col items-center justify-center px-6 py-8 bg-gray-50 border-r border-gray-100 min-w-[120px]">
                    <div className="w-16 h-16 rounded-xl bg-white border-2 border-primary/20 flex items-center justify-center mb-3 shadow-sm">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 text-center">{(job as any).subcategory?.name || 'Serviço'}</span>
                  </div>
                  
                  {/* Job Info Section */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h1 className="text-2xl font-bold text-gray-900">{(job as any).title}</h1>
                      {(job as any).destaque && (
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm">
                          DESTAQUE
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Descrição</h3>
                      <p className="text-gray-700 leading-relaxed">{(job as any).description}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm">{(job as any).date ? new Date((job as any).date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Data não informada'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <LocationDisplay 
                          location={(job as any).location} 
                          className="text-sm text-gray-600" 
                          showIcon={false}
                          showMapLink={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right - Value Card */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm h-full">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                <span className="text-sm font-medium text-green-700 mb-2">Valor do Serviço:</span>
                <div className="text-4xl font-bold text-green-600 mb-4">
                  R$ {parseFloat((job as any).payment).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
                
                {user?.type === 'freelancer' && (
                  <Button 
                    onClick={handleOpenApplyDialog}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-semibold mt-2"
                    data-testid="button-apply"
                  >
                    Candidatar-se
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left - About Client */}
          <div className="lg:col-span-1">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Sobre o Contratante</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-gray-200 text-gray-600 font-semibold text-lg">
                      {(job as any).client?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{(job as any).client?.name || 'Contratante'}</p>
                    {(job as any).client?.company && (
                      <p className="text-sm text-gray-600">Empresa: {(job as any).client.company}</p>
                    )}
                    <p className="text-sm text-gray-500">Desde: {new Date((job as any).client?.createdAt || Date.now()).getFullYear()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right - Candidates (for contractors) */}
          {user?.type === 'contratante' && user.id === (job as any).clientId && (
            <div className="lg:col-span-2">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Candidatos</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {applicationsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-600">Carregando candidatos...</p>
                    </div>
                  ) : applications && (applications as any[]).length > 0 ? (
                    <div className="space-y-4">
                      {(applications as any[]).map((application: any) => (
                        <div 
                          key={application.id} 
                          className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
                          data-testid={`card-candidate-${application.id}`}
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-amber-100 text-amber-700 font-semibold">
                                {application.freelancer?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'F'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900">{application.freelancer?.name || 'Freelancer'}</p>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">Proposta:</span>
                                <span className="font-bold text-green-600">
                                  R$ {application.proposedPrice ? parseFloat(application.proposedPrice).toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  }) : parseFloat((job as any).payment).toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {application.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white px-4"
                                  onClick={() => handleUpdateApplication(application.id, 'accepted')}
                                  disabled={updateApplicationMutation.isPending}
                                  data-testid={`button-accept-${application.id}`}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Aceitar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="px-4"
                                  onClick={() => handleUpdateApplication(application.id, 'rejected')}
                                  disabled={updateApplicationMutation.isPending}
                                  data-testid={`button-reject-${application.id}`}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </>
                            )}
                            {application.status === 'accepted' && (
                              <Badge className="bg-green-100 text-green-800 border border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Aceito
                              </Badge>
                            )}
                            {application.status === 'rejected' && (
                              <Badge variant="destructive" className="border">
                                <XCircle className="w-3 h-3 mr-1" />
                                Rejeitado
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-base font-medium text-gray-900 mb-1">Nenhum candidato ainda</h3>
                      <p className="text-sm text-gray-600">
                        Os freelancers interessados aparecerão aqui.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* For freelancers - show empty space or additional info */}
          {user?.type !== 'contratante' && (
            <div className="lg:col-span-2">
              {/* Could add additional info here for freelancers */}
            </div>
          )}
        </div>
      </div>

      {/* Apply Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Proposta</DialogTitle>
            <DialogDescription>
              Preencha os dados da sua proposta para esta vaga.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="proposedPrice">Valor da Proposta (R$)</Label>
              <Input
                id="proposedPrice"
                type="number"
                step="0.01"
                placeholder="Ex: 150.00"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                data-testid="input-proposed-price"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="proposalDescription">Descrição da Proposta</Label>
              <Textarea
                id="proposalDescription"
                placeholder="Descreva sua experiência e por que você é o profissional ideal para este serviço..."
                rows={4}
                value={proposalDescription}
                onChange={(e) => setProposalDescription(e.target.value)}
                data-testid="input-proposal-description"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsApplyDialogOpen(false)}
              data-testid="button-cancel-apply"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitApplication}
              disabled={applyMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-submit-apply"
            >
              {applyMutation.isPending ? 'Enviando...' : 'Enviar Proposta'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
