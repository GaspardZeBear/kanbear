import express from 'express'
const router = express.Router();
import { userGroupsController } from '../controllers/userGroups.mjs';
import { UnifiedController } from '../controllers/UnifiedController.mjs';

// Not a single id, ! Unified.model cannot apply at this time
router.post('/', userGroupsController.createUserGroup);
router.get('/', userGroupsController.getAllUserGroups);
router.get('/group/:groupId', userGroupsController.getUserGroupsByGroupId);
router.get('/user/:userId', userGroupsController.getUserGroupsByUserId);
//router.put('/:userId/:groupId', userGroupsController.updateUserGroups);
router.delete('/:userId/:groupId', userGroupsController.deleteUserGroup);

export default router

