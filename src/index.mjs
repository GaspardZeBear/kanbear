// Variable globale pour stocker le JSON
//import { renderTable } from './report.mjs'
//import { KanboardFilter } from './classes/KanboardFilter.mjs'
import { KanbanPanel } from './classes/KanbanPanel.mjs';
import { KanboardListPanel } from './classes/KanboardListPanel.mjs';
import { KanbearMigrator } from './classes/KanbearMigrator.mjs';
import { Kontext } from './classes/Kontext.mjs';
import { Workspace } from './classes/Workspace.mjs';
import { Project } from './classes/Project.mjs';
import { selectBoxBuilder } from './utils/selectBoxBuilder.mjs'

await Kontext.loadConfig()
buildWorkspacesSelectBox()
document.addEventListener("workspaceCreated", (ev) => {
    console.log("workspaceCreated listener fired <ev>", ev)
    buildWorkspacesSelectBox()
})
buildKanbearProjectsSelectBox()
//document.querySelectorAll("projectCreated").addEventListener("projectCreated", (ev) => {
document.addEventListener("projectCreated", (ev) => {
    console.log("projectCreated listener fired <ev>", ev)
    buildKanbearProjectsSelectBox()
})
//document.getElementById(project.id).addEventListener("taskModified", (ev) => {


document.getElementById('kanboard').href = Kontext.getKanboardUrl()

document.getElementById('loadJson').addEventListener('click', async () => {
    try {
        const response = await Kontext.loadKanbearJsonBulkData()
        document.getElementById('results').innerHTML = '<pre>' + JSON.stringify(Kontext.getJsonBulkData(), null, 2) + '</pre>';
        document.getElementById('message').innerHTML = '<p>Loaded</p>';
    } catch (error) {
        document.getElementById('message').innerHTML = `<p style="color: red;">Erreur: ${error.message}</p>`;
    }
})

//---------------------------------------------------------------------------------
async function buildKanbearProjectsSelectBox() {
    let workspaceId = Kontext.getWorkspaceId()
    let projects = []
    console.log("buildKanbearProjectsSelectBox() <workspaceId>", workspaceId)
    if (workspaceId) {
        projects = await Project.getAll('projects', { workspace_id: workspaceId })
    }
    let boxName = "kanbearProjectSelectBox"
    let boxParams = {
        domId: boxName,
        boxLabel: "project",
        items: projects,
        labelText: "kanbear project",
        klass: "filter-group",
        //headItems:[['* Create new workspace',-1]]
    }
    let wsDiv = await selectBoxBuilder(boxParams)
    wsDiv.classList.add("projectCreated")
    document.getElementById("kanbearProjectsDiv").replaceChildren(wsDiv)
    document.getElementById(boxName).addEventListener('change', async (e) => {
        console.log({ boxName }, e.target)
        Kontext.setProject(e.target.value, "xxx");

    });

}

//---------------------------------------------------------------------------------
async function buildWorkspacesSelectBox() {
    let wss = await Workspace.getAll('workspaces')
    // let wsDiv = await this.buildTargetWorkspaceSelectBox("targetWorspaceSelectBox", wss, "target workspace")
    let boxName = "kanbearWorkspaceSelectBox"
    let boxParams = {
        domId: boxName,
        boxLabel: "workspace",
        items: wss,
        labelText: "workspace",
        klass: "filter-group",
        //headItems:[['* Create new workspace',-1]]
    }
    let wsDiv = await selectBoxBuilder(boxParams)
    document.getElementById("kanbearWorkspacesDiv").replaceChildren(wsDiv)
    document.getElementById(boxName).addEventListener('change', async (e) => {
        Kontext.setWorkspaceId(e.target.value);
        buildKanbearProjectsSelectBox()
        console.log({ boxName }, e.target.value)
    });
}

//---------------------------------------------------------------------------------
function getFiltersMap() {
    const projectFilter = document.getElementById('projectFilter').value
    const swimlaneFilter = document.getElementById('swimlaneFilter').value
    const taskFilter = document.getElementById('taskFilter').value
    const columnFilter = document.getElementById('columnFilter').value
    const assigneeFilter = document.getElementById('assigneeFilter').value
    return ({
        projectFilter: projectFilter,
        swimlaneFilter, swimlaneFilter,
        taskFilter: taskFilter,
        columnFilter: columnFilter,
        assigneeFilter: assigneeFilter
    })
}


//------------------- migrate from kanboard to kanbear --------------------------------------
document.getElementById('migrate').addEventListener('click', () => {
    new KanbearMigrator('results', getFiltersMap()).migrate()
});


//------------------- showDetails --------------------------------------
document.getElementById('showDetails').addEventListener('click', () => {
    new KanboardListPanel('results', getFiltersMap()).render()
});

//------------------- kanban --------------------------------------
document.getElementById('kanban').addEventListener('click', () => {
    new KanbanPanel('results', getFiltersMap()).render()
});


// Effacer les données
document.getElementById('clearProjects').addEventListener('click', () => {
    globalJsonData = null;
    document.getElementById('message').textContent = 'No projects loaded';
    document.getElementById('results').innerHTML = '<p></p>';
});



