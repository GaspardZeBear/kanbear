import {TaskHasTag} from '../models/taskHasTag.mjs';

export const   createTaskHasTag = (req, res) => {
  TaskHasTag.create(req.body, (err, taskHasTagId) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: taskHasTagId });
  });
};

export const   getAllTaskHasTags = (req, res) => {
  TaskHasTag.getAll((err, taskHasTags) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(taskHasTags);
  });
};

export const   getTaskHasTagsByTaskId = (req, res) => {
  TaskHasTag.getByTaskId(req.params.taskId, (err, taskHasTags) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(taskHasTags);
  });
};

export const   getTaskHasTagsByTagId = (req, res) => {
  TaskHasTag.getByTagId(req.params.tagId, (err, taskHasTags) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(taskHasTags);
  });
};

export const   deleteTaskHasTag = (req, res) => {
  TaskHasTag.delete(req.params.taskId, req.params.tagId, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'TaskHasTag deleted successfully' });
  });
};

export const taskHasTagController = {
  createTaskHasTag,
getAllTaskHasTags,
getTaskHasTagsByTaskId,
getTaskHasTagsByTagId,
deleteTaskHasTag,

}
