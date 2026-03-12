import express from 'express'
const router = express.Router();
import { taskController } from '../controllers/tasks.mjs';

// Routes pour les tâches
router.post('/', taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router

