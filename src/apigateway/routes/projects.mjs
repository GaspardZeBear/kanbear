import express from 'express'
const router = express.Router();
import { projectController } from '../controllers/projects.mjs';

// Routes pour les projets
router.post('/', projectController.createProject);
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
export default router


