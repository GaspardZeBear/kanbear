import { Konsol } from 'konsol';
import { UserGroup } from '../models/userGroup.mjs';

export const createUserGroup = (req, res) => {
  UserGroup.create(req.body, (err, resp) => {
    console.log("createUserGroup fired","err",err,"resp",resp)
    if (!err) return res.status(500).json({ error: resp.message });
    res.status(201).json({ id: err.lastInsertRowid });
  });
};

export const getAllUserGroups = (req, res) => {
  UserGroup.getAll((err, userGroups) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(userGroups);
  });
};

export const getUserGroupsByGroupId = (req, res) => {
  UserGroup.getByGroupId(req.params.groupId, (err, userGroups) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(userGroups);
  });
};

export const getUserGroupsByUserId = (req, res) => {
  UserGroup.getByUserId(req.params.userId, (err, userGroups) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(userGroups);
  });
};

export const deleteUserGroup = (req, res) => {
  UserGroup.delete(req.params.id, (err) => {
    console.log("deleteUserGroup fired",err)
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Group user deleted successfully' });
  });
};

export const userGroupsController = {
  createUserGroup,
  getAllUserGroups,
  getUserGroupsByGroupId,
  getUserGroupsByUserId,
  deleteUserGroup

}

