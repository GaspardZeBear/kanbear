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
    static getRef(name, projectId, swimlaneId, taskId) {
        return(`${name}:${projectId}:${swimlaneId}:${taskId}`)
    }

    //-----------------------------------------------------------------------------------------
    static getObjectsFromRef(ref) {
        let [name, projectId, swimlaneId, taskId] = ref.split(':')
        console.log(ref)
        console.log(this.projects[projectId].swimlanes[swimlaneId].tasks, " --- ", taskId)
        let columnId = this.projects[projectId].swimlanes[swimlaneId].tasks[taskId].column_id
        let swimlane=this.projects[projectId].swimlanes[swimlaneId]
        let project = this.projects[projectId]
        let task = this.projects[projectId].swimlanes[swimlaneId].tasks[taskId]
        let column = this.projects[projectId].columns[columnId]
        return ([name, project, swimlane, task, column])
    }

    //-----------------------------------------------------------------------------------------
    static getIdsFromRef(ref) {
        let [name, projectId, swimlaneId, taskId] = ref.split(':')
        console.log(ref)
        console.log(this.projects[projectId].swimlanes[swimlaneId].tasks, " --- ", taskId)
        let columnId = this.projects[projectId].swimlanes[swimlaneId].tasks[taskId].column_id
        //let project = this.projects[projectId]
        //let task = this.projects[projectId].swimlanes[swimlaneId].tasks[taskId]
        //let column = this.projects[projectId].columns[columnId]
        return ([name, projectId, swimlaneId, taskId, columnId])
    }

}

export { Ref }