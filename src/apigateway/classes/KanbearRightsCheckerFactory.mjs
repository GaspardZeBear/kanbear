// kanboardReporter.js
//const axios = require('axios');
//import { KanboardRPC } from '../classes/KanboardRPC.mjs';
//import { Konsol } from './Konsol.mjs'
import { Konsol } from 'konsol'
import { db } from '../config/database.mjs';
import { KanbearRights } from './KanbearRights.mjs';
import e from 'cors';

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
        Konsol.log("RightsCheckerFactory getRequiredRights(req)")
        return (this.getTargetId(req))
    }

    //-----------------------------------------------------------------------------------
    isAllowed() {
        return (false)
    }

    //----------------------------------------------------------------------------------
    getWorkspaceIdAndRights(projectId, rights) {
        let sqlReq = `select workspace_id from projects where id=${projectId}`
        let workspaceId = this.sqlGetId(sqlReq)
        return ({ workspaceId: rights })
    }

    //-----------------------------------------------------------------------------------
    sqlGetId(sqlReq) {
        let resp
        db.all(sqlReq, [], (err, httpCode, sqlResp) => {
            Konsol.log("RightsChecker sqlGetId() callback()", "preq", sqlReq)
            Konsol.log("RightsChecker sqlGetId() callback()", "sqlResp", sqlResp)
            //this.rightsResp = sqlResp
            resp = sqlResp
            //return (params)
        });
        return(resp)
    }


}

//---------------------------------------------------------------------------------------
class WorkspacesRightsChecker extends RightsChecker {
    getTargetId(req) {
        return ({
            "workspaces": this.getWorkspaceIdAndRights(0, READ),
            "projects": { 0: 0 }
        })
    }

}

//---------------------------------------------------------------------------------------
class ProjectsRightsChecker extends RightsChecker {

    //-----------------------------------------------------------------------------------
    getTargetId(req) {
        let workspaceId, wrights
        let projectId = 0, prights = 0
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
                let sqlReq = `select workspace_id from projects where id=${id}`
                workspaceId = this.sqlGetId(sqlReq)
            // !! No break  
            case 'patch':
                wrights = REFERENCE
                prights = WRITE
                break
        }
        return ({
            "workspaces": this.getWorkspaceIdAndRights(projectId, READ),
            "projects": { projectId: prights }
        })
    }
}

//---------------------------------------------------------------------------------------
class SwimlanesRightsChecker extends RightsChecker {

    //-----------------------------------------------------------------------------------
    getTargetId(req) {
        let projectId, prights
        let workspaceId, wrights
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
                this.id = req.params["id"]
                let sqlReq = `select project_id from swimlanes where id=${id}`
                this.sqlGetId(sqlReq)
            // !! No break here
            case 'patch':
                prights = WRITE
                break
        }
        return ({
            "workspaces": this.getWorkspaceIdAndRights(projectId, READ),
            "projects": { projectId: rights }
        })

    }
}

//---------------------------------------------------------------------------------------
class ColumnsRightsChecker extends RightsChecker {

    //-----------------------------------------------------------------------------------
    getTargetId(req) {
        let projectId, prights
        let workspaceId, wrights
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
                let id = req.params["id"]
                let sqlReq = `select project_id from columns where id=${id}`
                this.sqlGetId(sqlReq)
                break
            case 'getById':
                prights = READ
                this.id = req.params["id"]
                sqlReq = `select project_id from columns where id=${id}`
                this.sqlGetId(sqlReq)
                break
        }
        return ({
            "workspaces": this.getWorkspaceIdAndRights(projectId, READ),
            "projects": { projectId: rights }
        })
    }
}


//---------------------------------------------------------------------------------------
class TasksRightsChecker extends RightsChecker {

    getTargetId(req) {
        let projectId, prights
        let workspaceId, wrights
        switch (this.op) {
            case 'create':
                prights = WRITE
                let subselect = `select column_id from tasks  where id=${req.body["column_id"]}`
                let sqlReq = `
                    select
                      project_id 
                    from 
                      columns
                    where
                      id=(${subselect})
                `
                projectId = this.sqlGetId(sqlResp)
            case 'getAll':
                break
            case 'getById':
                prights = READ
                subselect = `select column_id from tasks  where id=${req.param["column_id"]}`
                sqlReq = `
                    select
                      project_id 
                    from 
                      columns
                    where
                      id=(${subselect})
                `
                projectId = this.sqlGetId(sqlResp)
            //!!!!! No break here
            case 'patch':
                prights = WRITE
                break
        }
        return ({
            "workspaces": this.getWorkspaceIdAndRights(projectId, READ),
            "projects": { projectId: rights }
        })
    }
}


export { KanbearRightsCheckerFactory }
