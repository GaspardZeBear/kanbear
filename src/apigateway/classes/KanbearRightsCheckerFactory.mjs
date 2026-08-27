// kanboardReporter.js
//const axios = require('axios');
//import { KanboardRPC } from '../classes/KanboardRPC.mjs';
//import { Konsol } from './Konsol.mjs'
import { Konsol } from 'konsol'
import { db } from '../config/database.mjs';
import { KanbearRights } from './KanbearRights.mjs';
//import e from 'cors';

/*
 RightChecker :

*/

const READ = 2      // can READ this oject (modify attritbute)
const WRITE = 1     // can write this oject (modify attritbute)
const REFERENCE = 4 // is allowed to have a reference (iE foreign_key) to this object

//-----------------------------------------------------------------------------------------
class KanbearRightsCheckerFactory {

    static create(kind, op) {
        Konsol.log("KanbearRightsCheckerFactory create", "kind", kind, "op", op)
        switch (kind) {
            case 'workspaces':
                return new WorkspacesRightsChecker(op)
                break
            case 'assignees':
                return null
                break
            case 'users':
                return null
                break
            case 'projects':
                return new ProjectsRightsChecker(op)
                break
            case 'tasks':
                return new TasksRightsChecker(op)
                break
            case 'swimlanes':
                return new SwimlanesRightsChecker(op)
                break
            case 'columns':
                return new ColumnsRightsChecker(op)
                break
            default:
                return null
                break
        }

    }
}
//---------------------------------------------------------------------------------------
class RightsChecker {

    constructor(op) {
        Konsol.log("RightsCheckerFactory constructor", "op", op)
        this.op = op
    }

    //-----------------------------------------------------------------------------------
    getRequiredRights(req) {
        let requiredRights=this.computeRights(req)
        Konsol.log("RightsCheckerFactory getRequiredRights(req)", this.computeRights(req))
        return (requiredRights)
    }

    //-----------------------------------------------------------------------------------
    isAllowed() {
        return (false)
    }

    //----------------------------------------------------------------------------------
    getWorkspaceIdAndRights(projectId, rights) {
        if (projectId > 0) {
            let sqlReq = `select workspace_id from projects where id=${projectId}`
            let workspaceId = this.sqlGetId('workspace_id',sqlReq)
            return ({id: workspaceId, rights: rights })
        } else {
            //return ({id:0, rights: 0 })
            return ({})
        }
    }

    //-----------------------------------------------------------------------------------
    sqlGetId(key,sqlReq) {
        let resp
        db.all(sqlReq, [], (err, httpCode, sqlResp) => {
            Konsol.log("RightsChecker sqlGetId() callback()", "preq", sqlReq)
            Konsol.log("RightsChecker sqlGetId() callback()", "sqlResp", sqlResp)
            //this.rightsResp = sqlResp
            resp = sqlResp[0][key]
            //return (params)
        });
        return(resp)
    }


}

//---------------------------------------------------------------------------------------
class WorkspacesRightsChecker extends RightsChecker {
    computeRights(req) {
        Konsol.log("WorkspacesRightsChecker computeRights")
        return ({
        //    "workspaces": { id: 0, rights: 0 },
        //    "projects": { id: 0, rights: 0 }
        })
    }

}

//---------------------------------------------------------------------------------------
class ProjectsRightsChecker extends RightsChecker {

    //-----------------------------------------------------------------------------------
    computeRights(req) {
        Konsol.log("ProjectsRightsChecker computeRights")
        let workspaceId, wrights
        let projectId = 0, prights = 0
        let sqlReq
        switch (this.op) {
            case 'create':
                wrights = REFERENCE
                workspaceId = req.body["workspace_id"]
                break
            case 'getAll':
                wrights = READ
                workspaceId = req.query["workspace_id"]
                break
            case 'getById':
                wrights = REFERENCE
                prights = READ
                projectId = req.params["id"]
                sqlReq = `select workspace_id from projects where id=${projectId}`
                workspaceId = this.sqlGetId('workspace_id',sqlReq)
                break  
            case 'patch':
                wrights = REFERENCE
                prights = WRITE
                projectId = req.params["id"]
                sqlReq = `select workspace_id from projects where id=${projectId}`
                workspaceId = this.sqlGetId('workspace_id',sqlReq)
                break
        }
        if ( projectId > 0) {
        return ({
            "workspaces": { id : workspaceId, rights: wrights},
            "projects": { id: projectId, rights: prights }
        })} else {
            return ({
            "workspaces": { id : workspaceId, rights: wrights}
        })
        }
    }
}

