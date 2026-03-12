import express from 'express'
import { assigneeController } from '../controllers/assignees.mjs';
const router = express.Router();


router.post('/', assigneeController.createAssignee);
router.get('/', assigneeController.getAllAssignees);
router.get('/:id', assigneeController.getAssigneeById);
router.put('/:id', assigneeController.updateAssignee);
router.delete('/:id', assigneeController.deleteAssignee);
export default router


