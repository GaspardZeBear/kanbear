// kanboardReporter.js
//const axios = require('axios');
//import { KanboardRPC } from '../classes/KanboardRPC.mjs';
import { DatabaseSync } from 'node:sqlite';

class KanboardSqlReporter {

  // PCST mean Projet, Swimlane, Column, Task !!!!!
  constructor(dbFile, runOnCreate) {
    console.log("KanboardSqlReporter.constructor() ", dbFile, "runOnCreate ", runOnCreate)
    //this.db = new DatabaseSync('db.sqlite', { readonly: true });
    this.db = new DatabaseSync(dbFile, { readonly: true });
    if (runOnCreate) {
      this.run()
    }
  }

  //-----------------------------------------------------
  async run() {
    await this.getJsonReport()
  }

  //-----------------------------------------------------
  async selectPCST() {
    console.log("KanboardSqlReporter.selectPCST()")
    let reqPCST = `
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
    const queryStmt = this.db.prepare(reqPCST);
    return(queryStmt.all())
    //console.log(queryStmt.all())
  }

  //-----------------------------------------------------
  async selectUsers() {
    console.log("KanboardSqlReporter.selectPCST()")
    let reqUsers = `select u.id uId,u.username uUsername, u.name uName from users as u`
    //let usersMap = { '0': 'nobody' }
    let usersMap={}
    const queryStmt = this.db.prepare(reqUsers);
    
    for (let row of queryStmt.all()) {
      usersMap[row.uId] = { name: row.uName, username: row.uUsername }
    }
    return(usersMap)
  }

  //-----------------------------------------------------
  async getJsonReport() {
    let report = []
    let projectsMap = {}
    const pcstPromises = this.selectPCST()
    const usersPromise = this.selectUsers()
    let [pcst,usersMap]=await Promise.all([pcstPromises,usersPromise])

    //-- turn into table
    for (let row of pcst) {
      console.log(row)
      if (!projectsMap[row.pId]) {
        projectsMap[row.pId] = {}
        projectsMap[row.pId].name = row.pName
        projectsMap[row.pId].description = row.pDescription
        projectsMap[row.pId].swimlanes = {}
        projectsMap[row.pId].columns = {}
        projectsMap[row.pId].tags = {}
        projectsMap[row.pId].users = usersMap
      }
      if (!projectsMap[row.pId].columns[row.cId]) {
        projectsMap[row.pId].columns[row.cId] = { id: row.cId, title: row.cTitle }
      }
      if (!projectsMap[row.pId].swimlanes[row.sId]) {
        projectsMap[row.pId].swimlanes[row.sId] = { id: row.sId, name: row.sName, tasks: {} }
      }
      projectsMap[row.pId].swimlanes[row.sId].tasks[row.tId] = {
        id:row.tId,
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
    console.log(usersMap)
    return (report)
    //const columns = queryStmt.columns();
    //for (let column of columns) {
    //console.log(column)
    //}
  }

}
console.log(process.argv);
if (process.argv[1].endsWith('KanboardSqlReporter.mjs')) {
  console.log("Mode 'main' : exécution directe");
  new KanboardSqlReporter("C:\\nginx\\nginx-1.19.7\\html\\kanboard-1.2.50\\data\\db.sqlite", true)
} else {
  console.log("Mode 'module' : importé depuis un autre fichier");
}

export { KanboardSqlReporter }
