import express from 'express'
const router = express.Router();
import { taskHasTagController } from '../controllers/taskHasTags.mjs';

router.post('/', taskHasTagController.createTaskHasTag);
router.get('/', taskHasTagController.getAllTaskHasTags);
router.get('/task/:taskId', taskHasTagController.getTaskHasTagsByTaskId);
router.get('/tag/:tagId', taskHasTagController.getTaskHasTagsByTagId);
router.delete('/:taskId/:tagId', taskHasTagController.deleteTaskHasTag);

export default router

