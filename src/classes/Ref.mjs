import { Kontext } from "./Kontext.mjs"

class Ref {

    constructor() {
        this.ref = ''
    }

    setRef(name, projectId, swimlaneId, taskId) {
        this.name = name
        this.projectId = projectId
        this.swimlaneId = swimlaneId
        this.taskId = taskId
        this.ref = `${name}:${projectId}:${swimlaneId}:${taskId}`
    }

    //-----------------------------------------------------------------------------------------
    static getRef(name, projectId, swimlaneId, taskId,columId="_") {
        return(`${name}:${projectId}:${swimlaneId}:${taskId}:${columId}`)
    }
    
    //-----------------------------------------------------------------------------------------
    static getRefFromTask(name, task) {
        let swimlaneId=task.swimlane_id
        let projectId=task.project_id
        let columnId=task.column_id
        return(Ref.getRef(name,projectId,swimlaneId,task.id,columnId))
    }

    //-----------------------------------------------------------------------------------------
    static getObjectsFromRef(ref) {
        let [name, projectId, swimlaneId, taskId, columnId] = ref.split(':')
        console.log(ref)
        let project=Kontext.getJsonBulkData()[projectId]
        console.log(project.swimlanes[swimlaneId].tasks, " --- ", taskId)
        let columnId1 = project.swimlanes[swimlaneId].tasks[taskId].column_id
        let swimlane=project.swimlanes[swimlaneId]
        //let project = this.projects[projectId]
        let task = project.swimlanes[swimlaneId].tasks[taskId]
        let column = project.columns[columnId1]
        return ([name, project, swimlane, task, column])
    }

    //-----------------------------------------------------------------------------------------
    static getIdsFromRef(ref) {
        let [name, projectId, swimlaneId, taskId, columnId] = ref.split(':')
        console.log(ref)
        let project=Kontext.getJsonBulkData()[projectId]
        console.log(project.swimlanes[swimlaneId].tasks, " --- ", taskId)
        let columnId1 = project.swimlanes[swimlaneId].tasks[taskId].column_id
        //let project = this.projects[projectId]
        //let task = this.projects[projectId].swimlanes[swimlaneId].tasks[taskId]
        //let column = this.projects[projectId].columns[columnId]
        return ([name, projectId, swimlaneId, taskId, columnId1])
    }

}

export { Ref }