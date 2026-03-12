import {Assignee} from '../models/assignee.mjs';

export const  createAssignee = (req, res) => {
  Assignee.create(req.body, (err, assigneeId) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: assigneeId });
  });
};

export const   getAllAssignees = (req, res) => {
  Assignee.getAll((err, assignees) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(assignees);
  });
};

export const   getAssigneeById = (req, res) => {
  Assignee.getById(req.params.id, (err, assignee) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!assignee) return res.status(404).json({ error: 'Assignee not found' });
    res.json(assignee);
  });
};

export const   updateAssignee = (req, res) => {
  Assignee.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Assignee updated successfully' });
  });
};

 export const  deleteAssignee = (req, res) => {
  Assignee.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Assignee deleted successfully' });
  });
};

export const assigneeController = {
createAssignee,
getAllAssignees,
getAssigneeById,
updateAssignee,
deleteAssignee

}


