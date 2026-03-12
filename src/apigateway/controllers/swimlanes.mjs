import { Swimlane } from '../models/swimlane.mjs';

export const createSwimlane = (req, res) => {
  Swimlane.create(req.body, (err, swimlaneId) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: swimlaneId });
  });
};

export const getAllSwimlanes = (req, res) => {
  Swimlane.getAll((err, swimlanes) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(swimlanes);
  });
};

export const getSwimlaneById = (req, res) => {
  Swimlane.getById(req.params.id, (err, swimlane) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!swimlane) return res.status(404).json({ error: 'Swimlane not found' });
    res.json(swimlane);
  });
};

export const getSwimlanesByProjectId = (req, res) => {
  Swimlane.getByProjectId(req.params.projectId, (err, swimlanes) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(swimlanes);
  });
};

export const updateSwimlane = (req, res) => {
  Swimlane.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Swimlane updated successfully' });
  });
};

export const deleteSwimlane = (req, res) => {
  Swimlane.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Swimlane deleted successfully' });
  });
};

export const swimlaneController = {
  createSwimlane,
  getAllSwimlanes,
  getSwimlaneById,
  getSwimlanesByProjectId,
  updateSwimlane,
  deleteSwimlane
}

