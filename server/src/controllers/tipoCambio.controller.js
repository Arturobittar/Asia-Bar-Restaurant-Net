import handleQueryExecution from '../libs/handleQueryExecution.js';

/**
 * Obtiene el último tipo de cambio registrado (el más reciente por ID)
 */
export const obtenerTipoCambio = async (req, res) => {
    handleQueryExecution(res, async (db) => {
        const [rows] = await db.execute(
            'SELECT Tasa, FechaActualizacion FROM TipoCambio ORDER BY ID DESC LIMIT 1'
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay tipo de cambio registrado. Por favor, agregue uno primero.'
            });
        }
        
        res.json({
            success: true,
            tasa: rows[0].Tasa,
            fecha: rows[0].FechaActualizacion
        });
    });
};

/**
 * Agrega un nuevo tipo de cambio a la tabla
 * La fecha se registra automáticamente por la BD
 */
export const agregarTipoCambio = async (req, res) => {
    const { tasa } = req.body;
    
    // Validar que la tasa sea un número válido
    if (!tasa || isNaN(tasa) || tasa <= 0) {
        return res.status(400).json({
            success: false,
            message: 'La tasa debe ser un número mayor a 0'
        });
    }
    
    handleQueryExecution(res, async (db) => {
        // Insertar nuevo tipo de cambio (la fecha se maneja automáticamente)
        await db.execute(
            'INSERT INTO TipoCambio (Tasa) VALUES (?)',
            [tasa]
        );
        
        res.json({
            success: true,
            message: 'Tipo de cambio actualizado correctamente'
        });
    });
};