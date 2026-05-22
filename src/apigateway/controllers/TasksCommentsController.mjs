import { TaskComment } from '../models/taskComment.mjs';
import { Konsol } from '../classes/Konsol.mjs';

class TasksCommentsController {

  //----------------------------------------------------------------------------------------
  createTaskComment() {
    return (
      (req, res) => {
        TaskComment.create(req.body, (err, taskCommentId) => {
          Konsol.log("TasksComments.create()", "err=", err, "<taskCommentId>", taskCommentId)
          if (!taskCommentId) return res.status(500).json({ error: err.message });
          res.status(201).json({ id: taskCommentId });
        })
      })
  }

  //----------------------------------------------------------------------------------------
  getAllTaskComments() {
    return ((req, res) => {
      TaskComment.getAll((err, httpCode, taskComments) => {
        if (err) return res.status(500).json({ error: err.message });
        Konsol.log("TasksComments.getAllTaskComments()", "taskComments=", taskComments)
        res.json(taskComments);
      })
    })
  }

  //----------------------------------------------------------------------------------------
  getTaskCommentById() {
    return ((req, res) => {
      TaskComment.getById(req.params.id, (err, httpCode, taskComment) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!taskComment) return res.status(404).json({ error: 'Task comment not found' });
        res.json(taskComment);
      })
    })
  }

  //----------------------------------------------------------------------------------------
  getTaskCommentsByTaskId() {
    return ((req, res) => {
      Konsol.log("taskCommentsController.getTaskCommentsByTaskId()", "invokated")
      TaskComment.getByTaskId(req.params.taskId, (err, httpCode, taskComments) => {
        Konsol.log("TasksCommentsController.getTaskCommentsByTaskId()", "callback invokated", "httpCode", httpCode)
        Konsol.log("TasksCommentsController.getTaskCommentsByTaskId()", "callback invokated", "err", err)
        Konsol.log("TasksCommentsController.getTaskCommentsByTaskId()", "taskComments=", taskComments)
        if (err) {
          Konsol.log("taskCommentsController.getTaskCommentsByTaskId()", "err=", err.message)
          return res.status(500).json({ error: err.message });
        }
        Konsol.log("taskCommentsController.getTaskCommentsByTaskId()", "taskComments=", taskComments)
        res.json(taskComments);
      })
    })
  }

  //----------------------------------------------------------------------------------------
  updateTaskComment() {
    return ((req, res) => {
      TaskComment.update(req.params.id, req.body, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Task comment updated successfully' });
      })
    })
  }

  //----------------------------------------------------------------------------------------
  deleteTaskComment() {
    return ((req, res) => {
      TaskComment.delete(req.params.id, (err, httpCode) => {
        Konsol.log("TasksCommentsController.deleteTaskComment()", "err=", err)
        Konsol.log("TasksCommentsController.deleteTaskComment()", "httpCode=", httpCode)
        //if (err) {
          return res.status(httpCode).json(err.message)
        //}
        //if (err) return res.status(500).json({ error: err.message });
        //res.json({ message: 'Task comment deleted successfully' });
      })
    })
  }

}
export { TasksCommentsController }

