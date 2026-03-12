import { db } from '../config/database.mjs'

class TaskHasTag {
  static create(taskHasTag, callback) {
    const { task_id, tag_id } = taskHasTag;
    const sql = 'INSERT INTO task_has_tags (task_id, tag_id) VALUES (?, ?)';
    db.run(sql, [task_id, tag_id], function(err) {
      callback(err, this.lastID);
    });
  }

  static getAll(callback) {
    const sql = 'SELECT * FROM task_has_tags';
    db.all(sql, [], callback);
  }

  static getByTaskId(taskId, callback) {
    const sql = 'SELECT * FROM task_has_tags WHERE task_id = ?';
    db.all(sql, [taskId], callback);
  }

  static getByTagId(tagId, callback) {
    const sql = 'SELECT * FROM task_has_tags WHERE tag_id = ?';
    db.all(sql, [tagId], callback);
  }

  static delete(taskId, tagId, callback) {
    const sql = 'DELETE FROM task_has_tags WHERE task_id = ? AND tag_id = ?';
    db.run(sql, [taskId, tagId], callback);
  }
}

export {  TaskHasTag } 

