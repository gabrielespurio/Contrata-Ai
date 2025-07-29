// Função para converter coordenadas GPS em endereço legível
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt-BR`
    );
    
    if (!response.ok) {
      throw new Error('Erro na geocodificação');
    }
    
    const data = await response.json();
    
    if (!data || !data.address) {
      return `GPS: ${lat}, ${lng}`;
    }
    
    const address = data.address;
    
    // Extrair componentes do endereço
    const road = address.road || address.street || '';
    const houseNumber = address.house_number || '';
    const neighbourhood = address.neighbourhood || address.suburb || address.quarter || '';
    const city = address.city || address.town || address.village || '';
    const state = address.state || '';
    
    // Montar endereço formatado
    let formattedAddress = '';
    
    if (road) {
      formattedAddress += road;
      if (houseNumber) {
        formattedAddress += `, ${houseNumber}`;
      }
    }
    
    if (neighbourhood && formattedAddress) {
      formattedAddress += ` - ${neighbourhood}`;
    } else if (neighbourhood) {
      formattedAddress = neighbourhood;
    }
    
    if (city && formattedAddress) {
      formattedAddress += `, ${city}`;
    } else if (city) {
      formattedAddress = city;
    }
    
    if (state && formattedAddress) {
      formattedAddress += ` - ${state}`;
    }
    
    return formattedAddress || `GPS: ${lat}, ${lng}`;
  } catch (error) {
    console.error('Erro na geocodificação reversa:', error);
    return `GPS: ${lat}, ${lng}`;
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