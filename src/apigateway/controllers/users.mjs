 import { User } from '../models/user.mjs';

export const   createUser = (req, res) => {
  User.create(req.body, (err, userId) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: userId });
  });
};

export const   getAllUsers = (req, res) => {
  User.getAll((err, users) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(users);
  });
};

export const   getUserById = (req, res) => {
  User.getById(req.params.id, (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
};

export const   getUserByUsername = (req, res) => {
  User.getByUsername(req.params.username, (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
};

 export const  updateUser = (req, res) => {
  User.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User updated successfully' });
  });
};

 export const  deleteUser = (req, res) => {
  User.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted successfully' });
  });
};

export const userController = {
  createUser,
getAllUsers,
getUserById,
getUserByUsername,
updateUser,
deleteUser,


}

