// kanboardReporter.js
//const axios = require('axios');
//import { KanboardRPC } from '../classes/KanboardRPC.mjs';
import { DatabaseSync } from 'node:sqlite';

class KanboardSqlReporter {


  constructor(dbFile, runOnCreate) {
    console.log("KanboardSqlReporter.constructor() ",dbFile, "runOnCreate ",runOnCreate)
    this.db = new DatabaseSync('db.sqlite', { readonly: true });
    if (runOnCreate) {
      this.run()
    }
  }

  //-----------------------------------------------------
  async run() {
    await this.getJsonReport()
  }

  //-----------------------------------------------------
  async getJsonReport() {
    console.log("KanboardSqlReporter.getJsonReport() req0")
    let req0 = `
      select 
            p.id pId,
	    p.name pName,
      p.description pDescription,
	    s.id sId,
	    s.name sName,
 	    c.id cId,
	    c.title cTitle,
      t.id tId,
	    t.title tTitle,
      t.owner_id tOwnerId,
      t.color_id tColor,
	    t.date_moved tMoved,
	    t.date_due tDue,
	    datetime(t.date_moved,'unixepoch') tMovedDatetime
      from tasks as t
      join swimlanes as s
        on s.id=t.swimlane_id
      join projects as p
        on p.id=t.project_id
      join columns as c
        on c.id=t.column_id
      order by p.name,s.name,t.title
      `
    const queryStmt = this.db.prepare(req0);
    //console.log(queryStmt.all())
    let report = []
    let projectsMap = {}
    for (let row of queryStmt.all()) {
      console.log(row)
      if (!projectsMap[row.pId]) {
        projectsMap[row.pId] = {}
        projectsMap[row.pId].name = row.pName
        projectsMap[row.pId].description = row.pDescription
        projectsMap[row.pId].swimlanes = {}
        projectsMap[row.pId].columns = {}
        projectsMap[row.pId].tags = {}
        projectsMap[row.pId].users = {}
      }
      if (!projectsMap[row.pId].columns[row.cId]) {
        projectsMap[row.pId].columns[row.cId] = { id: row.cId, title: row.cTitle }
      }
      if (!projectsMap[row.pId].swimlanes[row.sId]) {
        projectsMap[row.pId].swimlanes[row.sId] = { id: row.sId, name: row.sName, tasks: {} }
      }
      projectsMap[row.pId].swimlanes[row.sId].tasks[row.tId] = {
        title: row.tTitle,
        column_id: row.cId,
        date_moved: row.tMoved,
        date_due: row.tDue,
        color: row.tColor,
        owner_id: row.tOwnerId
      }
    }
    for (let p in projectsMap) {
      report.push(projectsMap[p])
    }
    console.log(report)
    return(report)
    //const columns = queryStmt.columns();
    //for (let column of columns) {
    //console.log(column)
    //}
  }

}
console.log(process.argv);
if (process.argv[1].endsWith('KanboardSqlReporter.mjs')) {
  console.log("Mode 'main' : exécution directe");
  new KanboardSqlReporter('xx', true)
} else {
  console.log("Mode 'module' : importé depuis un autre fichier");
}

export { KanboardSqlReporter }
