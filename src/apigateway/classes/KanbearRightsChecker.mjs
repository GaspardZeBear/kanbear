// kanboardReporter.js
//const axios = require('axios');
//import { KanboardRPC } from '../classes/KanboardRPC.mjs';
//import { Konsol } from './Konsol.mjs'
import { Konsol } from 'konsol'
import { db } from '../config/database.mjs';
//import jwt from 'jsonwebtoken'
//import bcrypt from 'bcrypt'

/*
 RightChecker :

*/

const READ = 2      // can READ this oject (modify attritbute)
const WRITE = 1     // can write this oject (modify attritbute)
const REFERENCE = 4 // is allowed to have a reference (iE foreign_key) to this object

//-----------------------------------------------------
function extractProjectIdFromTask(id, req) {
    Konsol.log("KanbearRightChecker.getTaskProjectId()")
    let subselect
    if (id > 0) {
        subselect = `select column_id from tasks  where id=${id}`
    } else {
        subselect = `select column_id from tasks  where id=${req.body.column_id}`
    }
    let sqlReq = `
      select
        project_id 
      from 
        columns
      where
       id=(${subselect})
      `
    let project_id
    db.all(sqlReq, [], (err, httpCode, params) => {
        Konsol.log("KanbearRightChecker.getProjectIdFromTask()", "params", params)
        project_id = params[0].project_id
    });
    return (project_id)
}

//----------------------------------------------------------------------------------------
function getProjectIdFromTask(target, kind, id, req) {
    let project_id = extractProjectIdFromTask(id, req)
    Konsol.log("KanbearRightChecker.getProjectIdFromTask()", "project_id", project_id)
    return (project_id)
}

//----------------------------------------------------------------------------------------
function getTargetIdFromBody(target, kind, id, req) {
    let idName = `${target}_id`
    Konsol.log("KanbearRightChecker.getProjectIdFromBody()", "id", id, "project_id", req.body[idName])
    return (req.body[idName])
}

//----------------------------------------------------------------------------------------
function getId(target, kind, id, req) {
    Konsol.log("KanbearRightChecker.getId()", "id", id)
    return (id)
}


//---------------------------------------------------------------------------------------
function getTargetIdFromParams(target, kind, id, req) {
    let sqlReq = `
      select
        ${target.slice(0, -1)}_id 
      from 
        ${kind}
      where
       id=${id}
      `
    let target_id
    db.all(sqlReq, [], (err, httpCode, params) => {
        Konsol.log("KanbearRightChecker.getTargetIdFromParams()", "params", params)
        target_id = params[0][`${target}_id`]
    });
    return (target_id)
}

//-----------------------------------------------------------------------------------------
class KanbearRightsChecker {


    //static x={}

    static fnTrue(id, req) {
        Konsol.log("fn")
        return (true)
    }
    static fnFalse(id, req) {
        Konsol.log("fn")
        return (false)
    }

    static hasRightOn(target, kind, requiredRight, getIdFn) {
        // target is the final object to have rights on
        // kind is the current object
        // Read it as : to make action on kind, must have right xxx on target
        // The kind objects contains somewhere the id of target.
        // getIdFn is a function that will return targetId : workspace or projectId  
        // Example : to create a task :
        // - kind is task
        // - must be allowed to reference project
        // - task creation request contains column_id 
        // - must get project_id from columns where id=column_id

        // Ex : chain for swimlane create
        //   The request contains directly project_id (req.params)

        // Ex : chain for task : 
        //   the request contain column_id (req.params) 
        //     idFn will execute 
        //     select project_id from columns where id=req.params.column_id 
        //      and return project_id
        // then
        //   the project_id is used


        Konsol.log("KanbearRightsChecker hasRightOnProject()", "target", target, "kind", kind, "requiredRight", requiredRight, "idFn", getIdFn)
        console.log("KanbearRightsChecker hasRightOnProject()", "idFn", getIdFn)
        return ((id, req) => {
            // id is :
            //   the id of the object (ex task)
            // or 0 if create
            console.log("KanbearRightsChecker hasRightOnProject()", "invoke idFn", getIdFn)

            //Konsol.log("hasRightOnProject()", "kind", kind, "requiredRight", requiredRight)
            Konsol.log("hasRightOnProject()", "fired params", req.params)
            Konsol.log("hasRightOnProject()", "fired body", req.body)
            Konsol.log("hasRightOnProject()", "kanbearKontext", req.kanbearKontext)
            let targetId = getIdFn(target, kind, id, req)
            Konsol.log("hasRightOnProject()", "targetId", targetId)
            let kanbearKontext = req.kanbearKontext
            /*{
                rights : {
                    isAdmin:0,
                    data : {
                        workspaces :
                           { 1 : 1},
                        projects :
                           { 
                           1 : 3,
                           2 : 3,
                           3 : 3,
                           4 : 3,
                           5 : 3,
                           6 : 3,
                           7 : 3,
                           8 : 3,
                           9 : 3
                        }
                    }
                }
            }
                */
            Konsol.log("hasRightOnProject()", "auth kontext", kanbearKontext)
            Konsol.log("hasRightOnProject()", "auth target", target)
            Konsol.log("hasRightOnProject()", "auth full", kanbearKontext.rights.data[target])
            let auth = requiredRight & kanbearKontext.rights.data[target][targetId]
            console.log("hasRightOnProject()", "auth ", auth)
            return (true)
        })
    }

