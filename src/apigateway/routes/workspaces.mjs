import express from 'express'
const router = express.Router();
import { workspaceController } from '../controllers/workspaces.mjs'
import { UnifiedController } from '../controllers/UnifiedController.mjs';

router.post('/', workspaceController.createWorkspace);
//router.get('/', workspaceController.getAllWorkspaces);
router.get('/',UnifiedController.getFunction('workspaces','getAll','xxx'))
//router.get('/:id', workspaceController.getWorkspaceById);
router.get('/:id', UnifiedController.getFunction('workspaces','getById','xxx'));
router.put('/:id', workspaceController.updateWorkspace);
router.patch('/:id', workspaceController.patchWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

export default router

