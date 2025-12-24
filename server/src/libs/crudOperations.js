import handleQueryExecution from './handleQueryExecution.js';
import { getOrderedObject } from '../libs/utilities.js';

const allowedTableStatuses = new Set(["desocupada", "ocupada", "ordenada", "consumiendo"]);

const parseAmount = (value) => {
    if (value === undefined || value === null || value === "") {
        return null;
    }
    const normalized = typeof value === "string" ? value.replace(/,/g, "") : value;
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
};

const sanitizeText = (value) => {
    if (typeof value !== "string") {
        return null;
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
};

async function insertPaymentRecords(db, saleId, paymentDetail) {
    if (!paymentDetail || !Array.isArray(paymentDetail.selections) || !paymentDetail.selections.length) {
        return;
    }

    const insertQuery = "INSERT INTO PaymentRecords (SaleID, Method, AmountDollar, AmountBs, ReferenceNumber, HolderName, HolderEmail) VALUES (?, ?, ?, ?, ?, ?, ?)";

    for (const selection of paymentDetail.selections) {
        if (!selection || !selection.id) {
            continue;
        }

        const fields = selection.fields || {};
        const amountDollar = parseAmount(fields.montoDollar);
        const amountBs = parseAmount(fields.montoBs);
        const referenceNumber = sanitizeText(fields.referencia);
        const holderName = sanitizeText(fields.propietario);
        const holderEmail = sanitizeText(fields.correo);

        await db.execute(insertQuery, [
            saleId,
            selection.id,
            amountDollar ?? 0,
            amountBs ?? null,
            referenceNumber,
            holderName,
            holderEmail
        ]);
    }
}

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
        const products = Array.isArray(body.products) ? body.products : [];
        const paymentDetail = body.paymentDetail;

        const saleQuery = `INSERT INTO Sales (ID, ClientIdDocument, ClientName, Type, DeliverymanName, Note, Direction, TableNumber, TotalBs, DeliveryPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const productQuery = `INSERT INTO SaleDetails (ID, Name, Price, Quantity) VALUES (?, ?, ?, ?)`;

        try {
            await db.beginTransaction();

            await db.execute(saleQuery, [
                body.id,
                body.clientId,
                body.clientName,
                body.type,
                body.deliverymanName || null,
                body.note || null,
                body.address || null,
                body.tableNumber || null,
                body.totalBs ?? null,
                body.deliveryPrice ?? 0
            ]);

            if (products.length) {
                await Promise.all(
                    products.map((product) =>
                        db.execute(productQuery, [
                            body.id,
                            product.name,
                            product.price,
                            product.quantity
                        ])
                    )
                );
            }

            await insertPaymentRecords(db, body.id, paymentDetail);

            await db.commit();
            res.status(200).json({ message: "Sale successfully added" });
        } catch (error) {
            try {
                await db.rollback();
            } catch (rollbackError) {
                console.error("Rollback failed while adding sale:", rollbackError);
            }
            console.error("Error adding sale:", error);
            res.status(500).json({ message: "Sale could not be added", error: error.message });
        }
    });
}

export async function updateSale(req, res) {
    handleQueryExecution(res, async (db) => {
        const id = req.params.id;
        const body = req.body;
        const products = Array.isArray(body.products) ? body.products : [];
        const paymentDetail = body.paymentDetail;

        const updateFields = [
            "ClientIdDocument = ?",
            "ClientName = ?",
            "Type = ?",
            "DeliverymanName = ?",
            "Note = ?",
            "Direction = ?",
            "TableNumber = ?",
            "DeliveryPrice = ?"
        ];

        const updateValues = [
            body.clientId,
            body.clientName,
            body.type,
            body.deliverymanName || null,
            body.note || null,
            body.address || null,
            body.tableNumber || null,
            body.deliveryPrice ?? 0
        ];

        if (body.totalBs !== undefined) {
            updateFields.push("TotalBs = ?");
            updateValues.push(body.totalBs);
        }

        const updateSaleQuery = `UPDATE Sales SET ${updateFields.join(", ")} WHERE ID = ?`;
        const deleteOldProductsQuery = "DELETE FROM SaleDetails WHERE ID = ?";
        const productQuery = `INSERT INTO SaleDetails (ID, Name, Price, Quantity) VALUES (?, ?, ?, ?)`;
        const deletePaymentsQuery = "DELETE FROM PaymentRecords WHERE SaleID = ?";

        try {
            await db.beginTransaction();

            const detectSaleQuery = "SELECT 1 FROM Sales WHERE ID = ?";
            const [detectionResults] = await db.execute(detectSaleQuery, [id]);

            if (detectionResults.length === 0) {
                await db.rollback();
                res.status(404).json({ message: "No entry with such id" });
                return;
            }

            const updatePayload = [...updateValues, id];
            await db.execute(updateSaleQuery, updatePayload);

            await db.execute(deleteOldProductsQuery, [id]);
            if (products.length) {
                await Promise.all(
                    products.map((product) =>
                        db.execute(productQuery, [id, product.name, product.price, product.quantity])
                    )
                );
            }

            if (paymentDetail && Array.isArray(paymentDetail.selections) && paymentDetail.selections.length) {
                await db.execute(deletePaymentsQuery, [id]);
                await insertPaymentRecords(db, id, paymentDetail);
            }

            await db.commit();
            res.status(200).json({ message: "Sale successfully updated" });
        } catch (error) {
            try {
                await db.rollback();
            } catch (rollbackError) {
                console.error("Rollback failed while updating sale:", rollbackError);
            }
            console.error("Error updating sale:", error);
            res.status(500).json({ message: "Sale could not be updated", error: error.message });
        }
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
                Sum(sd.Quantity * sd.Price) + IFNULL(s.DeliveryPrice, 0) As Total,
                s.DeliveryPrice
            FROM 
                Sales s 
                INNER JOIN SaleDetails sd ON s.ID = sd.ID
            ${condition}
            GROUP BY
                s.ID, s.ClientIdDocument, s.ClientName, s.Type, s.DeliveryPrice
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
                Sum(sd.Quantity * sd.Price) + IFNULL(s.DeliveryPrice, 0) As Total,
                s.TableNumber,
                s.TotalBs,
                s.DeliveryPrice
            FROM 
                Sales s 
                INNER JOIN SaleDetails sd ON s.ID = sd.ID
            ${condition}
            GROUP BY
                s.ID, s.ClientIdDocument, s.ClientName, s.Type, s.TableNumber, s.TotalBs, s.DeliveryPrice
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

        const saleQuery = `
            SELECT 
                s.ID, 
                s.ClientIdDocument, 
                s.ClientName, 
                s.Type, 
                s.DeliverymanName, 
                s.Note,
                s.Direction AS Address,
                s.TableNumber,
                s.TotalBs,
                s.DeliveryPrice
            FROM Sales s
            WHERE s.ID = ?
        `;
        const [saleResult, saleFields] = await db.execute(saleQuery, id);

        if (saleResult.length === 0) {
            res.status(404).json({ message: "No entry with such id" });
            return;
        }

        const sale = saleResult[0];

        const detailsQuery = "SELECT Name, Price, Quantity FROM SaleDetails WHERE ID = ?";
        const [detailsResults, detailsFields] = await db.execute(detailsQuery, id);

        const paymentQuery = `
            SELECT 
                Method,
                AmountDollar,
                AmountBs,
                ReferenceNumber,
                HolderName,
                HolderEmail,
                CreatedAt
            FROM PaymentRecords
            WHERE SaleID = ?
            ORDER BY ID ASC
        `;
        const [paymentResults] = await db.execute(paymentQuery, id);

        sale.products = detailsResults;
        sale.paymentRecords = paymentResults;
        const paymentCount = paymentResults.length;
        sale.PaymentMethod = paymentCount === 0
            ? "Sin registro"
            : paymentCount === 1
                ? "Pago único"
                : "Pago mixto";

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

export async function getTablesStatus(req, res) {
    handleQueryExecution(res, async (db) => {
        const [results] = await db.execute("SELECT Name, Status, SaleID, TimerStart, DeliveryTimeSeconds FROM Tables ORDER BY Name ASC");
        res.status(200).json(results);
    });
}

export async function updateTableStatus(req, res) {
    handleQueryExecution(res, async (db) => {
        const name = req.params.name;
        const { status, saleId = null } = req.body;

        if (!status || !allowedTableStatuses.has(status)) {
            res.status(400).json({ message: "Invalid or missing status" });
            return;
        }

        const [existingRows] = await db.execute("SELECT Name, Status, SaleID, TimerStart FROM Tables WHERE Name = ?", [name]);

        if (existingRows.length === 0) {
            res.status(404).json({ message: "Table not found" });
            return;
        }

        const existing = existingRows[0];
        let newSaleId = (saleId !== undefined) ? saleId : existing.SaleID;
        let newTimerStart = existing.TimerStart;
        let newDeliveryTime = existing.DeliveryTimeSeconds;

        switch (status) {
            case "ocupada":
                newSaleId = saleId ?? null;
                newTimerStart = null;
                newDeliveryTime = null;
                break;
            case "ordenada":
                if (saleId !== undefined) {
                    newSaleId = saleId;
                }
                newTimerStart = new Date();
                newDeliveryTime = null;
                break;
            case "consumiendo":
                if (existing.TimerStart) {
                    const startDate = new Date(existing.TimerStart);
                    const elapsed = Math.max(0, Math.floor((Date.now() - startDate.getTime()) / 1000));
                    newDeliveryTime = elapsed;
                }
                newTimerStart = null;
                break;
            case "desocupada":
                newSaleId = null;
                newTimerStart = null;
                newDeliveryTime = null;
                break;
        }

        await db.execute(
            "UPDATE Tables SET Status = ?, SaleID = ?, TimerStart = ?, DeliveryTimeSeconds = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE Name = ?",
            [status, newSaleId, newTimerStart, newDeliveryTime, name]
        );

        const [updatedRows] = await db.execute("SELECT Name, Status, SaleID, TimerStart, DeliveryTimeSeconds FROM Tables WHERE Name = ?", [name]);
        res.status(200).json(updatedRows[0]);
    });
}

export async function moveTableOccupancy(req, res) {
    handleQueryExecution(res, async (db) => {
        const { fromName, toName } = req.body ?? {};

        if (!fromName || !toName || fromName === toName) {
            res.status(400).json({ message: "Both table names are required and must be different" });
            return;
        }

        const [fromRows] = await db.execute(
            "SELECT Name, Status, SaleID, TimerStart, DeliveryTimeSeconds FROM Tables WHERE Name = ?",
            [fromName]
        );
        if (fromRows.length === 0) {
            res.status(404).json({ message: "Source table not found" });
            return;
        }

        const [toRows] = await db.execute(
            "SELECT Name, Status, SaleID, TimerStart, DeliveryTimeSeconds FROM Tables WHERE Name = ?",
            [toName]
        );
        if (toRows.length === 0) {
            res.status(404).json({ message: "Destination table not found" });
            return;
        }

        const fromTable = fromRows[0];
        const toTable = toRows[0];

        if (fromTable.Status === "desocupada") {
            res.status(400).json({ message: "Source table is already free" });
            return;
        }

        if (toTable.Status !== "desocupada") {
            res.status(400).json({ message: "Destination table must be free" });
            return;
        }

        try {
            await db.beginTransaction();

            await db.execute(
                "UPDATE Tables SET Status = ?, SaleID = ?, TimerStart = ?, DeliveryTimeSeconds = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE Name = ?",
                ["desocupada", null, null, null, fromName]
            );

            await db.execute(
                "UPDATE Tables SET Status = ?, SaleID = ?, TimerStart = ?, DeliveryTimeSeconds = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE Name = ?",
                [fromTable.Status, fromTable.SaleID, fromTable.TimerStart, fromTable.DeliveryTimeSeconds, toName]
            );

            await db.commit();
        } catch (error) {
            await db.rollback();
            throw error;
        }

        const [updatedFromRows] = await db.execute(
            "SELECT Name, Status, SaleID, TimerStart, DeliveryTimeSeconds FROM Tables WHERE Name = ?",
            [fromName]
        );
        const [updatedToRows] = await db.execute(
            "SELECT Name, Status, SaleID, TimerStart, DeliveryTimeSeconds FROM Tables WHERE Name = ?",
            [toName]
        );

        res.status(200).json({
            from: updatedFromRows[0],
            to: updatedToRows[0]
        });
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
