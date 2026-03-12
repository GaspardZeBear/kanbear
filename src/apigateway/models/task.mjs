import { db } from '../config/database.mjs'

class Task {
  static create(task, callback) {
    const { title, description, note, color, project_id, column_id, creator_id, assignee_id, position, swimlane_id } = task;
    const date_created = Math.floor(Date.now() / 1000);

    const sql = `
      INSERT INTO tasks (
        title, description, note, color, project_id, column_id, creator_id, assignee_id,
        position, swimlane_id, date_created
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      title, description, note, color, project_id, column_id, creator_id, assignee_id,
      position, swimlane_id, date_created
    ], function(err) {
      callback(err, this.lastID);
    });
  }

  static getAll(callback) {
    const sql = 'SELECT * FROM tasks';
    db.all(sql, [], callback);
  }

  static getById(id, callback) {
    const sql = 'SELECT * FROM tasks WHERE id = ?';
    db.get(sql, [id], callback);
  }

  static update(id, task, callback) {
    const { title, description, note, color, project_id, column_id, creator_id, assignee_id, position, swimlane_id } = task;
    const date_modified = Math.floor(Date.now() / 1000);

    const sql = `
      UPDATE tasks SET
        title = ?, description = ?, note = ?, color = ?, project_id = ?, column_id = ?,
        creator_id = ?, assignee_id = ?, position = ?, swimlane_id = ?, date_modified = ?
      WHERE id = ?
    `;

    db.run(sql, [
      title, description, note, color, project_id, column_id, creator_id, assignee_id,
      position, swimlane_id, date_modified, id
    ], callback);
  }

  static delete(id, callback) {
    const sql = 'DELETE FROM tasks WHERE id = ?';
    db.run(sql, [id], callback);
  }
}

export {  Task } 

