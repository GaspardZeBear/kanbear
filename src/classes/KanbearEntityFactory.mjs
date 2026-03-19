import { ApiCaller } from "./ApiCaller.mjs"
import { Column} from './Column.mjs'
import { Project} from './Project.mjs'
import { Swimlane} from './Swimlane.mjs'
import { Task} from './Task.mjs'
import { Workspace} from './Workspace.mjs'

class KanbearEntityFactory {
    //------------------------------------------------------------------------
    static async generate(entity) {
        switch (entity) {
            case 'column': 
            return new Column({})
                break
            case 'project': 
            return new Project({})
                break
            case 'swimlane': 
            return new Swimlane({})
                break
            case 'task': 
            return new Task({})
                break
            case 'workspace': 
            return new Workspace({})
                break
            default:
                console.log("KanbearEntity.generate() bad entity", entity)
                break
        }
    }

}

export { KanbearEntityFactory }
