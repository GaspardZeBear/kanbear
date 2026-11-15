import express from 'express'
const router = express.Router();
//import { swimlaneController } from '../controllers/swimlanes.mjs'
import { UnifiedController } from '../controllers/UnifiedController.mjs';

//router.post('/', swimlaneController.createSwimlane);
router.post('/', UnifiedController.getFunction('groups','create'))
//router.get('/', swimlaneController.getAllgroups);
router.get('/', UnifiedController.getFunction('groups','getAll'))
//router.get('/:id', swimlaneController.getSwimlaneById);
router.get('/:id', UnifiedController.getFunction('groups','getById'))


// To be seen !!!!!!!!!!!!!!!!!!!!!
//router.get('/project/:projectId', swimlaneController.getgroupsByProjectId);
router.get('/users/:group_id', UnifiedController.getFunction('users_groups','getByForeignKey',{foreignKey:'group_id'}))

//router.put('/:id', swimlaneController.updateSwimlane);
router.put('/:id', UnifiedController.getFunction('groups','update'));

// Did not exist
router.patch('/:id', UnifiedController.getFunction('groups','patch'));
//router.delete('/:id', swimlaneController.deleteSwimlane);
router.delete('/:id', UnifiedController.getFunction('groups','delete'));
export default router


