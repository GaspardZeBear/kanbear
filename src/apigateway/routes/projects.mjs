import express from 'express'
const router = express.Router();
import { projectController } from '../controllers/projects.mjs';
import { UnifiedController } from '../controllers/UnifiedController.mjs';

// Routes pour les projets
//router.post('/', projectController.createProject);
router.post('/', UnifiedController.getFunction('projects','create'))
//router.get('/', projectController.getAllProjects);
router.get('/', UnifiedController.getFunction('projects','getAll'))
//router.get('/:id', projectController.getProjectById);
router.get('/:id', UnifiedController.getFunction('projects','getById'))
//router.put('/:id', projectController.updateProject);
router.put('/:id', UnifiedController.getFunction('projects','update'))
//router.delete('/:id', projectController.deleteProject);

// Did not exist
router.patch('/:id', UnifiedController.getFunction('projects','patch'));

router.delete('/:id', UnifiedController.getFunction('projects','delete'))
export default router


