import express from 'express'
const router = express.Router();

import { TasksCommentsController} from '../controllers/TasksCommentsController.mjs'
router.post('/', new TasksCommentsController().createTaskComment());
router.get('/', new TasksCommentsController().getAllTaskComments());
router.get('/:id', new TasksCommentsController().getTaskCommentById());
router.get('/task/:taskId', new  TasksCommentsController().getTaskCommentsByTaskId());
router.put('/:id', new TasksCommentsController().updateTaskComment());
router.delete('/:id', new  TasksCommentsController().deleteTaskComment());

/*
import { taskCommentController} from '../controllers/taskComments.mjs';
router.post('/', taskCommentController.createTaskComment);
router.get('/', taskCommentController.getAllTaskComments);
router.get('/:id', taskCommentController.getTaskCommentById);
router.get('/task/:taskId', taskCommentController.getTaskCommentsByTaskId);
router.put('/:id', taskCommentController.updateTaskComment);
router.delete('/:id', taskCommentController.deleteTaskComment);
*/

export default router

