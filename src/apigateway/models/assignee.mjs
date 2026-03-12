import { db } from '../config/database.mjs'

class Assignee {
  static create(assignee, callback) {
    const { name, description } = assignee;
    const sql = 'INSERT INTO assignees (name, description) VALUES (?, ?)';
    db.run(sql, [name, description], function(err) {
      callback(err, this.lastID);
    });
  }

  static getAll(callback) {
    const sql = 'SELECT * FROM assignees';
    db.all(sql, [], callback);
  }

  static getById(id, callback) {
    const sql = 'SELECT * FROM assignees WHERE id = ?';
    db.get(sql, [id], callback);
  }

  static update(id, assignee, callback) {
    const { name, description } = assignee;
    const sql = 'UPDATE assignees SET name = ?, description = ? WHERE id = ?';
    db.run(sql, [name, description, id], callback);
  }

  static delete(id, callback) {
    const sql = 'DELETE FROM assignees WHERE id = ?';
    db.run(sql, [id], callback);
  }
}

export {  Assignee } 

