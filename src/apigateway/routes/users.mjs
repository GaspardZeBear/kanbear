import express from 'express'
const router = express.Router();
import { userController } from '../controllers/users.mjs';
import { UnifiedController } from '../controllers/UnifiedController.mjs';


//router.post('/', userController.createUser);
router.post('/', UnifiedController.getFunction('users','create'))
//router.get('/', userController.getAllUsers);
router.get('/', UnifiedController.getFunction('users','getAll'))
//router.get('/:id', userController.getUserById);
router.get('/:id', UnifiedController.getFunction('users','getById'))

// !!!!!!!!!!!!!!!!!!!!!!!!!!!
//router.get('/username/:username', userController.getUserByUsername);

//router.put('/:id', userController.updateUser);
router.put('/:id', UnifiedController.getFunction('users','update'))
router.patch('/:id', UnifiedController.getFunction('users','patch'))
//router.delete('/:id', userController.deleteUser);
router.delete('/:id', UnifiedController.getFunction('users','delete'))

export default router

