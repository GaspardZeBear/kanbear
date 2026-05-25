import express from 'express'
const router = express.Router();

//import { TasksCommentsController} from '../controllers/TasksCommentsController.mjs'
import { UnifiedController } from '../controllers/UnifiedController.mjs';


//router.post('/', new TasksCommentsController().createTaskComment());
router.post('/', UnifiedController.getFunction('tasks_comments','create'))

//router.get('/', new TasksCommentsController().getAllTaskComments());
router.get('/', UnifiedController.getFunction('tasks_comments','getAll'))

//router.get('/:id', new TasksCommentsController().getTaskCommentById());
router.get('/:id', UnifiedController.getFunction('tasks_comments','getById'))

//router.get('/task/:taskId', new  TasksCommentsController().getTaskCommentsByTaskId());
router.get('/task/:task_id', UnifiedController.getFunction('tasks_comments','getByForeignKey'))

//router.put('/:id', new TasksCommentsController().updateTaskComment());
router.patch('/:id', UnifiedController.getFunction('tasks_comments','patch'))

//router.delete('/:id', new  TasksCommentsController().deleteTaskComment());
router.delete('/:id', UnifiedController.getFunction('tasks_comments','delete'))

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

