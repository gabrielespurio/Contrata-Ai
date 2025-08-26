// Função para converter coordenadas GPS em endereço legível
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    // Tentar múltiplos serviços para maior precisão
    const services = [
      // OpenStreetMap Nominatim (gratuito)
      {
        url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt-BR&zoom=18`,
        headers: { 'User-Agent': 'ContrataAI/1.0' }
      },
      // Serviço alternativo se necessário
      {
        url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt&zoom=16`,
        headers: { 'User-Agent': 'ContrataAI/1.0' }
      }
    ];

    for (const service of services) {
      try {
        const response = await fetch(service.url, { headers: service.headers });
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        if (!data || !data.address) continue;
        
        const address = data.address;
        console.log('Dados de geocodificação:', address); // Para debug
        
        // Extrair componentes do endereço com prioridade para dados brasileiros
        const road = address.road || address.street || address.pedestrian || '';
        const houseNumber = address.house_number || '';
        const neighbourhood = address.neighbourhood || address.suburb || address.quarter || address.residential || '';
        const city = address.city || address.town || address.village || address.municipality || '';
        const state = address.state || address.state_district || '';
        
        // Montar endereço formatado
        const parts = [];
        
        if (road) {
          if (houseNumber) {
            parts.push(`${road}, ${houseNumber}`);
          } else {
            parts.push(road);
          }
        }
        
        if (neighbourhood) {
          parts.push(neighbourhood);
        }
        
        if (city) {
          parts.push(city);
        }
        
        if (state) {
          parts.push(state);
        }
        
        const formattedAddress = parts.join(' - ');
        
        if (formattedAddress.length > 10) { // Validação mínima de qualidade
          return formattedAddress;
        }
        
      } catch (serviceError) {
        console.log('Erro no serviço de geocodificação:', serviceError);
        continue;
      }
    }
    
    // Fallback para coordenadas se nenhum serviço funcionou
    return `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    
  } catch (error) {
    console.error('Erro na geocodificação reversa:', error);
    return `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

// Função para extrair coordenadas de string GPS
export function parseGPSCoordinates(location: string): { lat: number; lng: number } | null {
  // Formato esperado: "GPS: -20.7978, -49.3453" ou "Localização GPS: -20.7978, -49.3453"
  const gpsMatch = location.match(/GPS:\s*(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/i);
  
  if (gpsMatch) {
    const lat = parseFloat(gpsMatch[1]);
    const lng = parseFloat(gpsMatch[2]);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }
  
  return null;
}

// Função para verificar se a localização é GPS
export function isGPSLocation(location: string): boolean {
  return location.toLowerCase().includes('gps:');
}

// Função para formatar endereço para exibição
export function formatLocationForDisplay(location: string): Promise<string> {
  const coordinates = parseGPSCoordinates(location);
  
  if (coordinates) {
    return reverseGeocode(coordinates.lat, coordinates.lng);
  }
  
  return Promise.resolve(location);
}