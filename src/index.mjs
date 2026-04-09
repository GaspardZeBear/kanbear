// Variable globale pour stocker le JSON
//import { renderTable } from './report.mjs'
//import { KanboardFilter } from './classes/KanboardFilter.mjs'
import { KanbanPanel } from './classes/KanbanPanel.mjs';
import { KanboardListPanel } from './classes/KanboardListPanel.mjs';
import { KanbearMigrator } from './classes/KanbearMigrator.mjs';
import { KanbearProjectCleanor } from './classes/KanbearProjectCleanor.mjs';
import { Kontext } from './classes/Kontext.mjs';
import { Workspace } from './classes/Workspace.mjs';
import { Project } from './classes/Project.mjs';
import { selectBoxBuilder } from './utils/selectBoxBuilder.mjs'
import { ProjectDialog } from './classes/ProjectDialog.mjs'
import { WorkspaceDialog } from './classes/WorkspaceDialog.mjs'
import { sendEvent } from './utils/sendEvent.mjs';

await Kontext.loadConfig()
buildWorkspacesSelectBox()
document.addEventListener("workspaceCreated", (ev) => {
    console.log("workspaceCreated listener fired <ev>", ev)
    buildWorkspacesSelectBox()
})
buildKanbearProjectsSelectBox()
//document.querySelectorAll("projectCreated").addEventListener("projectCreated", (ev) => {
document.addEventListener("projectCreated", async (ev) => {
    console.log("projectCreated listener fired <ev>", ev)
    buildKanbearProjectsSelectBox()
    await Kontext.setProject(ev.detail.projectId);
    new KanbanPanel('results', getFiltersMap()).render()
})
document.addEventListener("projectSelected", async (ev) => {
    console.log("projectSelected listener fired <ev>", ev)
    buildKanbearProjectsSelectBox()
    await Kontext.setProject(ev.detail.projectId);
    const kb = await KanbanPanel.builder('results', getFiltersMap())
    kb.render()
    //new KanbanPanel('results', getFiltersMap()).render()
})

document.addEventListener("projectModified", async (ev) => {
    console.log("index.mjs() project modified listener fired <ev>", ev)
    const kb = await KanbanPanel.builder('results', getFiltersMap())
    kb.render()
})
document.addEventListener("projectDeleted", (ev) => {
    console.log("projectDeleted listener fired <ev>", ev)
    buildKanbearProjectsSelectBox()
})

document.addEventListener("swimlaneCreated", async (ev) => {
    console.log("index.mjs() swimlane listener fired <ev>", ev)
    const kb = await KanbanPanel.builder('results', getFiltersMap())
    kb.render()
})

document.addEventListener("swimlaneModified", async (ev) => {
    console.log("index.mjs() swimlane listener fired <ev>", ev)
    const kb = await KanbanPanel.builder('results', getFiltersMap())
    kb.render()
})

document.addEventListener("columnCreated", async (ev) => {
    console.log("index.mjs() column listener fired <ev>", ev)
    const kb = await KanbanPanel.builder('results', getFiltersMap())
    kb.render()
})

document.addEventListener("taskCreated", async (ev) => {
    console.log("index.mjs() task listener fired <ev>", ev)
    const kb = await KanbanPanel.builder('results', getFiltersMap())
    kb.render()
})
document.addEventListener("taskModified", async (ev) => {
    console.log("index.mjs() task modified listener fired <ev>", ev)
    const kb = await KanbanPanel.builder('results', getFiltersMap())
    kb.render()
})
document.addEventListener("dialogCanceled", async (ev) => {
    console.log("index.mjs() dialogCanceled listener fired <ev>", ev)
    const kb = await KanbanPanel.builder('results', getFiltersMap())
    kb.render()
})
document.addEventListener("error", async (ev) => {
    console.log("index.mjs() error listener fired <ev>", ev)
    document.getElementById("message").innerHTML = "Error : "+ ev.detail.error
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
        projects.unshift({ id: -1, name: '* Create new project' })
    }

    let boxName = "kanbearProjectSelectBox"
    let boxParams = {
        domId: boxName,
        boxLabel: "project",
        items: projects,
        labelText: "kanbear project",
        klass: "filter-group",
        //selected: "myProject"
    }
    let wsDiv = await selectBoxBuilder(boxParams)
    wsDiv.classList.add("projectCreated")
    document.getElementById("kanbearProjectsDiv").replaceChildren(wsDiv)
    document.getElementById(boxName).addEventListener('change', async (e) => {
        console.log({ boxName }, e.target)
        let projectId = e.target.value;
        if (projectId == -1) {
            //let newProject =new ProjectDialog("create",workspaceId)
            let newProject = new ProjectDialog()
            newProject.create(workspaceId)
            return
        }
        //Kontext.setProject(e.target.value);
        sendEvent("projectSelected", { projectId: projectId })
    });
}

//---------------------------------------------------------------------------------
async function buildWorkspacesSelectBox() {
    let wss0 = await Workspace.getAll('workspaces')
    // let wsDiv = await this.buildTargetWorkspaceSelectBox("targetWorspaceSelectBox", wss, "target workspace")

    // maybe apigateway is not prsent -----------------------
    console.log("buildWorkspacesSelectBox()", wss0)
    let wss = []
    if (!Array.isArray(wss0)) {
        document.getElementById("message").innerHTML = wss0
        setTimeout(function () {
            location.reload();
        }, 3000);
    } else {
        document.getElementById("message").innerHTML = "Ready"
        wss = wss0
    }


    wss.unshift({ id: -1, name: '* Create new workspace' })
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
        let workspaceId = parseInt(e.target.value)
        if (workspaceId == -1) {
            //let newProject =new ProjectDialog("create",workspaceId)
            let newWorkspace = new WorkspaceDialog()
            newWorkspace.create()
            return
        }
        if (workspaceId < 0) {
            return
        }
        //console.log("wss",e.wss)
        let box = document.getElementById("kanbearWorkspaceSelectBox")

        // Buggy !!? If lot of elements with value < 0!!
        let index = workspaceId + 1
        console.log("box index", index)
        console.log("box", box)
        console.log("box", box[index].innerText)
        document.getElementById("workspace").innerHTML = box[index].innerText
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
    new KanbearProjectCleanor('results', getFiltersMap()).cleanup()
});



