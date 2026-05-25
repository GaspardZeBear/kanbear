//!!!!!!!!!!!!! This module is not in use, replaced by calls to unifiedController


import {TaskComment } from '../models/taskComment.mjs';
import { Konsol } from '../classes/Konsol.mjs';

export const   createTaskComment = (req, res) => {
  TaskComment.create(req.body, (err, taskCommentId) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: taskCommentId });
  });
};

 export const  getAllTaskComments = (req, res) => {
  TaskComment.getAll((err, taskComments) => {
    if (err) return res.status(500).json({ error: err.message });
    Konsol.log("taskComments.getAllTaskComments()","taskComments=",taskComments)
    res.json(taskComments);
  });
};

export const   getTaskCommentById = (req, res) => {
  TaskComment.getById(req.params.id, (err, taskComment) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!taskComment) return res.status(404).json({ error: 'Task comment not found' });
    res.json(taskComment);
  });
};

export const getTaskCommentsByTaskId = (req, res) => {
  Konsol.log("taskCommentsController.getTaskCommentsByTaskId()","invokated")
  TaskComment.getByTaskId(req.params.taskId, (err, httpCode, taskComments) => {
    Konsol.log("taskCommentsController.getTaskCommentsByTaskId()","callback invokated","httpCode",httpCode)
    Konsol.log("taskCommentsController.getTaskCommentsByTaskId()","callback invokated","err",err)
    Konsol.log("taskCommentsController.getTaskCommentsByTaskId()","taskComments=",taskComments)
    if ( err ) {
      Konsol.log("taskCommentsController.getTaskCommentsByTaskId()","err=",err.message)
      return res.status(500).json({ error: err.message });
    }
    Konsol.log("taskCommentsController.getTaskCommentsByTaskId()","taskComments=",taskComments)
    res.json(taskComments);
  });
};

export const   XgetTaskCommentsByTaskId = (req, res) => {
  TaskComment.getByTaskId(req.params.taskId, (err, taskComments) => {
    if (err) return res.status(500).json({ error: err.message });
    Konsol.log("taskComments.getTaskCommentsByTaskId()","taskComments=",taskComments)
    res.json(taskComments);
  });
};


export const   updateTaskComment = (req, res) => {
  TaskComment.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Task comment updated successfully' });
  });
};

export const   deleteTaskComment = (req, res) => {
  TaskComment.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Task comment deleted successfully' });
  });
};

export const taskCommentController= {
  createTaskComment,
getAllTaskComments,
getTaskCommentById,
getTaskCommentsByTaskId,
updateTaskComment,
deleteTaskComment,


}

