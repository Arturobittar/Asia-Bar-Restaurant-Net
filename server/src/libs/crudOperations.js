import handleQueryExecution from './handleQueryExecution.js';
import { getOrderedObject } from '../libs/utilities.js';

export async function sendAllRegistersFrom(res, tableName) {
    handleQueryExecution(res, async (db) => {
        const query = `SELECT * FROM ${tableName}`;

        const [results, fields] = await db.execute(query);

        res.status(200).json(results);
    });
}

export async function sendFromId(req, res, tableName, idName) {
    handleQueryExecution(res, async (db) => {
        
        const query = `SELECT * FROM ${tableName} WHERE ${idName} = ?`;

        const [results, fields] = await db.execute(query, [req.params.id]);

        (results.length < 1)
            ? res.status(404).json({message: "No entry with such id"})
            : res.status(200).json(results[0]);
    });
}

export async function createRegister(req, res, table) {
    handleQueryExecution(res, async (db) => {
        const body = req.body;
        const orderedBody = getOrderedObject(body);

        const valuesString = "?" + ", ?".repeat(Object.keys(orderedBody).length - 1);
        const query = `INSERT INTO ${table.name} (${table.getFieldsString()}) VALUES (${valuesString})`;

        const [results, fields] = await db.execute(query, Object.values(orderedBody));

        res.status(200).json({message: "Created Successfully!"});
    });
}

export async function deleteById(req, res, tableName, idName) {
    handleQueryExecution(res, async (db) => {
        
        let query = `DELETE FROM ${tableName} WHERE ${idName} = ?`;

        const [results, fields] = await db.execute(query, [req.params.id]);

        (results.affectedRows === 0)
            ? res.status(404).json({message: "No entry with such id"})
            : res.status(200).json({message: "Deleted Successfully!"});
    });
}

export async function updateById(req, res, table) {
    handleQueryExecution(res, async (db) => {
        const body = req.body;
        const orderedBody = getOrderedObject(body);
        
        const fields = table.fields;

        let query = `UPDATE ${table.name} SET ${fields[0]} = ?`;

        for (let i = 1; i < fields.length; i++) {
            query += `, ${fields[i]} = ?`;
        }

        query += ` WHERE ${table.idName} = ?`;

        let data = Object.values(orderedBody);
        data.push(req.params.id);

        const [results, queryFields] = await db.execute(query, data);

        res.status(200).json({message: "Updated Successfully!"});
    });
}

export async function search(req, res, table) {
    handleQueryExecution(res, async (db) => {
        const searchQuery = "%" + req.params.query + "%";
        let query;
        let params;

        // Búsqueda específica para documentos en la tabla Clients
        if (table.name === 'clients' && req.params.query) {
            query = `SELECT * FROM ${table.name} WHERE Iddocument LIKE ?`;
            params = [searchQuery];
        } else {
            // Búsqueda general para otras tablas
            const fields = table.fields;
            query = `SELECT * FROM ${table.name} WHERE `;
            
            const conditions = fields.map(field => `${field} LIKE ?`);
            query += conditions.join(' OR ');
            
            // Crear un array de parámetros con el término de búsqueda para cada campo
            params = new Array(fields.length).fill(searchQuery);
        }

        const [results] = await db.execute(query, params);
        res.status(200).json(results);
    });
}

export function getLastSaleID(req, res) {
    handleQueryExecution(res, async (db) => {
        const [results, queryFields] = await db.execute("SELECT MAX(ID) FROM Sales");

        const result = [];

        result.push(results[0]["MAX(ID)"]);

        res.status(200).json(result);
    });
}
