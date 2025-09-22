import TablePage from "../components/features/table/table-page.js";
import useTable from "../hooks/useTable.js";
import { useTableData, useActionButtons, useHeaderButtons } from "../hooks/control.js";

function ControlPage() {
    const table = useTable();
    const [data, setData] = useTableData(table);
    const [onEdit, onDelete] = useActionButtons(table);
    const [onNew, onSearch] = useHeaderButtons(table, setData)

    return (
        <TablePage 
            key={table.dbname} 
            title={`Control de ${table.name}`}
            fields={table.fields} 
            data={data}
            onEdit={onEdit}
            onDelete={onDelete}
            onNew={onNew}
            onSearch={onSearch}
        />
    );
};

export default ControlPage;
