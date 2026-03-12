import { db } from '../config/database.mjs'

class Project {
  static create(project, callback) {
    const { name, workspace_id, is_open } = project;
    const sql = 'INSERT INTO projects (name, workspace_id, is_open) VALUES (?, ?, ?)';
    db.run(sql, [name, workspace_id, is_open], function(err) {
      callback(err, this.lastID);
    });
  }

  static getAll(callback) {
    const sql = 'SELECT * FROM projects';
    db.all(sql, [], callback);
  }

  static getById(id, callback) {
    const sql = 'SELECT * FROM projects WHERE id = ?';
    db.get(sql, [id], callback);
  }

  static update(id, project, callback) {
    const { name, workspace_id, is_open } = project;
    const sql = 'UPDATE projects SET name = ?, workspace_id = ?, is_open = ? WHERE id = ?';
    db.run(sql, [name, workspace_id, is_open, id], callback);
  }

  static delete(id, callback) {
    const sql = 'DELETE FROM projects WHERE id = ?';
    db.run(sql, [id], callback);
  }
}

export {  Project } 

