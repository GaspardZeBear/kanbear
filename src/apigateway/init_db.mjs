import {db } from './config/database.mjs'


  db.exec(`
    CREATE TABLE IF NOT EXISTS assignees (
      id INTEGER PRIMARY KEY,
      name TEXT NOCASE NOT NULL,
      description TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS columns (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      position INTEGER,
      project_id INTEGER NOT NULL,
      color TEXT DEFAULT 'white',
      description TEXT,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE SET NULL,
      UNIQUE (name, project_id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY,
      name TEXT NOCASE NOT NULL,
      description TEXT,
      workspace_id INTEGER NOT NULL,
      is_open INTEGER DEFAULT 1,
      FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE SET  NULL,
      UNIQUE (name, id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS projects_users (
      project_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      right INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE SET NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
      UNIQUE(project_id, user_id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS swimlanes (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      position INTEGER DEFAULT 1,
      is_open INTEGER DEFAULT 1,
      project_id INTEGER NOT NULL,
      description TEXT,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE SET NULL,
      UNIQUE (name, project_id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      project_id INTEGER NOT NULL,
      color TEXT DEFAULT 'yellow',
      UNIQUE(project_id, name)
    )
  `);


  //project_id INTEGER REFERENCES projects(id) ON DELETE  SET NULL,
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY,
      name TEXT NOCASE NOT NULL,
      description TEXT,
      note TEXT,
      color TEXT,
      color_rules TEXT,
      column_id INTEGER NOT NULL REFERENCES columns(id) ON DELETE  SET NULL,
      creator_id INTEGER REFERENCES users(id) ON DELETE  SET NULL,
      assignee_id INTEGER REFERENCES assignees(id) ON DELETE  SET NULL,
      position INTEGER,
      is_open INTEGER DEFAULT 1,
      priority INTEGER DEFAULT 0,
      swimlane_id INTEGER NOT NULL REFERENCES swimlanes(id) ON DELETE  SET NULL,
      date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
      date_started INTEGER DEFAULT 0,
      date_moved INTEGER DEFAULT 0,
      date_closed INTEGER DEFAULT 0,
      date_due INTEGER DEFAULT 0,
      date_checked INTEGER DEFAULT '0',
      date_modified INTEGER DEFAULT '0',
      moved_warning TEXT,
      due_warning TEXT,
      checked_warning TEXT,
      UNIQUE(name,swimlane_id,column_id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks_comments (
      id INTEGER PRIMARY KEY,
      task_id INTEGER NOT NULL,
      user_id INTEGER DEFAULT 0,
      date_created INTEGER NOT NULL,
      comment TEXT NOT NULL,
      reference VARCHAR(50),
      date_modified INTEGER,
      FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE SET  NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS task_has_tags (
      task_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE  SET NULL,
      FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE  SET NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      description TEXT,
      name TEXT NOT NULL,
      password TEXT,
      is_admin INTEGER DEFAULT 0
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id INTEGER PRIMARY KEY,
      name TEXT NOCASE NOT NULL,
      description TEXT,
      is_open INTEGER DEFAULT 1,
      UNIQUE(name)
    )
  `);

  // Créer les index
  db.exec('CREATE INDEX IF NOT EXISTS users_admin_idx ON users(is_admin)');
  db.exec('CREATE INDEX IF NOT EXISTS columns_project_idx ON columns(project_id)');
  db.exec('CREATE INDEX IF NOT EXISTS swimlanes_project_idx ON swimlanes(project_id)');

  console.log('Base de données initialisée avec succès.');


