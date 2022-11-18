import { Router } from 'express';
import { statementGet, statementPost } from '../controllers/statementController.js';
import { dataSchemaValidation } from '../middlewares/dataSchemaValidationMiddleware.js';
import { tokenValidation } from '../middlewares/tokenValidationMiddleware.js';
const router = Router();

router.use(tokenValidation);
router.get('/statement', statementGet);
router.post('/statement', dataSchemaValidation, statementPost);

export default router;