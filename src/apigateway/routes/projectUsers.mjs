import express from 'express'
const router = express.Router();
import { projectUserController } from '../controllers/projectUsers.mjs';
import { UnifiedController } from '../controllers/UnifiedController.mjs';

// Not a single id, ! Unified.model cannot apply at this time
router.post('/', projectUserController.createProjectUser);
router.get('/', projectUserController.getAllProjectUsers);
router.get('/project/:projectId', projectUserController.getProjectUsersByProjectId);
router.get('/user/:userId', projectUserController.getProjectUsersByUserId);
router.put('/:projectId/:userId', projectUserController.updateProjectUser);
router.delete('/:projectId/:userId', projectUserController.deleteProjectUser);


// Examine later 
//router.post('/', UnifiedController.getFunction('projects_users','create'))
//router.get('/', UnifiedController.getFunction('projects_users','getAll'))
//router.get('/:id', UnifiedController.getFunction('projects_users','getById'))
//router.get('/user/:projectId', UnifiedController.getFunction('columns','getByForeignKey',{foreignKey:'project_id',sortColumn:'position'}))
//router.put('/:id', UnifiedController.getFunction('projects_users','update'))
//router.patch('/:id', UnifiedController.getFunction('projects_users','patch'))
//router.delete('/:id', UnifiedController.getFunction('projects_users','delete'))

export default router

