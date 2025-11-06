import { apiAddress } from './api.js';

/**
 * Obtiene el último tipo de cambio desde la base de datos
 * @returns {Promise<number>} El tipo de cambio actual
 */
export const obtenerTipoCambio = async () => {
    try {
        const response = await fetch(`${apiAddress}/tipo-cambio`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al obtener el tipo de cambio');
        }

        const data = await response.json();
        
        if (data.success && data.tasa) {
            return data.tasa;
        } else {
            throw new Error(data.message || 'No se pudo obtener el tipo de cambio');
        }
    } catch (error) {
        console.error('❌ Error al obtener tipo de cambio:', error);
        throw error;
    }
};

/**
 * Guarda un nuevo tipo de cambio en la base de datos
 * @param {number} tasa - El nuevo tipo de cambio
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const guardarTipoCambio = async (tasa) => {
    try {
        const response = await fetch(`${apiAddress}/tipo-cambio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ tasa })
        });

        if (!response.ok) {
            throw new Error('Error al guardar el tipo de cambio');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ Error al guardar tipo de cambio:', error);
        throw error;
    }
};