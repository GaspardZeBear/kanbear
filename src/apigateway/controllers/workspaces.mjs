import { Workspace } from '../models/workspace.mjs';

export const   createWorkspace = (req, res) => {
  Workspace.create(req.body, (err, workspaceId) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: workspaceId });
  });
};

export const   getAllWorkspaces = (req, res) => {
  Workspace.getAll((err, workspaces) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(workspaces);
  });
};

export const   getWorkspaceById = (req, res) => {
  Workspace.getById(req.params.id, (err, workspace) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    res.json(workspace);
  });
};

export const   updateWorkspace = (req, res) => {
  Workspace.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Workspace updated successfully' });
  });
};

export const   deleteWorkspace = (req, res) => {
  Workspace.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Workspace deleted successfully' });
  });
};

export const workspaceController = {
  createWorkspace,
getAllWorkspaces,
getWorkspaceById,
updateWorkspace,
deleteWorkspace,


}

