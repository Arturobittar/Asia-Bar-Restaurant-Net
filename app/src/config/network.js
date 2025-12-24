// Configuración de red actualizada automáticamente
const networkConfig = {
    serverUrl: 'http://10.110.223.169:3000'
};

export const getNetworkConfig = () => networkConfig;
export const updateNetworkConfig = (newConfig) => {
    Object.assign(networkConfig, newConfig);
};
