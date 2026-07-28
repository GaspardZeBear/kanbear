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

//-----------------------------------------------------
function getTaskProjectId(id, req) {
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
         Konsol.log("KanbearRightChecker.getProjectIdFromTask()","params",params)
        project_id = params[0].project_id
    } );
    return(project_id)
}

function getProjectIdFromTask(target, id, req) {
    let project_id = getTaskProjectId(id, req)
    Konsol.log("KanbearRightChecker.getProjectIdFromTask()","project_id",project_id)
    return(project_id)
}

function getProjectIdFromBody(target, id, req) {
}

function getProjectIdFromParams(target, id, req) {
}


class KanbearRightsChecker {

    static READ = 1      // can READ this oject (modify attritbute)
    static WRITE = 2     // can write this oject (modify attritbute)
    static REFERENCE = 4 // is allowed to have a reference (iE foreign_key) to this object
    //static x={}

    static fnTrue(id, req) {
        Konsol.log("fn")
        return (true)
    }
    static fnFalse(id, req) {
        Konsol.log("fn")
        return (false)
    }

    static hasRightOn(target, kind, requiredRight, idFn) {
        // target is the final object to have rights on
        // kind is the current object
        // Read it as : to make action on kind, must have right xxx on target
        // The kind objects contains somewhere the id of target.
        // idFn is a function that will return targetId : workspace or projectId  
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


        Konsol.log("KanbearRightsChecker hasRightOnProject()", "target", target, "kind", kind, "requiredRight", requiredRight, "idFn", idFn)
        console.log("KanbearRightsChecker hasRightOnProject()", "idFn", idFn)
        return ((id, req) => {
            // id is :
            //   the id of the object (ex task)
            // or 0 if create
            console.log("KanbearRightsChecker hasRightOnProject()", "invoke idFn", idFn)
            idFn(target, id, req)
            Konsol.log("hasRightOnProject()", "kind", kind, "requiredRight", requiredRight)
            Konsol.log("hasRightOnProject()", "fired params", req.params)
            Konsol.log("hasRightOnProject()", "fired body", req.body)
            return (true)
        })
    }

    static checkerFunctions = {
        'workspace': {
            'create': KanbearRightsChecker.fnFalse,
            'getAll': KanbearRightsChecker.fnTrue,
            'getById': KanbearRightsChecker.fnTrue,
            'getByForeignKey': KanbearRightsChecker.fnTrue,
            'update': KanbearRightsChecker.fnFalse,
            'patch': KanbearRightsChecker.hasRightOn('workspaces', 'workspaces', KanbearRightsChecker.WRITE, []),
            'delete': KanbearRightsChecker.fnFalse
        },
        'tasks': {
            'create': KanbearRightsChecker.hasRightOn('projects', 'tasks', KanbearRightsChecker.REFERENCE, getProjectIdFromTask),
            'getAll': KanbearRightsChecker.hasRightOn('projects', 'tasks', KanbearRightsChecker.READ, getProjectIdFromTask),
            'getById': KanbearRightsChecker.hasRightOn('projects', 'tasks', KanbearRightsChecker.READ, getProjectIdFromTask),
            'patch': KanbearRightsChecker.hasRightOn('projects', 'tasks', KanbearRightsChecker.WRITE, getProjectIdFromTask),
            'update': KanbearRightsChecker.hasRightOn('projects', 'tasks', KanbearRightsChecker.WRITE, getProjectIdFromTask),
            'delete': KanbearRightsChecker.hasRightOn('projects', 'tasks', KanbearRightsChecker.REFERENCE, getProjectIdFromTask),
        },
        'swimlanes': {
            'create': KanbearRightsChecker.hasRightOn('projects', 'swimlanes', KanbearRightsChecker.REFERENCE, getProjectIdFromBody),
            'getAll': KanbearRightsChecker.hasRightOn('projects', 'swimlanes', KanbearRightsChecker.READ, getProjectIdFromParams),
            'getById': KanbearRightsChecker.hasRightOn('projects', 'swimlanes', KanbearRightsChecker.READ, getProjectIdFromParams),
            'patch': KanbearRightsChecker.hasRightOn('projects', 'swimlanes', KanbearRightsChecker.WRITE, getProjectIdFromParams),
            'update': KanbearRightsChecker.hasRightOn('projects', 'swimlanes', KanbearRightsChecker.WRITE, getProjectIdFromParams),
            'delete': KanbearRightsChecker.hasRightOn('projects', 'swimlanes', KanbearRightsChecker.REFERENCE, getProjectIdFromParams),
        },
        'columns': {
            'create': KanbearRightsChecker.hasRightOn('projects', 'columns', KanbearRightsChecker.REFERENCE, getProjectIdFromBody),
            'getAll': KanbearRightsChecker.hasRightOn('projects', 'columns', KanbearRightsChecker.READ, getProjectIdFromParams),
            'getById': KanbearRightsChecker.hasRightOn('projects', 'columns', KanbearRightsChecker.READ, getProjectIdFromParams),
            'patch': KanbearRightsChecker.hasRightOn('projects', 'columns', KanbearRightsChecker.WRITE, getProjectIdFromParams),
            'update': KanbearRightsChecker.hasRightOn('projects', 'columns', KanbearRightsChecker.WRITE, getProjectIdFromParams),
            'delete': KanbearRightsChecker.hasRightOn('projects', 'columns', KanbearRightsChecker.REFERENCE, getProjectIdFromParams),
        }
    }

    //---------------------------------------------------------------------------------
    isAllowed(kind, op, id, req) {
        Konsol.log("KanbearRightsChecker", "isAllowed()", kind, op, id)
        if (req.kanbearKontext.rights.isAdmin) {
            return (true)
        }
        try {
            return (KanbearRightsChecker.checkerFunctions[kind][op](id, req))
        } catch (err) {
            console.log("KanbearRightsChecker err", err)
            Konsol.log("KanbearRightsChecker", "no checkerFunction found !", err)
            return (true)
        }
    }
}

export { KanbearRightsChecker }
