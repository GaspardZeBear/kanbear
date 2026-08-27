import express from 'express'
const router = express.Router();

//import { TasksCommentsController} from '../controllers/TasksCommentsController.mjs'
import { UnifiedController } from '../controllers/UnifiedController.mjs';


router.post('/', UnifiedController.getFunction('workspaces_rights','create'))
router.get('/', UnifiedController.getFunction('workspaces_rights','getAll'))
router.get('/:id', UnifiedController.getFunction('workspaces_rights','getById'))
router.get('/user/:user_id', UnifiedController.getFunction('workspaces_rights','getWorkspacesRightsByUserid'))
router.patch('/:id', UnifiedController.getFunction('workspaces_rights','patch'))
router.delete('/:id', UnifiedController.getFunction('workspaces_rights','delete'))


export default router

