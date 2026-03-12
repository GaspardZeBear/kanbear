import { Task } from '../models/task.mjs';

export const   createTask = (req, res) => {
  Task.create(req.body, (err, taskId) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: taskId });
  });
};

 export const  getAllTasks = (req, res) => {
  Task.getAll((err, tasks) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(tasks);
  });
};

export const   getTaskById = (req, res) => {
  Task.getById(req.params.id, (err, task) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  });
};

export const   updateTask = (req, res) => {
  Task.update(req.params.id, req.body, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Task updated successfully' });
  });
};

 export const  deleteTask = (req, res) => {
  Task.delete(req.params.id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Task deleted successfully' });
  });
};

export const taskController = {
  createTask,
getAllTasks,
getTaskById,
updateTask,
deleteTask,


}

