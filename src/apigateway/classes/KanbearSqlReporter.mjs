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
    this.PCSTResp = []
    this.usersMap = {}
    this.assigneesMap = {}
    if (runOnCreate) {
      this.run()
    }
  }

  //-----------------------------------------------------
  async run() {
    await this.getJsonReport()
  }

  //-----------------------------------------------------
  async selectPST(projectId) {
    console.log("KanboardSqlReporter.selectPST()")
    let reqPST = `
      select 
        p.id pId,
	      p.name pName,
        p.description pDescription,
        s.id sId,
	      s.name sName,
        s.description sDescription,
 	      t.name tName,
        t.id tId,
        t.column_id cId,
        t.description tDescription,
        t.assignee_id tAssigneeId,
        t.color tColor,
	      t.date_moved tMoved,
	      t.date_due tDue,
	      datetime(t.date_moved,'unixepoch') tMovedDatetime
      from projects as p
      left join swimlanes as s
        on p.id=s.project_id
      left join tasks as t
        on s.id = t.swimlane_id
      where p.id=${projectId}
      order by s.name,t.name
      `
    db.all(reqPST, [], this.callAfterPST.bind(this));
    //return (queryStmt.all())
    //console.log(queryStmt.all())
  }

   //-----------------------------------------------------
  async selectC(projectId) {
    console.log("KanboardSqlReporter.selectC()")
    let reqC = `
      select 
        p.id pId,
	      p.name pName,
        c.id cId,
	      c.name cName,
        c.position cPosition,
        c.description cDescription
      from projects as p
      right join columns as c
        on p.id=c.project_id
      where p.id=${projectId}
      order by p.name,c.name
      `
    db.all(reqC, [], this.callAfterC.bind(this));
    //return (queryStmt.all())
    //console.log(queryStmt.all())
  }

  //--------------------------------------------------------
  callAfterPST(err, httpCode, params) {
    console.log("KanbearSqlReporter.callAfterPST() <err>", err)
    console.log("KanbearSqlReporter.callAfterPST() <httpCode>", httpCode)
    //console.log("KanbearSqlReporter.callAfterPST() <params>", params)
    console.log("KanbearSqlReporter.callAfterPST() <db>", this.db)
    console.log("PCSTResp", params)
    this.PSTResp = params
    //return (params)
  }

  //--------------------------------------------------------
  callAfterC(err, httpCode, params) {
    console.log("KanbearSqlReporter.callAfterC() <err>", err)
    console.log("KanbearSqlReporter.callAfterC() <httpCode>", httpCode)
    //console.log("KanbearSqlReporter.callAfterPCST() <params>", params)
    console.log("KanbearSqlReporter.callAfterC() <db>", this.db)
    console.log("CResp", params)
    this.CResp = params
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
      this.usersMap[row.uId] = { name: row.uName}
    }
    //return (usersMap)
  }
  
  //-----------------------------------------------------
  async selectAssignees() {
    console.log("KanbearSqlReporter.selectAssignees()")
    let reqAssignees = `select a.id aId,a.name aName from assignees as a`
    //let usersMap = { '0': 'nobody' }
    db.all(reqAssignees, [], this.callAfterAssignees.bind(this));
  }


  //--------------------------------------------------------
  callAfterAssignees(err, httpCode, params) {
    console.log("KanbearSqlReporter.callAfterAssignees() <err>", err)
    console.log("KanbearSqlReporter.callAfterAssignees() <httpCode>", httpCode)
    console.log("KanbearSqlReporter.callAfterAssignees() <params>", params)

    for (let row of params) {
      this.assigneesMap[row.aId] = { name: row.aName }
    }
    //return (usersMap)
  }

  //-----------------------------------------------------
  async getJsonReport(projectId) {
    let report = []
    let projectsMap = {}
    const pstPromises = this.selectPST(projectId)
    const cPromises = this.selectC(projectId)
    //console.log("<pcstPromises>", pcstPromises)
    const usersPromise = this.selectUsers()
    const assigneesPromise = this.selectAssignees()
    let [pst, pc, usersMap,assigneesMap] = await Promise.all([pstPromises, cPromises, usersPromise,assigneesPromise])

    //console.log("<pcst>", this.PSTResp)
    //-- turn into table
    for (let row of this.PSTResp) {
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
        projectsMap[row.pId].assignees = this.assigneesMap
      }

      if (row.sId == null) {
        console.log("row.sId skip ")
        continue
      }
      if (!projectsMap[row.pId].swimlanes[row.sId]) {
        projectsMap[row.pId].swimlanes[row.sId] = { id: row.sId, project_id: row.pId, name: row.sName, description: row.sDescription, tasks: {} }
      }
      // Beware of left/righ join, task may be null 
      //console.log("row.tId",row.tId)
      if (row.tId == null) {
        console.log("row.tId skip ")
        continue
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
        assignee_id: row.tAssigneeId
      }
    }
    //console.log("pc", pc)
    //console.log("this.CResp", this.CResp)
    for (let c of this.CResp) {
      projectsMap[projectId].columns[c.cId] = {
        name: c.cName,
        id: c.cId,
        position: c.cPosition,
        description: c.cDescription
      }
    }
    for (let p in projectsMap) {
      report.push(projectsMap[p])
    }
    //console.log(report)
    //console.log(usersMap)
    //return (report)
    return (projectsMap)
  }

}

//------------------------------------------------------------------------------------------------------------
console.log(process.argv);
if (process.argv[1].endsWith('KanbearSqlReporterNew.mjs')) {
  console.log("Mode 'main' : exécution directe");
  new KanbearSqlReporter(true)
} else {
  console.log("Mode 'module' : importé depuis un autre fichier");
}

export { KanbearSqlReporter }
