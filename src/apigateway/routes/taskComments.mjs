import express from 'express'
const router = express.Router();
import { taskCommentController} from '../controllers/taskComments.mjs';

router.post('/', taskCommentController.createTaskComment);
router.get('/', taskCommentController.getAllTaskComments);
router.get('/:id', taskCommentController.getTaskCommentById);
router.get('/task/:taskId', taskCommentController.getTaskCommentsByTaskId);
router.put('/:id', taskCommentController.updateTaskComment);
router.delete('/:id', taskCommentController.deleteTaskComment);

export default router

