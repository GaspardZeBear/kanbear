import express from 'express'
const router = express.Router();
import { projectUserController } from '../controllers/projectUsers.mjs';

router.post('/', projectUserController.createProjectUser);
router.get('/', projectUserController.getAllProjectUsers);
router.get('/project/:projectId', projectUserController.getProjectUsersByProjectId);
router.get('/user/:userId', projectUserController.getProjectUsersByUserId);
router.put('/:projectId/:userId', projectUserController.updateProjectUser);
router.delete('/:projectId/:userId', projectUserController.deleteProjectUser);

export default router

