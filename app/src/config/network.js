// Esta configuración será actualizada por el script de Python
const networkConfig = {
    serverUrl: 'http://192.168.0.112:3000' // Valor por defecto, será actualizado
};

export const getNetworkConfig = () => networkConfig;

export const updateNetworkConfig = (newConfig) => {
    Object.assign(networkConfig, newConfig);
};
