// Configuración de la API
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

// Usar localhost para desarrollo local, de lo contrario usar la IP
const API_BASE_URL = isLocalhost 
  ? 'http://localhost:9090/api' 
  : 'http://10.193.66.59:9090/api';

export const apiAddress = API_BASE_URL;
