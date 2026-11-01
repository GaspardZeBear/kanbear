import express from 'express'
const router = express.Router();

//import { TasksCommentsController} from '../controllers/TasksCommentsController.mjs'
import { UnifiedController } from '../controllers/UnifiedController.mjs';


router.post('/', UnifiedController.getFunction('workspaces_rights','create'))
router.get('/', UnifiedController.getFunction('workspaces_rights','getAll'))
router.get('/:id', UnifiedController.getFunction('workspaces_rights','getById'))
router.get('/user/:owner_id', UnifiedController.getFunction('workspaces_rights','getWorkspacesRightsByUserid'))
router.get('/group/:owner_id', UnifiedController.getFunction('workspaces_rights','getWorkspacesRightsByGroupid'))
router.patch('/:id', UnifiedController.getFunction('workspaces_rights','patch'))
router.delete('/:id', UnifiedController.getFunction('workspaces_rights','delete'))


export default router

