// kanboardReporter.js
//const axios = require('axios');
//import { KanboardRPC } from '../classes/KanboardRPC.mjs';
//import { Konsol } from './Konsol.mjs'
import { Konsol } from 'konsol'
import { db } from '../config/database.mjs';
import { KanbearRights } from './KanbearRights.mjs';

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
    Konsol.log("KanbearRightChecker.getProjectIdFromBody()", "id", id, "req.body", req.body[idName])
    return (req.body[idName])
}
//----------------------------------------------------------------------------------------
function getTargetIdFromParams(target, kind, id, req) {
    let idName = `${target}_id`
    Konsol.log("KanbearRightChecker.getProjectIdFromParams()", "id", id, "req.params", req.params[idName])
    return (req.params[idName])
}
//----------------------------------------------------------------------------------------
function getTargetIdFromQuery(target, kind, id, req) {
    let idName = `${target}_id`
    Konsol.log("KanbearRightChecker.getProjectIdFromQuery()", "id", id, "req.query", req.query[idName])
    return (req.params[idName])
}

//----------------------------------------------------------------------------------------
function getId(target, kind, id, req) {
    Konsol.log("KanbearRightChecker.getId()", "id", id)
    return (id)
}


//---------------------------------------------------------------------------------------
function XgetTargetIdFromParams(target, kind, id, req) {
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

function fnTrue(id, req) {
    Konsol.log("fnTrue")
    return (true)
}
function fnFalse(id, req) {
    Konsol.log("fnFalse")
    return (false)
}

function hasRightOn(target, kind, requiredRight, getIdFn) {
    // target is the final object to have rights on
    // kind is the current object
    // Read it as : to make action on kind, must have right xxx on target
    // The kind objects contains somewhere the id of target.
    // getIdFn is a function that will return targetId : workspace or projectId  
    // Example : to create a task :
    // - target is project
    // - kind is task
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
    //console.log("KanbearRightsChecker hasRightOnProject()", "idFn", getIdFn)
    return ((id, req, userRights) => {
        // id is :
        //   the id of the object (ex task)
        // or 0 if create
        try {
            console.log("KanbearRightsChecker hasRightOnProject() closure fired")
            Konsol.log("KanbearRightsChecker hasRightOnProject() closure", "invoke idFn", getIdFn)
            Konsol.log("KanbearRightsChecker hasRightOnProject() closure", "userRights", userRights)

            //Konsol.log("hasRightOnProject()", "kind", kind, "requiredRight", requiredRight)
            Konsol.log("hasRightOnProject()  closure", "fired params", req.params)
            Konsol.log("hasRightOnProject()  closure", "fired body", req.body)
            Konsol.log("hasRightOnProject() closure", "fired query", req.query)
            //Konsol.log("hasRightOnProject()", "kanbearKontext", req.kanbearKontext)
            let targetId = getIdFn(target, kind, id, req)
            Konsol.log("hasRightOnProject() closure", "targetId", targetId)
            //Konsol.log("hasRightOnProject()", "auth kontext", kanbearKontext)
            Konsol.log("hasRightOnProject() closure", "auth target", target)
            Konsol.log("hasRightOnProject() closure", "auth full", userRights.data[target])
            let auth = requiredRight & userRights.data[target][targetId]
            Konsol.log("hasRightOnProject() closure", "auth ", auth)
            console.log("KanbearRightsChecker hasRightOnProject() closure no err")
        } catch (err) {
            console.log("KanbearRightsChecker hasRightOnProject()  closure err", err)
        }
        return (true)
    })
}

//-----------------------------------------------------------------------------------------
class KanbearRightsChecker {

    static checkerFunctions = {
        'workspaces': {
            'create': fnTrue,
            'getAll': fnTrue,
            'getById': fnTrue,
            'getByForeignKey': fnTrue,
            'update': fnFalse,
            'patch': fnTrue,
            'delete': fnFalse
        },
        'assignees': {
            'create': fnTrue,
            'getAll': fnTrue,
            'getById': fnTrue,
            'getByForeignKey': fnTrue,
            'update': fnTrue,
            'patch': fnTrue,
            'delete': fnFalse
        },
        'projects': {
            'create': hasRightOn('workspaces', 'projects', REFERENCE, getTargetIdFromBody),
            'getAll': hasRightOn('workspaces', 'projects', READ, getTargetIdFromQuery),
            'getById': hasRightOn('projects', 'projects', READ, getId),
            'patch': hasRightOn('projects', 'projects', WRITE, getId),
            'update': hasRightOn('projects', 'projects', WRITE, getId),
            'delete': hasRightOn('projects', 'projects', REFERENCE, getId),
        },
        'tasks': {
            'create': hasRightOn('projects', 'tasks', REFERENCE, getProjectIdFromTask),
            'getAll': hasRightOn('projects', 'tasks', READ, getProjectIdFromTask),
            'getById': hasRightOn('projects', 'tasks', READ, getProjectIdFromTask),
            'patch': hasRightOn('projects', 'tasks', WRITE, getProjectIdFromTask),
            'update': hasRightOn('projects', 'tasks', WRITE, getProjectIdFromTask),
            'delete': hasRightOn('projects', 'tasks', REFERENCE, getProjectIdFromTask),
        },
        'swimlanes': {
            'create': hasRightOn('projects', 'swimlanes', REFERENCE, getTargetIdFromBody),
            'getAll': hasRightOn('projects', 'swimlanes', READ, getTargetIdFromParams),
            'getById': hasRightOn('projects', 'swimlanes', READ, getTargetIdFromParams),
            'patch': hasRightOn('projects', 'swimlanes', WRITE, getTargetIdFromParams),
            'update': hasRightOn('projects', 'swimlanes', WRITE, getTargetIdFromParams),
            'delete': hasRightOn('projects', 'swimlanes', REFERENCE, getTargetIdFromParams),
        },
        'columns': {
            'create': hasRightOn('projects', 'columns', REFERENCE, getTargetIdFromBody),
            'getAll': hasRightOn('projects', 'columns', READ, getTargetIdFromParams),
            'getById': hasRightOn('projects', 'columns', READ, getTargetIdFromParams),
            'patch': hasRightOn('projects', 'columns', WRITE, getTargetIdFromParams),
            'update': hasRightOn('projects', 'columns', WRITE, getTargetIdFromParams),
            'delete': hasRightOn('projects', 'columns', REFERENCE, getTargetIdFromParams),
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
        let userRights = kanbearRights.load()
        Konsol.log("KanbearRightsChecker userRights", userRights)
        let entityId = req.params.id ?? 0
        try {
            console.log("KanbearRightsChecker", "isAllowed()", "<kind>", kind, "<op>", op, "<entityId>", entityId)
            //console.log("KanbearRightsChecker", "checkerFunctions", KanbearRightsChecker.checkerFunctions)
            //console.log("KanbearRightsChecker", "checkerFunctions", KanbearRightsChecker.checkerFunctions["workspaces"])
            let checkerFunction = KanbearRightsChecker.checkerFunctions[kind][op]
            console.log("KanbearRightsChecker", "<checkerFunction>", checkerFunction)
            let auth = checkerFunction(entityId, req, userRights)
            return (auth)
        } catch (err) {
            Konsol.log("KanbearRightsChecker err", err)
            Konsol.log("KanbearRightsChecker", "Error on checkerFunction found !", err)
            return (true)
        }
    }
}

export { KanbearRightsChecker }
