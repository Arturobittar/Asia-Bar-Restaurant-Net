import { apiAddress } from '../config/api.js'; 
import { routes } from '../config/routes.js';

function getParsedData(res) {
    if (res.length <= 0)
        return [];

    const data = [];

    for (const object of res)
        data.push(Object.values(object));

    return data;
}

function api_fetch(fetch_settings) {
    return fetch(`${apiAddress}/${fetch_settings.endpoint}`, {
        method: fetch_settings.method ?? "POST",
        headers: { 'Content-Type': 'application/json' },
        body: ('body' in fetch_settings) ? JSON.stringify(fetch_settings.body) : undefined,
        credentials: 'include'
    })
        .then(res => {
            if (!res.ok)
                throw new Error(`HTTP error, Status: ${res.status}`);

            fetch_settings.onOk?.(res);
            
            return res.json();
        })
        .catch(error => {
            const defaultOnError = () => alert(error);
            const onError = fetch_settings.onError ?? defaultOnError;
            onError();
        })
}

export const getRegisterData = async function(tableName, id) {
    let data = [];

    await api_fetch({
        endpoint: `${tableName}/${id}`,
        method: 'GET',
    }).then(res => { data = Object.values(res); })

    return data;
}

export const getTableData = async function(tableName, searchQuery = null) {
    let data = [];

    await api_fetch({
        endpoint: (!searchQuery) ? tableName : `${tableName}/search/${searchQuery}`,
        method: 'GET',
    }).then(res => { data = getParsedData(res); })

    return data;
}

export const onCreate = function(e, tableName, getData, onDone) {
    e.preventDefault(); 

    api_fetch({
        endpoint: tableName,
        body: getData(),
        onOk: (res) => { onDone(); }
    });
};

export const onDelete = function(tableName, getID, onDone) {
    api_fetch({
        endpoint: `${tableName}/${getID()}`,
        method: 'DELETE',
        onOk: (res) => { onDone(); }
    });
};

export const onUpdate = function(e, tableName, getData, getID, onDone) {
    e.preventDefault(); 
    
    api_fetch({
        endpoint: `${tableName}/${getID()}`,
        method: 'PUT',
        body: getData(),
        onOk: (res) => { onDone(); }
    });
};

export function onLogin(e, username, password, navigate) {
    e.preventDefault(); 

    api_fetch({
        endpoint: "login",
        body: { username: username, password: password },
        onError: () => { alert("Credenciales invalidas") },
        onOk: (res) => {
            alert("¡Bienvenido de vuelta!");
            navigate(routes['Inicio']);
        }
    });
}

export function onLogout(e, navigate) {
    e.preventDefault(); 
    
    api_fetch({
        endpoint: "logout",
        onOk: (res) => { navigate(routes['Inicio de Sesion']); },
        onError: () => {  }
    });
}


export function onControlForm(e, table, values, navigate, modifyId = null) {
    const getData = () => Object.fromEntries(
        table.dbfields.map((field, i) => [field, values[i]])
    );

    e.preventDefault();

    if (modifyId)
        onUpdate(e, table.dbname, getData, () => modifyId, () => alert("¡Entrada actualizada exitiosamente!"));            
    else
        onCreate(e, table.dbname, getData, () => alert("¡Entrada creada exitiosamente!"));            


    navigate(routes['Control']);
}

export const getDishData = async function(tableName) {
    let data = [];

    await api_fetch({
        endpoint: tableName,
        method: 'GET',
    }).then(res => { 
        if (res.length <= 0)
            return;

        for (const object of res) {
            const { Name, Price, Availability } = object;
            data.push([ Name, Price, Availability ]);
        }
    });

    return data;
}

export const getLastSaleID = async function() {
    let data = [];

    await api_fetch({
        endpoint: "sales-id/last",
        method: 'GET',
    }).then(res => { data = res[0]; });

    return data;
}

export const onNewSale = function(data, onDone) {
    api_fetch({
        endpoint: "sales",
        body: data,
        onOk: (res) => { onDone(); }
    });
};

export const searchClientByDocument = async (document) => {
    try {
        const response = await fetch(`${apiAddress}/clients/search/${encodeURIComponent(document)}`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        // Devolver el primer cliente que coincida (asumiendo que el documento es único)
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error('Error buscando cliente:', error);
        return null;
    }
};
