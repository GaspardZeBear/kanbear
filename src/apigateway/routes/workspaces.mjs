import express from 'express'
const router = express.Router();
import { workspaceController } from '../controllers/workspaces.mjs'
import { UnifiedController } from '../controllers/UnifiedController.mjs';

//router.post('/', workspaceController.createWorkspace);
router.post('/', UnifiedController.getFunction('workspaces','create'))
//router.get('/', workspaceController.getAllWorkspaces);
router.get('/',UnifiedController.getFunction('workspaces','getAll'))
//router.get('/:id', workspaceController.getWorkspaceById);
router.get('/:id', UnifiedController.getFunction('workspaces','getById'));
//router.put('/:id', workspaceController.updateWorkspace);
router.put('/:id', UnifiedController.getFunction('workspaces','update'));
//router.patch('/:id', workspaceController.patchWorkspace);
router.patch('/:id', UnifiedController.getFunction('workspaces','patch'));
//router.delete('/:id', workspaceController.deleteWorkspace);
router.delete('/:id', UnifiedController.getFunction('workspaces','delete'));

export default router

