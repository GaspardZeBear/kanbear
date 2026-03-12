import express from 'express'
const router = express.Router();
import { tagController } from '../controllers/tags.mjs';

router.post('/', tagController.createTag);
router.get('/', tagController.getAllTags);
router.get('/:id', tagController.getTagById);
router.get('/project/:projectId', tagController.getTagsByProjectId);
router.put('/:id', tagController.updateTag);
router.delete('/:id', tagController.deleteTag);

export default router

