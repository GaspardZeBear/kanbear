//---------------------------------------------------------------------------------
function getFiltersMap() {
    const workspaceFilter = document.getElementById('workspaceFilter').value
    const projectFilter = document.getElementById('projectFilter').value
    const swimlaneFilter = document.getElementById('swimlaneFilter').value
    const taskFilter = document.getElementById('taskFilter').value
    const columnFilter = document.getElementById('columnFilter').value
    const assigneeFilter = document.getElementById('assigneeFilter').value
    return ({
        workspaceFilter: workspaceFilter,
        projectFilter: projectFilter,
        swimlaneFilter: swimlaneFilter,
        taskFilter: taskFilter,
        columnFilter: columnFilter,
        assigneeFilter: assigneeFilter
    })
}

export { getFiltersMap }