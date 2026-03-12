import { db } from '../config/database.mjs'

class ProjectUser {
  static create(projectUser, callback) {
    const { project_id, user_id, right } = projectUser;
    const sql = 'INSERT INTO projects_users (project_id, user_id, right) VALUES (?, ?, ?)';
    db.run(sql, [project_id, user_id, right], function(err) {
      callback(err, this.lastID);
    });
  }

  static getAll(callback) {
    const sql = 'SELECT * FROM projects_users';
    db.all(sql, [], callback);
  }

  static getByProjectId(projectId, callback) {
    const sql = 'SELECT * FROM projects_users WHERE project_id = ?';
    db.all(sql, [projectId], callback);
  }

  static getByUserId(userId, callback) {
    const sql = 'SELECT * FROM projects_users WHERE user_id = ?';
    db.all(sql, [userId], callback);
  }

  static update(projectId, userId, projectUser, callback) {
    const { right } = projectUser;
    const sql = 'UPDATE projects_users SET right = ? WHERE project_id = ? AND user_id = ?';
    db.run(sql, [right, projectId, userId], callback);
  }

  static delete(projectId, userId, callback) {
    const sql = 'DELETE FROM projects_users WHERE project_id = ? AND user_id = ?';
    db.run(sql, [projectId, userId], callback);
  }
}

export {  ProjectUser } 