    static checkerFunctions = {
        'workspaces': {
            'create': KanbearRightsChecker.fnTrue,
            'getAll': KanbearRightsChecker.fnTrue,
            'getById': KanbearRightsChecker.fnTrue,
            'getByForeignKey': KanbearRightsChecker.fnTrue,
            'update': KanbearRightsChecker.fnFalse,
            'patch': KanbearRightsChecker.fnTrue,
            'delete': KanbearRightsChecker.fnFalse
        },
        'assignees': {
            'create': KanbearRightsChecker.fnTrue,
            'getAll': KanbearRightsChecker.fnTrue,
            'getById': KanbearRightsChecker.fnTrue,
            'getByForeignKey': KanbearRightsChecker.fnTrue,
            'update': KanbearRightsChecker.fnTrue,
            'patch': KanbearRightsChecker.fnTrue,
            'delete': KanbearRightsChecker.fnFalse
        },
        'projects': {
            'create': KanbearRightsChecker.hasRightOn('workspaces', 'projects', REFERENCE, getTargetIdFromBody),
            'getAll': KanbearRightsChecker.hasRightOn('projects', 'projects', READ, getId),
            'getById': KanbearRightsChecker.hasRightOn('projects', 'projects', READ, getId),
            'patch': KanbearRightsChecker.hasRightOn('projects', 'projects', WRITE, getId),
            'update': KanbearRightsChecker.hasRightOn('projects', 'projects', WRITE, getId),
            'delete': KanbearRightsChecker.hasRightOn('projects', 'projects', REFERENCE, getId),
        },
        'tasks': {
            'create': KanbearRightsChecker.hasRightOn('projects', 'tasks', REFERENCE, getProjectIdFromTask),
            'getAll': KanbearRightsChecker.hasRightOn('projects', 'tasks', READ, getProjectIdFromTask),
            'getById': KanbearRightsChecker.hasRightOn('projects', 'tasks', READ, getProjectIdFromTask),
            'patch': KanbearRightsChecker.hasRightOn('projects', 'tasks', WRITE, getProjectIdFromTask),
            'update': KanbearRightsChecker.hasRightOn('projects', 'tasks', WRITE, getProjectIdFromTask),
            'delete': KanbearRightsChecker.hasRightOn('projects', 'tasks', REFERENCE, getProjectIdFromTask),
        },
        'swimlanes': {
            'create': KanbearRightsChecker.hasRightOn('projects', 'swimlanes', REFERENCE, getTargetIdFromBody),
            'getAll': KanbearRightsChecker.hasRightOn('projects', 'swimlanes', READ, getTargetIdFromParams),
            'getById': KanbearRightsChecker.hasRightOn('projects', 'swimlanes', READ, getTargetIdFromParams),
            'patch': KanbearRightsChecker.hasRightOn('projects', 'swimlanes', WRITE, getTargetIdFromParams),
            'update': KanbearRightsChecker.hasRightOn('projects', 'swimlanes', WRITE, getTargetIdFromParams),
            'delete': KanbearRightsChecker.hasRightOn('projects', 'swimlanes', REFERENCE, getTargetIdFromParams),
        },
        'columns': {
            'create': KanbearRightsChecker.hasRightOn('projects', 'columns', REFERENCE, getTargetIdFromBody),
            'getAll': KanbearRightsChecker.hasRightOn('projects', 'columns', READ, getTargetIdFromParams),
            'getById': KanbearRightsChecker.hasRightOn('projects', 'columns', READ, getTargetIdFromParams),
            'patch': KanbearRightsChecker.hasRightOn('projects', 'columns', WRITE, getTargetIdFromParams),
            'update': KanbearRightsChecker.hasRightOn('projects', 'columns', WRITE, getTargetIdFromParams),
            'delete': KanbearRightsChecker.hasRightOn('projects', 'columns', REFERENCE, getTargetIdFromParams),
        }
    }

    //---------------------------------------------------------------------------------
    isAllowed(kind, op, req) {
        Konsol.log("KanbearRightsChecker", "isAllowed()", "<kind>", kind, "<op>", op)

        let kanbearRights = new KanbearRights(req.kanbearKontext.decodedToken.userId)
        // admin users have all rights
        if (kanbearRights.isAdmin()) {
            return (true)
        }

        // Non-admin users require advanced access control
        // 
        let rights = kanbearRights.load()
        let entityId = req.params.id ?? 0
        try {
            //console.log("KanbearRightsChecker", "isAllowed()", "<kind>",kind, "<op>",op,"<id>",id)
            return (KanbearRightsChecker.checkerFunctions[kind][op](entityId, req))
        } catch (err) {
            Konsol.log("KanbearRightsChecker err", err)
            Konsol.log("KanbearRightsChecker", "Error on checkerFunction found !", err)
            return (true)
        }
    }
}

export { KanbearRightsChecker }
