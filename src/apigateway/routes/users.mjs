import express from 'express'
const router = express.Router();
import { userController } from '../controllers/users.mjs';

router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.get('/username/:username', userController.getUserByUsername);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router

