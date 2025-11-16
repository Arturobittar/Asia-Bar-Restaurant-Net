// Configuración de red actualizada automáticamente
const networkConfig = {
    serverUrl: 'http://10.246.188.59:3000'
};

export const getNetworkConfig = () => networkConfig;
export const updateNetworkConfig = (newConfig) => {
    Object.assign(networkConfig, newConfig);
};
