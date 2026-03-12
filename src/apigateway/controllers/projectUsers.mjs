import { ProjectUser } from '../models/projectUser.mjs';

export const   createProjectUser = (req, res) => {
  ProjectUser.create(req.body, (err, projectUserId) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: projectUserId });
  });
};

 export const  getAllProjectUsers = (req, res) => {
  ProjectUser.getAll((err, projectUsers) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(projectUsers);
  });
};

export const   getProjectUsersByProjectId = (req, res) => {
  ProjectUser.getByProjectId(req.params.projectId, (err, projectUsers) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(projectUsers);
  });
};

export const   getProjectUsersByUserId = (req, res) => {
  ProjectUser.getByUserId(req.params.userId, (err, projectUsers) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(projectUsers);
  });
};

 export const  updateProjectUser = (req, res) => {
  ProjectUser.update(req.params.projectId, req.params.userId, req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Project user updated successfully' });
  });
};

export const   deleteProjectUser = (req, res) => {
  ProjectUser.delete(req.params.projectId, req.params.userId, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Project user deleted successfully' });
  });
};

export const projectUserController = {
  createProjectUser,
getAllProjectUsers,
getProjectUsersByProjectId,
getProjectUsersByUserId,
updateProjectUser,
deleteProjectUser

}

