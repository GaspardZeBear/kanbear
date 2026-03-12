import express from 'express'
const router = express.Router();
import { swimlaneController } from '../controllers/swimlanes.mjs'

router.post('/', swimlaneController.createSwimlane);
router.get('/', swimlaneController.getAllSwimlanes);
router.get('/:id', swimlaneController.getSwimlaneById);
router.get('/project/:projectId', swimlaneController.getSwimlanesByProjectId);
router.put('/:id', swimlaneController.updateSwimlane);
router.delete('/:id', swimlaneController.deleteSwimlane);
export default router


