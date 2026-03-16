import express from 'express'
const router = express.Router();
import { tagController } from '../controllers/tags.mjs';
import { UnifiedController } from '../controllers/UnifiedController.mjs';

//router.post('/', tagController.createTag);
router.post('/', UnifiedController.getFunction('tags','create'))
//router.get('/', tagController.getAllTags);
router.get('/', UnifiedController.getFunction('tags','getAll'))
//router.get('/:id', tagController.getTagById);
router.get('/:id', UnifiedController.getFunction('tags','getById'))

//router.get('/project/:projectId', tagController.getTagsByProjectId);

//router.put('/:id', tagController.updateTag);
router.put('/:id', UnifiedController.getFunction('tags','update'))
//router.patch('/:id', assigneeController.updateAssignee);
router.patch('/:id', UnifiedController.getFunction('tags','patch'))
//router.delete('/:id', tagController.deleteTag);
router.delete('/:id', UnifiedController.getFunction('tags','delete'))

export default router
