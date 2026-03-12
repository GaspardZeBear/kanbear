import { db } from '../config/database.mjs'

class Tag {
  static create(tag, callback) {
    const { name, project_id, color_id } = tag;
    const sql = 'INSERT INTO tags (name, project_id, color_id) VALUES (?, ?, ?)';
    db.run(sql, [name, project_id, color_id], function(err) {
      callback(err, this.lastID);
    });
  }

  static getAll(callback) {
    const sql = 'SELECT * FROM tags';
    db.all(sql, [], callback);
  }

  static getById(id, callback) {
    const sql = 'SELECT * FROM tags WHERE id = ?';
    db.get(sql, [id], callback);
  }

  static getByProjectId(projectId, callback) {
    const sql = 'SELECT * FROM tags WHERE project_id = ?';
    db.all(sql, [projectId], callback);
  }

  static update(id, tag, callback) {
    const { name, project_id, color_id } = tag;
    const sql = 'UPDATE tags SET name = ?, project_id = ?, color_id = ? WHERE id = ?';
    db.run(sql, [name, project_id, color_id, id], callback);
  }

  static delete(id, callback) {
    const sql = 'DELETE FROM tags WHERE id = ?';
    db.run(sql, [id], callback);
  }
}

export {  Tag } 

