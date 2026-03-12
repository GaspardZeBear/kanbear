import { db } from '../config/database.mjs'

class Swimlane {
  static create(swimlane, callback) {
    const { name, position, is_active, project_id, description } = swimlane;
    const sql = 'INSERT INTO swimlanes (name, position, is_active, project_id, description) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [name, position, is_active, project_id, description], function(err) {
      callback(err, this.lastID);
    });
  }

  static getAll(callback) {
    const sql = 'SELECT * FROM swimlanes';
    db.all(sql, [], callback);
  }

  static getById(id, callback) {
    const sql = 'SELECT * FROM swimlanes WHERE id = ?';
    db.get(sql, [id], callback);
  }

  static getByProjectId(projectId, callback) {
    const sql = 'SELECT * FROM swimlanes WHERE project_id = ? ORDER BY position';
    db.all(sql, [projectId], callback);
  }

  static update(id, swimlane, callback) {
    const { name, position, is_active, project_id, description } = swimlane;
    const sql = 'UPDATE swimlanes SET name = ?, position = ?, is_active = ?, project_id = ?, description = ? WHERE id = ?';
    db.run(sql, [name, position, is_active, project_id, description, id], callback);
  }

  static delete(id, callback) {
    const sql = 'DELETE FROM swimlanes WHERE id = ?';
    db.run(sql, [id], callback);
  }
}

export {  Swimlane } 

