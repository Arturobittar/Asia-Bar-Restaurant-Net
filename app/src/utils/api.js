import { apiAddress } from '../config/api.js'; 
import { routes } from '../config/routes.js';

import { questionAlert, infoAlert, errorAlert, iconlessAlert, successAlert } from './alerts.js';

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
                throw { code: res.status };

            fetch_settings.onOk?.(res);
            
            return res.json();
        })
        .catch(error => {
            const onError = fetch_settings.onError;

            if (onError) {
                onError();
                return;
            }

            switch (error.code) {
                case 401:
                    errorAlert("Denegado", "Usted no posee los permisos requeridos para esta solicitud");
                    break;

                default:
                    errorAlert("Error", "No se ha podido procesar su solicitud correctamente");
                    break;
            }
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
        onOk: (res) => onDone()
    });
};

export const onDelete = function(tableName, getID, onDone) {
   questionAlert(
        "¿Desea eliminar?",
        "La operación no será revertible",
        () => api_fetch({
            endpoint: `${tableName}/${getID()}`,
            method: 'DELETE',
            onOk: (res) => onDone() 
        }),
        () => infoAlert("Cancelado", "Su operación ha sido cancelada")
    ); 
};

export const onUpdate = function(e, tableName, getData, getID, onDone) {
    e.preventDefault(); 
    
    api_fetch({
        endpoint: `${tableName}/${getID()}`,
        method: 'PUT',
        body: getData(),
        onOk: (res) => onDone()
    });
};

export function onLogin(e, username, password, navigate) {
    e.preventDefault(); 

    api_fetch({
        endpoint: "login",
        body: { username: username, password: password },
        onError: () => { errorAlert("Credenciales invalidas", "Sus credenciales no corresponden a ninguna sesión existente") },
        onOk: (res) => {
            iconlessAlert("Bienvenida", `¡Bienvenido de vuelta, ${username}!`);
            navigate(routes['Inicio']);
        }
    });
}

export function onLogout(navigate) {
    api_fetch({
        endpoint: "logout",
        onOk: (res) => { navigate(routes['Inicio de Sesion']); },
        onError: () => { errorAlert("Error inesperado", "No se ha podido cerrar su sesión") }
    });
}


export function onControlForm(e, table, values, navigate, modifyId = null) {
    const getData = () => Object.fromEntries(
        table.dbfields.map((field, i) => [field, values[i]])
    );

    e.preventDefault();

    if (modifyId)
        onUpdate(e, table.dbname, getData, () => modifyId, () => successAlert("Completado", "¡Entrada actualizada exitiosamente!"));            
    else
        onCreate(e, table.dbname, getData, () => successAlert("Completado", "¡Entrada creada exitiosamente!"));            


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
        onOk: (res) => onDone()
    });
};

export const onUpdateSale = function(id, data, onDone) {
    api_fetch({
        endpoint: `sales/${id}`,
        method: 'PUT',
        body: data,
        onOk: (res) => onDone()
    });
}

export const findClient = async function(id) {
    if (id == "")
        return [];

    let found = [];

    await api_fetch({
        endpoint: `clients/${id}`,
        method: 'GET',
        onError: () => {}
    }).then(res => { 
        found = res ? Object.values(res) : found; 
        console.log(id); 
        console.log(found); 
    })

    return found;
}


export const getTopProducts = async function() {
    let data = [];

    await api_fetch({
        endpoint: "top-products",
        method: 'GET',
    }).then(res => { data = res; });

    return data;
}
