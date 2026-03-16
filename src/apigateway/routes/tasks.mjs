import express from 'express'
const router = express.Router();
import { taskController } from '../controllers/tasks.mjs';
import { UnifiedController } from '../controllers/UnifiedController.mjs';

// Routes pour les tâches
//router.post('/', taskController.createTask);
router.post('/', UnifiedController.getFunction('tasks','create'))
//router.get('/', taskController.getAllTasks);
router.get('/', UnifiedController.getFunction('tasks','getAll'))
//router.get('/:id', taskController.getTaskById);
router.get('/:id', UnifiedController.getFunction('tasks','getById'))
//router.put('/:id', taskController.updateTask);
router.put('/:id', UnifiedController.getFunction('tasks','update'))
//router.patch('/:id', assigneeController.updateAssignee);
router.patch('/:id', UnifiedController.getFunction('tasks','patch'))
//router.delete('/:id', taskController.deleteTask);
router.delete('/:id', UnifiedController.getFunction('tasks','delete'))

export default router



