import express from 'express'
const router = express.Router();
import { columnController } from '../controllers/columns.mjs';
import { UnifiedController } from '../controllers/UnifiedController.mjs';

//router.post('/', columnController.createColumn);
router.post('/', UnifiedController.getFunction('columns','create'))
//router.get('/', columnController.getAllColumns);
router.get('/', UnifiedController.getFunction('columns','getAll'))
//router.get('/:id', columnController.getColumnById);
router.get('/', UnifiedController.getFunction('columns','getById'))
//router.get('/project/:projectId', columnController.getColumnsByProjectId);
router.get('/columns/:projectId', UnifiedController.getFunction('columns','getByForeignKey',{foreignKey:'project_id',sortColumn:'position'}))
//router.put('/:id', columnController.updateColumn);
router.put('/', UnifiedController.getFunction('columns','update'))
router.patch('/', UnifiedController.getFunction('columns','patch'))
//router.delete('/:id', columnController.deleteColumn);
router.delete('/:id', UnifiedController.getFunction('columns','delete'))
export default router



