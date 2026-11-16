import express from 'express'
const router = express.Router();
import { userGroupsController } from '../controllers/userGroups.mjs';
import { UnifiedController } from '../controllers/UnifiedController.mjs';

// Not a single id, ! Unified.model cannot apply at this time
// old --router.post('/', userGroupsController.createUserGroup);
router.post('/', UnifiedController.getFunction('users_groups','create'));



// --old router.get('/', userGroupsController.getAllUserGroups)
router.get('/', UnifiedController.getFunction('users_groups','getAll'));
//router.get('/group/:groupId', userGroupsController.getUserGroupsByGroupId);
//router.get('/user/:userId', userGroupsController.getUserGroupsByUserId);
//router.put('/:userId/:groupId', userGroupsController.updateUserGroups);

// -old router.delete('/:id', userGroupsController.deleteUserGroup);
router.delete('/:id', UnifiedController.getFunction('users_groups','delete'));

export default router

