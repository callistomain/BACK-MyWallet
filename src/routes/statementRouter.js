import { Router } from 'express';
import { sessionDelete, statementDelete, statementGet, statementPost, statementPut } from '../controllers/statementController.js';
import { dataSchemaValidation } from '../middlewares/dataSchemaValidationMiddleware.js';
import { tokenValidation } from '../middlewares/tokenValidationMiddleware.js';
const router = Router();

router.use(tokenValidation);
router.get('/statement', statementGet);
router.post('/statement', dataSchemaValidation, statementPost);
router.put('/statement/:id', dataSchemaValidation, statementPut);
router.delete('/statement/:id', statementDelete);
router.delete('/sessions', sessionDelete);

export default router;