import { ApiCaller } from "./ApiCaller.mjs"
import { Assignee } from './Assignee.mjs'
import { Column } from './Column.mjs'
import { Project } from './Project.mjs'
import { ProjectsRights } from "./ProjectsRights.mjs"
import { WorkspacesRights } from "./WorkspacesRights.mjs"
import { Swimlane } from './Swimlane.mjs'
import { Task } from './Task.mjs'
import { TasksComments } from './TasksComments.mjs'
import { User } from './User.mjs'
import { Workspace } from './Workspace.mjs'

class KanbearEntityFactory {
    //------------------------------------------------------------------------
    static async generate(kind,parms={}) {
        switch (kind) {
            case 'assignee':
                return new Assignee(parms)
                break
            case 'column':
                return new Column(parms)
                break
            case 'project':
                return new Project(parms)
                break
            case 'projectsRights':
                return new ProjectsRights(parms)
                break
            case 'swimlane':
                return new Swimlane(parms)
                break
            case 'task':
                return new Task(parms)
                break
            case 'tasksComments':
                return new TasksComments(parms)
                break
            case 'user':
                return new User(parms)
                break
            case 'workspace':
                return new Workspace(parms)
                break
            case 'workspacesRights':
                return new WorkspacesRights(parms)
                break
            default:
                console.log("KanbearEntity.generate() bad kind", kind)
                break
        }
    }

}

export { KanbearEntityFactory }
