import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, User, CircleDollarSign } from 'lucide-react';

interface JobCardProps {
  job: any;
  showApplyButton?: boolean;
  showEditButton?: boolean;
}

export function JobCard({ job, showApplyButton = true, showEditButton = false }: JobCardProps) {
  const formatLocation = (location: string) => {
    if (!location) return 'Local não informado';
    if (location.includes('GPS:') || location.includes('-2')) {
      return 'Rua José Afonso Tomazelle, 210, Rio Preto, SP';
    }
    return location;
  };

  const formatDateTime = (date: string, time: string) => {
    if (!date) return 'Data não informada';
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const month = months[dateObj.getMonth()];
    const timeStr = time || '19:00';
    return `${day} ${month}. ${timeStr}h - 23:00h`;
  };

  return (
    <div 
      className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] bg-white border border-gray-200"
      data-testid={`card-job-${job.id}`}
    >
      {/* Header - Blue gradient with title and orange price section */}
      <div className="flex">
        <div 
          className="flex-1 px-5 py-4"
          style={{
            background: 'linear-gradient(135deg, #1a5276 0%, #2980b9 50%, #5dade2 100%)'
          }}
        >
          <Link href={`/jobs/${job.id}`}>
            <h3 
              className="text-lg font-bold text-white leading-snug cursor-pointer hover:text-blue-100 transition-colors line-clamp-2"
              data-testid={`text-job-title-${job.id}`}
            >
              {job.title}
            </h3>
          </Link>
        </div>
        
        <div className="bg-orange-500 px-4 py-4 flex flex-col items-end justify-center flex-shrink-0">
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-white">
              R$ {parseFloat(job.payment).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
            <CircleDollarSign className="w-5 h-5 text-white" />
          </div>
          <div className="text-xs text-orange-100">valor do serviço</div>
        </div>
      </div>

      {/* Content - White background */}
      <div className="px-5 py-4 bg-white">
        {/* Tipo */}
        <div className="mb-2">
          <span className="text-orange-500 font-bold text-sm">Tipo: </span>
          <span className="text-gray-700 text-sm">{job.subcategory?.category?.name || 'Evento'}</span>
        </div>
        
        {/* Função */}
        <div className="mb-3">
          <span className="text-orange-500 font-bold text-sm">Função: </span>
          <span className="text-gray-700 text-sm">{job.subcategory?.name || 'Garçom/Garçonete'}</span>
        </div>

        {/* Description Box - Fixed height */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 h-20 overflow-hidden">
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {job.description}
          </p>
        </div>

        {/* Location and Date Row - Fixed height */}
        <div className="flex items-start justify-between gap-4 py-3 border-t border-gray-100 h-16">
          <div className="flex items-start gap-2 flex-1 overflow-hidden">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-600 text-xs leading-tight line-clamp-2">
              {formatLocation(job.location)}
            </span>
          </div>
          <div className="flex items-start gap-2 flex-shrink-0">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-600 text-xs leading-tight whitespace-nowrap">
              {formatDateTime(job.date, job.time)}
            </span>
          </div>
        </div>

        {/* Footer - User Info and Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center min-w-0">
            <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div className="min-w-0">
              <div className="text-gray-800 text-sm font-semibold truncate">
                {job.client?.name || 'Contratante'}
              </div>
              <div className="text-gray-500 text-xs truncate">
                {job.client?.city || 'São José do Rio Preto'}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            {showApplyButton && (
              <Link href={`/jobs/${job.id}`}>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-1 h-8 rounded-md transition-colors w-full"
                  data-testid={`button-apply-${job.id}`}
                >
                  CANDIDATAR-SE
                </Button>
              </Link>
            )}
            {showEditButton && (
              <Link href={`/editar-vaga/${job.id}`}>
                <Button 
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50 font-bold text-xs px-4 py-1 h-8 rounded-md transition-colors w-full"
                  data-testid={`button-edit-${job.id}`}
                >
                  Editar
                </Button>
              </Link>
            )}
            <Link href={`/jobs/${job.id}`}>
              <Button 
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-50 font-bold text-xs px-4 py-1 h-8 rounded-md transition-colors w-full"
                data-testid={`button-details-${job.id}`}
              >
                Ver Detalhes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
