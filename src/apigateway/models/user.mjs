import { db } from '../config/database.mjs'

class User {
  static create(user, callback) {
    const { username, password, is_admin } = user;
    const sql = 'INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)';
    db.run(sql, [username, password, is_admin], function(err) {
      callback(err, this.lastID);
    });
  }

  static getAll(callback) {
    const sql = 'SELECT * FROM users';
    db.all(sql, [], callback);
  }

  static getById(id, callback) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.get(sql, [id], callback);
  }

  static getByUsername(username, callback) {
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], callback);
  }

  static update(id, user, callback) {
    const { username, password, is_admin } = user;
    const sql = 'UPDATE users SET username = ?, password = ?, is_admin = ? WHERE id = ?';
    db.run(sql, [username, password, is_admin, id], callback);
  }

  static delete(id, callback) {
    const sql = 'DELETE FROM users WHERE id = ?';
    db.run(sql, [id], callback);
  }
}

export {  User } 

