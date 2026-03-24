// kanboardReporter.js
//const axios = require('axios');
//import { KanboardRPC } from '../classes/KanboardRPC.mjs';
import { db } from '../config/database.mjs';

class KanbearSqlReporter {

  // PCST mean Projet, Swimlane, Column, Task !!!!!
  constructor(runOnCreate) {
    console.log("KanbearSqlReporter.constructor() runOnCreate ", runOnCreate)
    //this.db = new DatabaseSync('db.sqlite', { readonly: true });
    this.db = db
    this.PCSTResp=[]
    this.usersMap = {}
    if (runOnCreate) {
      this.run()
    }
  }

  //-----------------------------------------------------
  async run() {
    await this.getJsonReport()
  }

  //-----------------------------------------------------
  async selectPCST(projectId) {
    console.log("KanboardSqlReporter.selectPCST()")
    let reqPCST = `
      select 
        p.id pId,
	      p.name pName,
        p.description pDescription,
        s.id sId,
	      s.name sName,
        s.description sDescription,
 	      c.id cId,
	      c.name cName,
        c.position cPosition,
        c.description cDescription,
        t.id tId,
	      t.name tName,
        t.description tDescription,
        t.assignee_id tAssigneeId,
        t.color tColor,
	      t.date_moved tMoved,
	      t.date_due tDue,
	      datetime(t.date_moved,'unixepoch') tMovedDatetime
      from tasks as t, projects as p
      join swimlanes as s
        on s.id=t.swimlane_id
      join columns as c
        on c.id=t.column_id
      where p.id=${projectId} and c.project_id=${projectId}
      order by p.name,s.name,t.name
      `
    db.all(reqPCST, [], this.callAfterPCST.bind(this));
    //return (queryStmt.all())
    //console.log(queryStmt.all())
  }

  //--------------------------------------------------------
  callAfterPCST(err, httpCode, params) {
    console.log("KanbearSqlReporter.callAfterPCST() <err>", err)
    console.log("KanbearSqlReporter.callAfterPCST() <httpCode>", httpCode)
    //console.log("KanbearSqlReporter.callAfterPCST() <params>", params)
    console.log("KanbearSqlReporter.callAfterPCST() <db>",this.db)
    this.PCSTResp=params
    //return (params)
  }
  //-----------------------------------------------------
  async selectUsers() {
    console.log("KanbearSqlReporter.selectPCST()")
    let reqUsers = `select u.id uId,u.name uName from users as u`
    //let usersMap = { '0': 'nobody' }
    db.all(reqUsers, [], this.callAfterUsers.bind(this));
  }

  //--------------------------------------------------------
  callAfterUsers(err, httpCode, params) {
    console.log("KanbearSqlReporter.callAfterUsers() <err>", err)
    console.log("KanbearSqlReporter.callAfterUsers() <httpCode>", httpCode)
    console.log("KanbearSqlReporter.callAfterUsers() <params>", params)

    for (let row of params) {
      this.usersMap[row.uId] = { name: row.uName, username: row.uUsername }
    }
    //return (usersMap)
  }

  //-----------------------------------------------------
  async getJsonReport(projectId) {
    let report = []
    let projectsMap = {}
    const pcstPromises = this.selectPCST(projectId)
    //console.log("<pcstPromises>", pcstPromises)
    const usersPromise = this.selectUsers()
    let [pcst, usersMap] = await Promise.all([pcstPromises, usersPromise])

    console.log("<pcst>", this.PCSTResp)
    //-- turn into table
    for (let row of this.PCSTResp) {
      console.log(row)
      if (!projectsMap[row.pId]) {
        projectsMap[row.pId] = {}
        projectsMap[row.pId].name = row.pName
        projectsMap[row.pId].id = row.pId
        projectsMap[row.pId].description = row.pDescription
        projectsMap[row.pId].swimlanes = {}
        projectsMap[row.pId].columns = {}
        projectsMap[row.pId].tags = {}
        projectsMap[row.pId].users = this.usersMap
      }
      if (!projectsMap[row.pId].columns[row.cId]) {
        projectsMap[row.pId].columns[row.cId] = { id: row.cId, name: row.cName, description: row.cDescription, position: row.cPosition }
      }
      if (!projectsMap[row.pId].swimlanes[row.sId]) {
        projectsMap[row.pId].swimlanes[row.sId] = { id: row.sId, project_id: row.pId, name: row.sName, description: row.sDescription, tasks: {} }
      }
      projectsMap[row.pId].swimlanes[row.sId].tasks[row.tId] = {
        id: row.tId,
        description: row.tDescription,
        name: row.tName,
        project_id: row.pId,
        swimlane_id: row.sId,
        column_id: row.cId,
        date_moved: row.tMoved,
        date_due: row.tDue,
        color: row.tColor,
        owner_id: row.tAssigneeId
      }
    }
    for (let p in projectsMap) {
      report.push(projectsMap[p])
    }
    console.log(report)
    console.log(usersMap)
    //return (report)
    return (projectsMap)
  }

}

//------------------------------------------------------------------------------------------------------------
console.log(process.argv);
if (process.argv[1].endsWith('KanbearSqlReporter.mjs')) {
  console.log("Mode 'main' : exécution directe");
  new KanbearSqlReporter(true)
} else {
  console.log("Mode 'module' : importé depuis un autre fichier");
}

export { KanbearSqlReporter }
