//---------------------------------------------------------------------------------
function getFiltersMap() {
    const projectFilter = document.getElementById('projectFilter').value
    const swimlaneFilter = document.getElementById('swimlaneFilter').value
    const taskFilter = document.getElementById('taskFilter').value
    const columnFilter = document.getElementById('columnFilter').value
    const assigneeFilter = document.getElementById('assigneeFilter').value
    return ({
        projectFilter: projectFilter,
        swimlaneFilter: swimlaneFilter,
        taskFilter: taskFilter,
        columnFilter: columnFilter,
        assigneeFilter: assigneeFilter
    })
}

export { getFiltersMap }