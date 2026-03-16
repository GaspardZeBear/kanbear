import express from 'express'
import { assigneeController } from '../controllers/assignees.mjs';
import { UnifiedController } from '../controllers/UnifiedController.mjs';
const router = express.Router();


//router.post('/', assigneeController.createAssignee);
router.post('/', UnifiedController.getFunction('assignees','create'))
//router.get('/', assigneeController.getAllAssignees);
router.get('/', UnifiedController.getFunction('assignees','getAll'))
//router.get('/:id', assigneeController.getAssigneeById);
router.get('/:id', UnifiedController.getFunction('assignees','getById'))
//router.put('/:id', assigneeController.updateAssignee);
router.put('/:id', UnifiedController.getFunction('assignees','update'))
//router.patch('/:id', assigneeController.updateAssignee);
router.patch('/:id', UnifiedController.getFunction('assignees','patch'))
//router.delete('/:id', assigneeController.deleteAssignee);
router.delete('/:id', UnifiedController.getFunction('assignees','delete'))
export default router


