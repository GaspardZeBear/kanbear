import {Project } from'../models/project.mjs';

 export const  createProject = (req, res) => {
  Project.create(req.body, (err, projectId) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: projectId });
  });
};

export const   getAllProjects = (req, res) => {
  Project.getAll((err, projects) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(projects);
  });
};

export const   getProjectById = (req, res) => {
  Project.getById(req.params.id, (err, project) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  });
};

export const   updateProject = (req, res) => {
  Project.update(req.params.id, req.body, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Project updated successfully' });
  });
};

export const   deleteProject = (req, res) => {
  Project.delete(req.params.id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Project deleted successfully' });
  });
};

export const projectController = {
createProject,
getAllProjects,
getProjectById,
updateProject,
deleteProject,

}
