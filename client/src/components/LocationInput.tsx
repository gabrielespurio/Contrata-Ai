import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Navigation, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { reverseGeocode } from '@/lib/geocoding';

interface LocationData {
  type: 'manual' | 'gps';
  formattedAddress: string;
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
}

interface LocationInputProps {
  value: string;
  onChange: (value: string, locationData?: LocationData) => void;
  placeholder?: string;
}

export function LocationInput({ value, onChange, placeholder }: LocationInputProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'manual' | 'gps'>('manual');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  // Manual address fields
  const [manualAddress, setManualAddress] = useState({
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  // GPS location state
  const [gpsLocation, setGpsLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  
  // Editable GPS address
  const [editableGpsAddress, setEditableGpsAddress] = useState('');

  // Check geolocation permission on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
        console.log('🔐 Status da permissão de localização:', result.state);
        setLocationPermission(result.state);
        
        // Monitora mudanças na permissão
        result.onchange = () => {
          console.log('🔄 Permissão de localização alterada para:', result.state);
          setLocationPermission(result.state);
        };
      });
    }
  }, []);

  // Auto-fill address from CEP
  const handleCepLookup = async (cep: string) => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          const newAddress = {
            ...manualAddress,
            cep,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || ''
          };
          
          setManualAddress(newAddress);
          updateFormattedAddress(newAddress);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  // Update formatted address for manual input
  const updateFormattedAddress = (address: typeof manualAddress) => {
    const parts = [
      address.street,
      address.number,
      address.neighborhood,
      address.city,
      address.state
    ].filter(Boolean);
    
    const formatted = parts.join(', ');
    
    const locationData: LocationData = {
      type: 'manual',
      formattedAddress: formatted,
      ...address
    };
    
    onChange(formatted, locationData);
  };

  // Handle manual address field changes
  const handleManualChange = (field: keyof typeof manualAddress, value: string) => {
    const newAddress = { ...manualAddress, [field]: value };
    setManualAddress(newAddress);
    
    if (field === 'cep') {
      const cleanCep = value.replace(/\D/g, '');
      if (cleanCep.length === 8) {
        handleCepLookup(cleanCep);
      }
    } else {
      updateFormattedAddress(newAddress);
    }
  };


  // Get current GPS location with high accuracy
  const getCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      toast({
        title: "Localização não suportada",
        description: "Seu navegador não suporta geolocalização.",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingLocation(true);

    // Configurações para maior precisão
    const options = {
      enableHighAccuracy: true,     // Usa GPS em vez de rede/WiFi
      timeout: 20000,               // 20 segundos de timeout
      maximumAge: 0                 // Não aceita cache, força nova leitura
    };

    console.log('🔍 Solicitando localização com alta precisão...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`📍 Localização obtida: Lat=${latitude}, Lng=${longitude}, Precisão=${accuracy}m`);
        
        try {
          // Get readable address from coordinates
          const address = await reverseGeocode(latitude, longitude);
          
          const gpsData = {
            latitude,
            longitude,
            address
          };
          
          setGpsLocation(gpsData);
          setEditableGpsAddress(address);
          
          const locationData: LocationData = {
            type: 'gps',
            formattedAddress: address,
            latitude,
            longitude
          };
          
          onChange(address, locationData);
          
          toast({
            title: "Localização obtida!",
            description: `${address} (Precisão: ${Math.round(accuracy)}m). Se não estiver correto, você pode editar manualmente.`
          });
          
        } catch (error) {
          console.error('Erro ao obter endereço:', error);
          toast({
            title: "Erro",
            description: "Não foi possível obter o endereço da localização.",
            variant: "destructive"
          });
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        console.error('❌ Erro na geolocalização:', error);
        
        let message = "Não foi possível obter sua localização.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Permissão de localização negada. Ative a localização nas configurações do navegador e permita acesso ao GPS.";
            setLocationPermission('denied');
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Localização GPS indisponível. Verifique se o GPS está ativado no dispositivo.";
            break;
          case error.TIMEOUT:
            message = "Tempo esgotado para obter localização GPS. Tente novamente ou use endereço manual.";
            break;
        }
        
        toast({
          title: "Erro de localização",
          description: message,
          variant: "destructive"
        });
      },
      options  // Usa as opções de alta precisão definidas acima
    );
  };

  // Format CEP input
  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'manual' | 'gps')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Endereço Manual
          </TabsTrigger>
          <TabsTrigger value="gps" className="flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            Minha Localização
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    placeholder="00000-000"
                    value={formatCep(manualAddress.cep)}
                    onChange={(e) => handleManualChange('cep', e.target.value.replace(/\D/g, ''))}
                    maxLength={9}
                  />
                </div>
                <div>
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    placeholder="123"
                    value={manualAddress.number}
                    onChange={(e) => handleManualChange('number', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="street">Rua/Avenida</Label>
                <Input
                  id="street"
                  placeholder="Rua das Flores"
                  value={manualAddress.street}
                  onChange={(e) => handleManualChange('street', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    placeholder="Centro"
                    value={manualAddress.neighborhood}
                    onChange={(e) => handleManualChange('neighborhood', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="São Paulo"
                    value={manualAddress.city}
                    onChange={(e) => handleManualChange('city', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  placeholder="SP"
                  value={manualAddress.state}
                  onChange={(e) => handleManualChange('state', e.target.value)}
                  maxLength={2}
                />
              </div>

              {value && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Endereço formatado:</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">{value}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gps" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Navigation className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Compartilhar Localização</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Permita o acesso à sua localização para preenchimento automático do endereço
                  </p>
                </div>

                {gpsLocation ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Localização capturada!</span>
                      </div>
                      
                      <div>
                        <Label htmlFor="gps-address" className="text-sm text-green-700">
                          Endereço detectado (você pode editar se estiver incorreto):
                        </Label>
                        <Input
                          id="gps-address"
                          value={editableGpsAddress}
                          onChange={(e) => {
                            const newAddress = e.target.value;
                            setEditableGpsAddress(newAddress);
                            
                            const locationData: LocationData = {
                              type: 'gps',
                              formattedAddress: newAddress,
                              latitude: gpsLocation.latitude,
                              longitude: gpsLocation.longitude
                            };
                            
                            onChange(newAddress, locationData);
                          }}
                          placeholder="Edite o endereço se necessário"
                          className="bg-white border-green-300 focus:border-green-500 mt-1"
                        />
                        <p className="text-xs text-green-600 mt-1">
                          Coordenadas: {gpsLocation.latitude.toFixed(6)}, {gpsLocation.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>

                    {/* Mini Map Display */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="h-32 relative bg-gray-100">
                        <iframe
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${gpsLocation.longitude-0.01},${gpsLocation.latitude-0.01},${gpsLocation.longitude+0.01},${gpsLocation.latitude+0.01}&layer=mapnik&marker=${gpsLocation.latitude},${gpsLocation.longitude}`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          title="Mapa da localização"
                          className="rounded-lg"
                        />
                      </div>
                      <div className="p-2 bg-white border-t">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>📍 Localização identificada</span>
                          <a 
                            href={`https://www.google.com/maps?q=${gpsLocation.latitude},${gpsLocation.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Ver no Google Maps
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocation}
                      disabled={isLoadingLocation}
                      className="w-full"
                    >
                      {isLoadingLocation ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Atualizando localização...
                        </>
                      ) : (
                        <>
                          <Navigation className="w-4 h-4 mr-2" />
                          Atualizar Localização
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    className="w-full"
                  >
                    {isLoadingLocation ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Obtendo localização...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4 mr-2" />
                        Obter Minha Localização
                      </>
                    )}
                  </Button>
                )}

                {locationPermission === 'denied' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-red-700 mb-2">🚫 Permissão de localização bloqueada</h4>
                    <p className="text-sm text-red-600 mb-3">
                      Para obter sua localização real, você precisa desbloquear a permissão:
                    </p>
                    <ol className="text-xs text-red-600 space-y-1 mb-3">
                      <li>1. Clique no ícone de cadeado/localização na barra de endereços</li>
                      <li>2. Altere "Localização" de "Bloqueado" para "Permitir"</li>
                      <li>3. Recarregue a página (F5 ou Ctrl+R)</li>
                      <li>4. Tente capturar a localização novamente</li>
                    </ol>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.location.reload()}
                      className="text-red-600 border-red-300"
                    >
                      🔄 Recarregar Página
                    </Button>
                  </div>
                )}
                
                {locationPermission === 'prompt' && !gpsLocation && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>💡 Dica:</strong> Quando clicar em "Obter Minha Localização", 
                      o navegador deve solicitar permissão. Se não solicitar, verifique se a localização 
                      não está bloqueada no ícone da barra de endereços.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}