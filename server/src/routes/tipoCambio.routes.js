// server/src/routes/tipoCambio.routes.js
import { Router } from 'express';
import { obtenerTipoCambio, agregarTipoCambio } from '../controllers/tipoCambio.controller.js';

const router = Router();

router.get('/', obtenerTipoCambio);
router.post('/', agregarTipoCambio);

export default router;