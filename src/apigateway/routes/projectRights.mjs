import express from 'express'
const router = express.Router();

//import { TasksCommentsController} from '../controllers/TasksCommentsController.mjs'
import { UnifiedController } from '../controllers/UnifiedController.mjs';


router.post('/', UnifiedController.getFunction('projects_rights','create'))
router.get('/', UnifiedController.getFunction('projects_rights','getAll'))
router.get('/:id', UnifiedController.getFunction('projects_rights','getById'))
router.get('/user/:user_id', UnifiedController.getFunction('projects_rights','getProjectsRightsByUserid'))
router.patch('/:id', UnifiedController.getFunction('projects_rights','patch'))
router.delete('/:id', UnifiedController.getFunction('projects_rights','delete'))


export default router

