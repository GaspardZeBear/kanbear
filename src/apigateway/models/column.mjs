import { db } from '../config/database.mjs'

class Column {
  static create(column, callback) {
    const { title, position, project_id, description } = column;
    const sql = 'INSERT INTO columns (title, position, project_id, description) VALUES (?, ?, ?, ?)';
    db.run(sql, [title, position, project_id, description], function(err) {
      callback(err, this.lastID);
    });
  }

  static getAll(callback) {
    const sql = 'SELECT * FROM columns';
    db.all(sql, [], callback);
  }

  static getById(id, callback) {
    const sql = 'SELECT * FROM columns WHERE id = ?';
    db.get(sql, [id], callback);
  }

  static getByProjectId(projectId, callback) {
    const sql = 'SELECT * FROM columns WHERE project_id = ? ORDER BY position';
    db.all(sql, [projectId], callback);
  }

  static update(id, column, callback) {
    const { title, position, project_id, description } = column;
    const sql = 'UPDATE columns SET title = ?, position = ?, project_id = ?, description = ? WHERE id = ?';
    db.run(sql, [title, position, project_id, description, id], callback);
  }

  static delete(id, callback) {
    const sql = 'DELETE FROM columns WHERE id = ?';
    db.run(sql, [id], callback);
  }
}

export {  Column } 

