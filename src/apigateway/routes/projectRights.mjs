import express from 'express'
const router = express.Router();

//import { TasksCommentsController} from '../controllers/TasksCommentsController.mjs'
import { UnifiedController } from '../controllers/UnifiedController.mjs';


router.post('/', UnifiedController.getFunction('rights','create'))
router.get('/', UnifiedController.getFunction('rights','getAll'))
router.get('/:id', UnifiedController.getFunction('rights','getById'))
router.get('/user/:owner_id', UnifiedController.getFunction('rights','getRightsByUserid'))
router.get('/group/:owner_id', UnifiedController.getFunction('rights','getRightsByGroupid'))
router.patch('/:id', UnifiedController.getFunction('rights','patch'))
router.delete('/:id', UnifiedController.getFunction('rights','delete'))


export default router