//---------------------------------------------------------------------------------------
class SwimlanesRightsChecker extends RightsChecker {

    //-----------------------------------------------------------------------------------
    computeRights(req) {
        Konsol.log("SwimlanesRightsChecker computeRights")
        let projectId, prights
        let workspaceId, wrights
        let sqlReq
        let swimlaneId
        switch (this.op) {
            case 'create':
                projectId = req.body["project_id"]
                prights = WRITE
                break
            case 'getAll':
                projectId = req.query["project_id"]
                prights = READ
                break

            case 'getById':
                prights = READ
                swimlaneId = req.params["id"]
                sqlReq = `select project_id from swimlanes where id=${swimlaneId}`
                projectId=this.sqlGetId('project_id',sqlReq)
                break
            case 'patch':
                prights = WRITE
                swimlaneId = req.params["id"]
                sqlReq = `select project_id from swimlanes where id=${swimlaneId}`
                projectId=this.sqlGetId('project_id',sqlReq)
                break
        }
        return ({
            "workspaces": this.getWorkspaceIdAndRights(projectId, READ),
            "projects": { id: projectId, rights: prights }
        })

    }
}

//---------------------------------------------------------------------------------------
class ColumnsRightsChecker extends RightsChecker {

    //-----------------------------------------------------------------------------------
    computeRights(req) {
        Konsol.log("ColumnsRightsChecker computeRights")
        let projectId, prights
        let workspaceId, wrights
        let sqlReq
        let columnId

        switch (this.op) {
            case 'create':
                projectId = req.body["project_id"]
                prights = WRITE
                break
            case 'getAll':
                projectId = req.query["project_id"]
                prights = READ
                break
            case 'patch':
                prights = WRITE
                columnId = req.params["id"]
                sqlReq = `select project_id from columns where id=${columnId}`
                projectId=this.sqlGetId('project_id',sqlReq)
                break
            case 'getById':
                prights = READ
                columnId = req.params["id"]
                sqlReq = `select project_id from columns where id=${columnId}`
                projectId=this.sqlGetId('project_id',sqlReq)
                break
        }
        return ({
            "workspaces": this.getWorkspaceIdAndRights(projectId, READ),
            "projects": { id: projectId, rights: prights }
        })
    }
}


//---------------------------------------------------------------------------------------
class TasksRightsChecker extends RightsChecker {

    computeRights(req) {
        Konsol.log("TasksRightsChecker computeRights")
        let projectId, prights
        let workspaceId, wrights
        let sqlReq,subselect
        switch (this.op) {
            case 'create':
                prights = WRITE
                subselect = `select column_id from tasks  where id=${req.body["column_id"]}`
                sqlReq = `
                    select
                      project_id 
                    from 
                      columns
                    where
                      id=(${subselect})
                `
                projectId = this.sqlGetId('project_id',sqlReq)
            case 'getAll':
                break
            case 'getById':
                prights = READ
                subselect = `select column_id from tasks  where id=${req.params["id"]}`
                sqlReq = `
                    select
                      project_id 
                    from 
                      columns
                    where
                      id=(${subselect})
                `
                projectId = this.sqlGetId('project_id',sqlReq)
                break
            case 'patch':
                prights = WRITE
                Konsol.log("TaskRightsChecker computeRights patch",req.params)
                subselect = `select column_id from tasks  where id=${req.params["id"]}`
                sqlReq = `
                    select
                      project_id 
                    from 
                      columns
                    where
                      id=(${subselect})
                `
                projectId = this.sqlGetId('project_id',sqlReq)
                break
        }
        return ({
            "workspaces": this.getWorkspaceIdAndRights(projectId, READ),
            "projects": { id: projectId, rights: prights }
        })
    }
}


export { KanbearRightsCheckerFactory }
