import { useState, useEffect, useCallback } from 'react';
import { searchClientByDocument } from '../utils/api';

export function useClientSearch(documentValue, onClientFound) {
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [lastSearch, setLastSearch] = useState('');

    const searchClient = useCallback(async (value) => {
        if (!value || value.trim().length < 6 || value === lastSearch) {
            return; // No buscar si el documento es muy corto o es la misma búsqueda
        }

        setLastSearch(value);
        setIsSearching(true);
        setSearchError(null);

        try {
            const client = await searchClientByDocument(value);
            if (client) {
                onClientFound(client);
            } else {
                setSearchError('No se ha encontrado el cliente');
            }
        } catch (error) {
            console.error('Error buscando cliente:', error);
            setSearchError('Error al buscar el cliente. Intente nuevamente.');
        } finally {
            setIsSearching(false);
        }
    }, [lastSearch, onClientFound]);

    // Usar un temporizador para evitar múltiples búsquedas mientras el usuario escribe
    useEffect(() => {
        const timer = setTimeout(() => {
            if (documentValue && documentValue.trim().length >= 6) {
                searchClient(documentValue);
            } else if (documentValue === '') {
                // Limpiar errores si el campo está vacío
                setSearchError(null);
                setLastSearch('');
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [documentValue, searchClient]);

    return { isSearching, searchError };
}
