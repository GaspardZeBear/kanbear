import express from 'express'
const router = express.Router();
import { workspaceController } from '../controllers/workspaces.mjs'

router.post('/', workspaceController.createWorkspace);
router.get('/', workspaceController.getAllWorkspaces);
router.get('/:id', workspaceController.getWorkspaceById);
router.put('/:id', workspaceController.updateWorkspace);
router.patch('/:id', workspaceController.patchWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

export default router

