import { db } from '../config/database.mjs'

class TaskComment {
  static create(taskComment, callback) {
    const { task_id, user_id, comment, reference } = taskComment;
    const date_created = Math.floor(Date.now() / 1000);
    const sql = 'INSERT INTO tasks_comments (task_id, user_id, date_created, comment, reference) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [task_id, user_id, date_created, comment, reference], function(err) {
      callback(err, this.lastID);
    });
  }

  static getAll(callback) {
    const sql = 'SELECT * FROM tasks_comments';
    db.all(sql, [], callback);
  }

  static getById(id, callback) {
    const sql = 'SELECT * FROM tasks_comments WHERE id = ?';
    db.get(sql, [id], callback);
  }

  static getByTaskId(taskId, callback) {
    const sql = 'SELECT * FROM tasks_comments WHERE task_id = ? ORDER BY date_created';
    db.all(sql, [taskId], callback);
  }

  static update(id, taskComment, callback) {
    const { comment, reference } = taskComment;
    const date_modified = Math.floor(Date.now() / 1000);
    const sql = 'UPDATE tasks_comments SET comment = ?, reference = ?, date_modified = ? WHERE id = ?';
    db.run(sql, [comment, reference, date_modified, id], callback);
  }

  static delete(id, callback) {
    const sql = 'DELETE FROM tasks_comments WHERE id = ?';
    db.run(sql, [id], callback);
  }
}

export {  TaskComment } 

