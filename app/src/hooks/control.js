import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useModifyIDChanger } from "./session.js";

import { routes } from '../config/routes.js';

import { getTableData, onDelete } from '../utils/api.js';

import { successAlert } from '../utils/alerts.js';

function useFormNavigate() {
    const changeModifyId = useModifyIDChanger();
    const navigate = useNavigate();

    const onNavigate = (id) => {
        changeModifyId(id);
        navigate(routes['Formulario de Control']);
    };

    return onNavigate;
}

export function useTableData(table) {
    const [data, setData] = useState([]);
    
    const fetchData = async () => {
        const fetched = await getTableData(table.dbname);
        setData(fetched);
    };

    useEffect(() => {
        fetchData();
    }, [table.dbname]);

    return [data, setData];
}

export function useActionButtons(table) {
    const onEditClick = useFormNavigate(); 

    const onDeleteClick = (id, hideRow) => {
        onDelete(table.dbname, () => id, () => {
            successAlert("Completado", "Registro exitosamente eliminado");
            hideRow();
        });
    };

    return [onEditClick, onDeleteClick];
}

export function useHeaderButtons(table, setData) {
    const onFormNavigate = useFormNavigate(); 
    const onNewClick = () => onFormNavigate(null);

    const onSearchClick = (query) => {
        const searchData = async function() {
            const data = await getTableData(table.dbname, query);
            setData(data);
        };

        searchData();
    };

    return [onNewClick, onSearchClick];
}
