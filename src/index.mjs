// Variable globale pour stocker le JSON
//import { renderTable } from './report.mjs'
//import { KanboardFilter } from './classes/KanboardFilter.mjs'
import { KanbanPanel } from './classes/KanbanPanel.mjs';
import { KanbearEntityFactory } from './classes/KanbearEntityFactory.mjs';
import { KanbearAssigneePanel } from './classes/KanbearAssigneePanel.mjs';
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
import { buildWorkspaceLink, buildProjectLink } from './utils/linkBuilder.mjs';
import { buildAddDummyButton, buildAddProjectButton, buildAddWorkspaceButton } from './utils/buttonBuilder.mjs';

await Kontext.loadConfig()
buildWorkspacesSelectBox()
buildKanbearProjectsSelectBox()


document.addEventListener("workspaceCreated", (ev) => {
    console.log("workspaceCreated listener fired <ev>", ev)
    buildWorkspacesSelectBox()
})

document.addEventListener("workspaceModified", async (ev) => {
    console.log("workspaceModified listener fired <ev>", ev)
    const wsEntity = await KanbearEntityFactory.generate('workspace')
    wsEntity.setId(ev.detail.workspaceId)
    let ws = await wsEntity.get()
    console.log("workspaceModified ws", ws)
    //document.getElementById("workspace").innerHTML = `${ws.id} ${ws.name}`
    let workspaceLink = buildWorkspaceLink(ws.id, ws.name)
    document.getElementById("workspace").replaceChildren(workspaceLink)
    buildWorkspacesSelectBox()
})

//document.querySelectorAll("projectCreated").addEventListener("projectCreated", (ev) => {
document.addEventListener("projectCreated", async (ev) => {
    console.log("projectCreated listener fired <ev>", ev)
    //buildKanbearProjectsSelectBox()
    await Kontext.setProject(ev.detail.projectId);
    sendEvent("_projectReloaded", { projectId: ev.detail.projectId })
    new KanbanPanel().render()
})

document.addEventListener("projectSelected", async (ev) => {
    console.log("projectSelected listener fired <ev>", ev)
    //buildKanbearProjectsSelectBox()
    await Kontext.setProject(ev.detail.projectId);
    sendEvent("_projectReloaded", { projectId: ev.detail.projectId })
    //let projectLink=buildProjectLink(Kontext.getCurrentProjectId(),Kontext.getCurrentProjectName())
    //document.getElementById("project").replaceChildren(projectLink)
    const kb = await KanbanPanel.builder()
    kb.render()
})

document.addEventListener("projectModified", async (ev) => {
    console.log("index.mjs() project modified listener fired <ev>", ev)
    //buildKanbearProjectsSelectBox()
    await Kontext.setProject(ev.detail.projectId);
    sendEvent("_projectReloaded", { projectId: ev.detail.projectId })
    //let projectLink=buildProjectLink(Kontext.getCurrentProjectId(),Kontext.getCurrentProjectName())
    //document.getElementById("project").replaceChildren(projectLink)
    const kb = await KanbanPanel.builder()
    kb.render()
})

// Event _projectReloaded : "subevent" to update various things
document.addEventListener("_projectReloaded", async (ev) => {
    console.log("index.mjs() _projectReloaded listener fired <ev>", ev)
    buildKanbearProjectsSelectBox()
    let projectLink = buildProjectLink(Kontext.getCurrentProjectId(), Kontext.getCurrentProjectName())
    document.getElementById("project").replaceChildren(projectLink)
    //const kb = await KanbanPanel.builder()
    //kb.render()
})

document.addEventListener("projectDeleted", (ev) => {
    console.log("projectDeleted listener fired <ev>", ev)
    sendEvent("_projectReloaded", { projectId: ev.detail.projectId })
    //buildKanbearProjectsSelectBox()
})

document.addEventListener("swimlaneCreated", async (ev) => {
    console.log("index.mjs() swimlane listener fired <ev>", ev)
    const kb = await KanbanPanel.builder()
    kb.render()
})

document.addEventListener("swimlaneModified", async (ev) => {
    console.log("index.mjs() swimlane listener fired <ev>", ev)
    const kb = await KanbanPanel.builder()
    kb.render()
})

document.addEventListener("assigneeCreated", async (ev) => {
    console.log("index.mjs() assigneeCreated listener fired <ev>", ev)
    new KanbearAssigneePanel().render()
})

document.addEventListener("assigneeDeleted", async (ev) => {
    console.log("index.mjs() assigneeDeleted listener fired <ev>", ev)
    new KanbearAssigneePanel().render()
})

document.addEventListener("assigneeModified", async (ev) => {
    new KanbearAssigneePanel().render()
})

document.addEventListener("columnCreated", async (ev) => {
    console.log("index.mjs() column listener fired <ev>", ev)
    const kb = await KanbanPanel.builder()
    kb.render()
})

document.addEventListener("columnModified", async (ev) => {
    console.log("index.mjs() column listener fired <ev>", ev)
    const kb = await KanbanPanel.builder()
    kb.render()
})

