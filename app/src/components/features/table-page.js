import { useState } from "react";

import DashboardPage from "../../pages/reusables/dashboard-page.js";

import Table from './table.js';

import { PrimaryButton } from '../ui/buttons.js';
import { SearchInputBox } from '../ui/form.js';

import "./table-page.css";

function SearchBox({ onSearch }) {
    const [query, setQuery] = useState("");

    return(
        <div className="search-container">
            <SearchInputBox value={ query } textSetter={ setQuery } />
            <PrimaryButton text="Buscar" onClick={ () => onSearch(query) } />
        </div>
    );
}

function ActionButtons({ onNew, onSearch }) {
    return(
        <div className="action-buttons-container">
            <PrimaryButton text="Añadir" onClick={ onNew } />
            <SearchBox onSearch={ onSearch } />
        </div>
    );
}

function Header({ title, onNew, onSearch }) {
    return (
        <div className="table-page-header">
            <h1>{ title }</h1>
            <ActionButtons onNew={ onNew } onSearch={ onSearch } />
        </div>
    );
}

function getAllColumnNames(fields) {
    const names = [...fields];
    names.push("Acciones");
    return names;
}

function TableContent({ fields, data, onEdit, onDelete }) {
    return (data.length === 0)
        ? <h1>No hay entradas</h1> 
        : <Table fields={ getAllColumnNames(fields) } data={ data } onEdit={ onEdit } onDelete={ onDelete } />;
}

export default function TablePage({ title, fields, data, onEdit, onDelete, onNew, onSearch }) {
    return( 
        <DashboardPage 
            content={
                <>
                    <Header title={ title } onNew={ onNew } onSearch={ onSearch } />
                    <TableContent fields={ fields } data={ data } onEdit={ onEdit } onDelete={ onDelete } />
                </>
            } 
        />
    );
}
