// kanboardReporter.js
//const axios = require('axios');
//import { KanboardRPC } from '../classes/KanboardRPC.mjs';
import { Konsol } from './Konsol.mjs'
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
    //this.query=query
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
    Konsol.log("KanboardSqlReporter.selectPST() query",this.query)
    let filters=[]
    if  ( this.query["project.open"] ) {
      filters.push("p.is_open=true")
    }
    if  ( this.query["project.closed"] ) {
      filters.push("p.is_open=false")
    }
    if  ( this.query["swimlane.open"] ) {
      filters.push("s.is_open=true")
    }
    if  ( this.query["swimlane.closed"] ) {
      filters.push("s.is_open=false")
    }
    if  ( this.query["task.open"] ) {
      filters.push("t.is_open=true")
    }
    if  ( this.query["task.closed"] ) {
      filters.push("t.is_open=false")
    }
    let filter=""
    if (filters.length > 0 ) {
      filter=" AND " + filters.join(" AND ")
    }
    Konsol.log("KanbearSqlReporter.selectPST(projectId) filter",filter)
    let reqPST = `
      select 
        w.id wId,
        w.name wName,
        p.id pId,
	      p.name pName,
        p.description pDescription,
        p.is_open pIsOpen,
        s.id sId,
	      s.name sName,
        s.description sDescription,
        s.is_open sIsOpen,
 	      t.name tName,
        t.note tNote,
        t.id tId,
        t.column_id cId,
        t.description tDescription,
        t.assignee_id tAssigneeId,
        t.color tColor,
        t.is_open tIsOpen,
	      t.date_moved tMoved,
	      t.date_due tDue,
	      datetime(t.date_moved,'unixepoch') tMovedDatetime
      from projects as p
      left join workspaces as w
        on w.id=p.workspace_id
      left join swimlanes as s
        on p.id=s.project_id
      left join tasks as t
        on s.id = t.swimlane_id
      where p.id=${projectId} ${filter}
      order by s.name,t.name
      `
    db.all(reqPST, [], this.callAfterPST.bind(this));
    //return (queryStmt.all())
    //console.log(queryStmt.all())
  }

   //-----------------------------------------------------
  async selectC(projectId) {
    Konsol.log("KanboardSqlReporter.selectC()")
    let reqC = `
      select 
        p.id pId,
	      p.name pName,
        c.id cId,
	      c.name cName,
        c.position cPosition,
        c.color cColor,
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
     Konsol.log("KanbearSqlReporter.callAfterPST() <PSTResp>", params)
    this.PSTResp = params
    //return (params)
  }

  //--------------------------------------------------------
  callAfterC(err, httpCode, params) {
    this.CResp = params
    //return (params)
  }

  //-----------------------------------------------------
  async selectUsers() {
    Konsol.log("KanbearSqlReporter.selectUsers()")
    let reqUsers = `select 
        u.id uId,
        u.name uName
      from users as u`
    //let usersMap = { '0': 'nobody' }
    db.all(reqUsers, [], this.callAfterUsers.bind(this));
  }

  //--------------------------------------------------------
  callAfterUsers(err, httpCode, params) {
    for (let row of params) {
      this.usersMap[row.uId] = { name: row.uName}
    }
    //return (usersMap)
  }
  
  //-----------------------------------------------------
  async selectAssignees() {
    Konsol.log("KanbearSqlReporter.selectAssignees()")
    let reqAssignees = `select a.id aId,a.name aName from assignees as a`
    //let usersMap = { '0': 'nobody' }
    db.all(reqAssignees, [], this.callAfterAssignees.bind(this));
  }


  //--------------------------------------------------------
  callAfterAssignees(err, httpCode, params) {
    for (let row of params) {
      this.assigneesMap[row.aId] = { name: row.aName }
    }
    //return (usersMap)
  }

  //-----------------------------------------------------
  async getJsonReport(projectId,query={}) {
    let report = []
    let projectsMap = {}
    this.query=query
    const pstPromises = this.selectPST(projectId)
    const cPromises = this.selectC(projectId)
    //console.log("<pcstPromises>", pcstPromises)
    const usersPromise = this.selectUsers()
    const assigneesPromise = this.selectAssignees()
    let [pst, pc, usersMap,assigneesMap] = await Promise.all([pstPromises, cPromises, usersPromise,assigneesPromise])

    Konsol.log("KanbearSqlReporter.getJsonReport <PSTResp>", this.PSTResp)
    //-- turn into table
    if ( this.PSTResp.length == 0) {
      return(projectsMap)
    }
    
    for (let row of this.PSTResp) {
      //console.log(row)
      if (!projectsMap[row.pId]) {
        projectsMap[row.pId] = {}
        projectsMap[row.pId].workspace = { name: row.wName, id: row.wId }
        projectsMap[row.pId].name = row.pName
        projectsMap[row.pId].id = row.pId
        projectsMap[row.pId].is_open = row.pIsOpen
        projectsMap[row.pId].description = row.pDescription
        projectsMap[row.pId].swimlanes = {}
        projectsMap[row.pId].columns = {}
        projectsMap[row.pId].tags = {}
        projectsMap[row.pId].users = this.usersMap
        projectsMap[row.pId].assignees = this.assigneesMap
      }

      if (row.sId == null) {
        //console.log("row.sId skip ")
        continue
      }
      if (!projectsMap[row.pId].swimlanes[row.sId]) {
        projectsMap[row.pId].swimlanes[row.sId] = { 
          id: row.sId, 
          project_id: row.pId,
          is_open: row.sIsOpen,
          name: row.sName, 
          description: 
          row.sDescription, 
          tasks: {}
         }
      }
      // Beware of left/righ join, task may be null 
      //console.log("row.tId",row.tId)
      if (row.tId == null) {
        //console.log("row.tId skip ")
        continue
      }
      projectsMap[row.pId].swimlanes[row.sId].tasks[row.tId] = {
        id: row.tId,
        description: row.tDescription,
        name: row.tName,
        is_open: row.tIsOpen,
        project_id: row.pId,
        swimlane_id: row.sId,
        column_id: row.cId,
        date_moved: row.tMoved,
        date_due: row.tDue,
        note: row.tNote,
        color: row.tColor,
        assignee_id: row.tAssigneeId
      }
    }
    //console.log("pc", pc)
    //Konsol.log("KanbearSqlReporter.getJsonReport() before col <projectsMap>",projectsMap)
    //console.log("this.CResp", this.CResp)
    for (let c of this.CResp) {
      projectsMap[projectId].columns[c.cId] = {
        name: c.cName,
        id: c.cId,
        color: c.cColor,
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
