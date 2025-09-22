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
        const fields = table.fields;
        
        let query = `SELECT * FROM ${table.name} WHERE CONCAT_WS(' '`;
        
        for (let i = 0; i < fields.length; i++) {
            query += `, ${fields[i]}`;
        }

        query += ") LIKE ?";

        const searchQuery = "%" + req.params.query + "%";

        const [results, queryFields] = await db.execute(query, [ searchQuery ]);

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

export async function addSale(req, res) {
    handleQueryExecution(res, async (db) => {
        const body = req.body;
        const products = body.products;

        const saleQuery = `INSERT INTO Sales (ID, ClientIdDocument, ClientName, Type) VALUES (?, ?, ?, ?)`;
        const productQuery = `INSERT INTO SaleDetails (ID, Name, Price, Quantity) VALUES (?, ?, ?, ?)`;
        
        const [results, fields] = await db.execute(saleQuery, [body.id, body.clientId, body.clientName, body.type]);

        products.map( async (product) => {
            const [results, fields] = await db.execute(productQuery, [body.id, product.name, product.price, product.quantity]);
        });

        res.status(200).json({ message: "Sale successfully added" });
    });
}

export async function updateSale(req, res) {
    handleQueryExecution(res, async (db) => {
        const id = req.params.id;
        const body = req.body;
        const products = body.products;

        const detectSaleQuery = "SELECT * FROM Sales WHERE ID = ?";
        const [detectionResults, detectionFields] = await db.execute(detectSaleQuery, [id]);

        if (detectionResults.length === 0)
            res.status(404).json({message: "No entry with such id"})

        const updateSaleQuery = "UPDATE Sales SET ClientIdDocument = ?, ClientName = ?, Type = ? WHERE ID = ?";
        const [saleQuery, saleFields] = await db.execute(updateSaleQuery, [body.clientId, body.clientName, body.type, id]);

        const deleteOldProductsQuery = "DELETE FROM SaleDetails WHERE ID = ?";
        const [deletionResults, deletionFields] = await db.execute(deleteOldProductsQuery, [id]);

        const productQuery = `INSERT INTO SaleDetails (ID, Name, Price, Quantity) VALUES (?, ?, ?, ?)`;
        products.map( async (product) => {
            const [results, fields] = await db.execute(productQuery, [id, product.name, product.price, product.quantity]);
        });

        res.status(200).json({ message: "Sale successfully updated" });
    });
}

export async function searchSale(req, res) {
    handleQueryExecution(res, async (db) => {
        const id = req.params.id;
        const userQuery = ['%' + req.params.id + '%'];
        
        const hasID = id && id !== "";

        const condition = hasID ? "WHERE CONCAT_WS(' ', s.ID, s.ClientIdDocument, s.ClientName, s.Type) LIKE ?" : "";

        const dbQuery = `
            SELECT 
                s.ID, 
                s.ClientIdDocument, 
                s.ClientName, 
                s.Type, 
                Sum(sd.Quantity * sd.Price) As Total 
            FROM 
                Sales s 
                INNER JOIN SaleDetails sd ON s.ID = sd.ID
            ${condition}
            GROUP BY
                s.ID, s.ClientIdDocument, s.ClientName, s.Type
        `;
        
        const [results, fields] = await db.execute(dbQuery, hasID ? userQuery : null);

        res.status(200).json(results);
    });
}

export async function getSaleSummary(req, res) {
    handleQueryExecution(res, async (db) => {
        const id = req.params.id;

        const isSingleSale = id && id !== "";

        const condition = isSingleSale ? "WHERE s.ID = ?" : "";
        const data = isSingleSale ? [id] : null;

        const query = `
            SELECT 
                s.ID, 
                s.ClientIdDocument, 
                s.ClientName, 
                s.Type, 
                Sum(sd.Quantity * sd.Price) As Total 
            FROM 
                Sales s 
                INNER JOIN SaleDetails sd ON s.ID = sd.ID
            ${condition}
            GROUP BY
                s.ID, s.ClientIdDocument, s.ClientName, s.Type
        `;
        
        const [results, fields] = await db.execute(query, data);

        const singleResult = results[0];

        (isSingleSale && results.length === 0)
            ? res.status(404).json({message: "No entry with such id"})
            : res.status(200).json(isSingleSale ? singleResult : results);
    });
}

export async function getDetailedSale(req, res) {
    handleQueryExecution(res, async (db) => {
        const id = [req.params.id];

        const saleQuery = "SELECT ID, ClientIdDocument, ClientName, Type FROM Sales WHERE ID = ?";
        const [saleResult, saleFields] = await db.execute(saleQuery, id);
        const sale = saleResult[0];

        const detailsQuery = "SELECT Name, Price, Quantity FROM SaleDetails WHERE ID = ?";
        const [detailsResults, detailsFields] = await db.execute(detailsQuery, id);

        sale.products = detailsResults; 
        
        res.status(200).json(sale);
    });
}

export async function deleteSale(req, res) {
    handleQueryExecution(res, async (db) => {
        let query = "DELETE FROM Sales WHERE ID = ?";

        const [results, fields] = await db.execute(query, [req.params.id]);

        (results.affectedRows === 0)
            ? res.status(404).json({message: "No entry with such id"})
            : res.status(200).json({message: "Deleted Successfully!"});
    });
}

export async function getTopProducts(req, res) {
    handleQueryExecution(res, async (db) => {
        const query = `
            SELECT 
                Name,
                Price,
                Sum(Quantity) As TotalSales
            FROM 
                SaleDetails
            GROUP BY
                Name
            ORDER BY 
                TotalSales DESC
        `;
        
        const [results, fields] = await db.execute(query);
        
        const topSize = Math.min(5, results.length);

        const topProducts = results.filter((_, i) => i < topSize);
       
        res.status(200).json(topProducts);
    });
}
