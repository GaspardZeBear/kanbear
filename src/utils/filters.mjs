//---------------------------------------------------------------------------------
import { getOpenCloseParmBoolean } from "./openClose.mjs"
function getFiltersMap() {
    console.log("getFiltersMap()",document.getElementById("workspacesOpenedCheckbox").checked)
    console.log("getFiltersMap()",document.getElementById("projectsOpenedCheckbox").checked)
    console.log("getFiltersMap()",document.getElementById("swimlanesOpenedCheckbox").checked)
    console.log("getFiltersMap()",document.getElementById("tasksOpenedCheckbox").checked)
    return ({
        workspaceFilter: document.getElementById('workspaceFilter').value,
        projectFilter: document.getElementById('projectFilter').value,
        swimlaneFilter: document.getElementById('swimlaneFilter').value,
        taskFilter: document.getElementById('taskFilter').value,
        columnFilter: document.getElementById('columnFilter').value,
        assigneeFilter: document.getElementById('assigneeFilter').value,
        OCFilter: {
            workspace: getOpenCloseParmBoolean('workspace',
                document.getElementById("workspacesOpenedCheckbox").checked,
                document.getElementById("workspacesClosedCheckbox").checked),
            project: getOpenCloseParmBoolean('project',
                document.getElementById("projectsOpenedCheckbox").checked,
                document.getElementById("projectsClosedCheckbox").checked),
            swimlane: getOpenCloseParmBoolean('swimlane',
                document.getElementById("swimlanesOpenedCheckbox").checked,
                document.getElementById("swimlanesClosedCheckbox").checked),
            task: getOpenCloseParmBoolean('task',
                document.getElementById("tasksOpenedCheckbox").checked,
                document.getElementById("tasksClosedCheckbox").checked),
        }
        /*
        workspacesOpenedFilter: document.getElementById("workspacesOpenedCheckbox").checked,
        workspacesClosedFilter: document.getElementById("workspacesClosedCheckbox").checked,
        projectsOpenedFilter: document.getElementById("projectsOpenedCheckbox").checked,
        projectsClosedFilter: document.getElementById("projectsClosedCheckbox").checked,
        swimlanesOpenedFilter: document.getElementById("swimlanesOpenedCheckbox").checked,
        swimlanesClosedFilter:  document.getElementById("swimlanesClosedCheckbox").checked,
        tasksOpenedFilter: document.getElementById("tasksOpenedCheckbox").checked,
        tasksClosedFilter: document.getElementById("tasksClosedCheckbox").checked,
        */
    })
}

export { getFiltersMap }