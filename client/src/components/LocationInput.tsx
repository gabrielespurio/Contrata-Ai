import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Navigation, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  // Check geolocation permission on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state);
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

  // Get current GPS location
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

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Try to get address from coordinates using a reverse geocoding service
          // For this example, we'll use a simple formatted address
          const address = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
          
          const gpsData = {
            latitude,
            longitude,
            address
          };
          
          setGpsLocation(gpsData);
          
          const locationData: LocationData = {
            type: 'gps',
            formattedAddress: address,
            latitude,
            longitude
          };
          
          onChange(address, locationData);
          
          toast({
            title: "Localização obtida!",
            description: "Sua localização atual foi capturada com sucesso."
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
        let message = "Não foi possível obter sua localização.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Permissão de localização negada. Ative a localização nas configurações do navegador.";
            setLocationPermission('denied');
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Localização indisponível no momento.";
            break;
          case error.TIMEOUT:
            message = "Tempo esgotado para obter localização.";
            break;
        }
        
        toast({
          title: "Erro de localização",
          description: message,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
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
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Localização capturada!</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">{gpsLocation.address}</p>
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
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      <strong>Permissão negada:</strong> Para usar sua localização, ative a permissão 
                      de localização nas configurações do navegador e recarregue a página.
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