document.addEventListener("taskCreated", async (ev) => {
    console.log("index.mjs() task listener fired <ev>", ev)
    const kb = await KanbanPanel.builder()
    kb.render()
})
document.addEventListener("taskModified", async (ev) => {
    console.log("index.mjs() task modified listener fired <ev>", ev)
    const kb = await KanbanPanel.builder()
    kb.render()
})
document.addEventListener("dialogCanceled", async (ev) => {
    console.log("index.mjs() dialogCanceled listener fired <ev>", ev)
    const kb = await KanbanPanel.builder()
    kb.render()
})
document.addEventListener("error", async (ev) => {
    console.log("index.mjs() error listener fired <ev>", ev)
    document.getElementById("message").innerHTML = "Error : " + ev.detail.error
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
        //projects.unshift({ id: -1, name: '* Create new project' })
    }
    console.log("buildKanbearProjectsSelectBox <Kontext.getCurrentProjectId>", Kontext.getCurrentProjectId())
    let boxName = "kanbearProjectSelectBox"
    let buttons = []

    if (workspaceId > 0) {
        buttons.push(buildAddProjectButton(workspaceId))
    } else {
        buttons.push(buildAddDummyButton())
    }
    let boxParams = {
        domId: boxName,
        boxLabel: "Project",
        buttons: buttons,
        items: projects,
        labelText: "Project",
        klass: "filter-group",
        selectedOption: Kontext.getCurrentProjectId()
    }
    let wsDiv = await selectBoxBuilder(boxParams)
    wsDiv.classList.add("projectCreated")
    document.getElementById("kanbearProjectsDiv").replaceChildren(wsDiv)
    document.getElementById(boxName).addEventListener('change', async (e) => {
        console.log({ boxName }, e.target)
        let projectId = e.target.value;
        //Kontext.setProject(e.target.value);
        //let projectLink=buildProjectLink(projectId,"xxx")
        //document.getElementById("project").replaceChildren(projectLink)
        sendEvent("projectSelected", { projectId: projectId })
    });
}

//---------------------------------------------------------------------------------
async function buildWorkspacesSelectBox() {
    let wss0
    let wss = []

    while (!Array.isArray(wss0)) {
        try {
            wss0 = await Workspace.getAll('workspaces')
            console.log("buildWorkspacesSelectBox()", wss0)
            //if (!Array.isArray(wss0)) {
            //    throw("Workspaces list not avalailable")
            //}
        } catch (err) {
            document.getElementById("message").innerHTML = "Cannot get workspace list (is back launched ?)"
            setTimeout(function () {
                location.reload();
            }, 3000);
        }
    }
    document.getElementById("message").innerHTML = "Ready"
    wss = wss0

    // as wss will be modified, let's keep a copy
    let wssOrigin = []
    for (let i = 0; i < wss.length; i++) {
        wssOrigin[i] = wss[i]
    }
    console.log("wssOrigin init", wssOrigin)

    //wss.unshift({ id: -1, name: '* Create new workspace' })
    let addWorkspaceButton = buildAddWorkspaceButton()
    let boxName = "kanbearWorkspaceSelectBox"
    let boxParams = {
        domId: boxName,
        boxLabel: "workspace",
        buttons: [addWorkspaceButton],
        items: wss,
        labelText: "Workspace",
        klass: "filter-group",
        selectedOption: Kontext.getWorkspaceId()
        //headItems:[['* Create new workspace',-1]]
    }
    let wsDiv = await selectBoxBuilder(boxParams)
    document.getElementById("kanbearWorkspacesDiv").replaceChildren(wsDiv)
    document.getElementById(boxName).addEventListener('change', async (e) => {
        Kontext.setWorkspaceId(e.target.value);
        let workspaceId = parseInt(e.target.value)
        if (workspaceId < 0) {
            return
        }
        //console.log("wss",e.wss)
        let box = document.getElementById("kanbearWorkspaceSelectBox")

        //let addedElementsCount=box.length-wssOrigin.length
        console.log("wssOrigin in listener", wssOrigin)
        const ws = wssOrigin.find((element) => element.id == workspaceId)
        console.log("ws", ws)
        document.getElementById("workspace").innerHTML = `${ws.id} ${ws.name}`
        let workspaceLink = buildWorkspaceLink(ws.id, ws.name)
        document.getElementById("workspace").replaceChildren(workspaceLink)
        buildKanbearProjectsSelectBox()
        console.log({ boxName }, e.target.value)
    });
}

//------------------- migrate from kanboard to kanbear --------------------------------------
function migrateFromKanboard() {
    new KanbearMigrator().migrate()
}

//------------------- migrate from kanboard to kanbear --------------------------------------
document.getElementById('migrateFromKanboard').addEventListener('click', () => {
    new KanbearMigrator().migrate()
});

//------------------- showDetails --------------------------------------
document.getElementById('assigneePanel').addEventListener('click', () => {
    new KanbearAssigneePanel().render()
});

//------------------- showDetails --------------------------------------
document.getElementById('showDetails').addEventListener('click', () => {
    new KanboardListPanel().render()
});

//------------------- kanban --------------------------------------
document.getElementById('kanban').addEventListener('click', () => {
    new KanbanPanel().render()
});


// Effacer les données
document.getElementById('clearProjects').addEventListener('click', () => {
    new KanbearProjectCleanor().cleanup()
});



