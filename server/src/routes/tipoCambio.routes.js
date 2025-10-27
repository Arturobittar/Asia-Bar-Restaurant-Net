import { Router } from 'express';
import { obtenerTipoCambio, agregarTipoCambio } from '../controllers/tipoCambio.controller.js';

const tipoCambioRouter = Router();

tipoCambioRouter.get('/tipo-cambio', obtenerTipoCambio);
tipoCambioRouter.post('/tipo-cambio', agregarTipoCambio);

export default tipoCambioRouter;