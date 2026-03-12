import express from 'express'
const router = express.Router();
import { columnController } from '../controllers/columns.mjs';

router.post('/', columnController.createColumn);
router.get('/', columnController.getAllColumns);
router.get('/:id', columnController.getColumnById);
router.get('/project/:projectId', columnController.getColumnsByProjectId);
router.put('/:id', columnController.updateColumn);
router.delete('/:id', columnController.deleteColumn);
export default router



