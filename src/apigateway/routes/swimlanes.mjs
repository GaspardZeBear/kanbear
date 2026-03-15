import express from 'express'
const router = express.Router();
import { swimlaneController } from '../controllers/swimlanes.mjs'
import { UnifiedController } from '../controllers/UnifiedController.mjs';

//router.post('/', swimlaneController.createSwimlane);
router.post('/', UnifiedController.getFunction('swimlanes','create'))
//router.get('/', swimlaneController.getAllSwimlanes);
router.get('/', UnifiedController.getFunction('swimlanes','getAll'))
//router.get('/:id', swimlaneController.getSwimlaneById);
router.get('/', UnifiedController.getFunction('swimlanes','getById'))


// To be seen !!!!!!!!!!!!!!!!!!!!!
//router.get('/project/:projectId', swimlaneController.getSwimlanesByProjectId);
router.get('/project/:projectId', UnifiedController.getFunction('swimlanes','getByForeignKey',{foreignKey:'project_id',sortColumn:'position'}))

//router.put('/:id', swimlaneController.updateSwimlane);
router.put('/:id', UnifiedController.getFunction('swimlanes','update'));

// Did not exist
router.patch('/:id', UnifiedController.getFunction('swimlanes','patch'));
//router.delete('/:id', swimlaneController.deleteSwimlane);
router.delete('/:id', UnifiedController.getFunction('swimlanes','delete'));
export default router


