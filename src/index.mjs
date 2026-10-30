// Variable globale pour stocker le JSON
//import { renderTable } from './report.mjs'
//import { KanboardFilter } from './classes/KanboardFilter.mjs'
import { KanbanPanel } from './classes/KanbanPanel.mjs';
import { KanbearEntityFactory } from './classes/KanbearEntityFactory.mjs';
import { KanbearAssigneePanel } from './classes/KanbearAssigneePanel.mjs';
import { KanbearUserPanel } from './classes/KanbearUserPanel.mjs';
import { KanbearListPanel } from './classes/KanbearListPanel.mjs';
import { KanbearMigrator } from './classes/KanbearMigrator.mjs';
import { KanbearProjectCleanor } from './classes/KanbearProjectCleanor.mjs';
import { Kontext } from './classes/Kontext.mjs';
import { Workspace } from './classes/Workspace.mjs';
import { Project } from './classes/Project.mjs';
import { Columns } from './classes/Columns.mjs';
import { selectBoxBuilder } from './utils/selectBoxBuilder.mjs'
import { ProjectDialog } from './classes/ProjectDialog.mjs'
import { WorkspaceDialog } from './classes/WorkspaceDialog.mjs'
import { sendEvent } from './utils/sendEvent.mjs';
import { buildWorkspaceLink, buildProjectLink } from './utils/linkBuilder.mjs';
import { buildAddDummyButton, buildAddProjectButton, buildAddWorkspaceButton } from './utils/buttonBuilder.mjs';
import { getOpenCloseParmBoolean } from './utils/openClose.mjs'
import { UserDialog } from './classes/UserDialog.mjs';
import { LoginDialog } from './classes/LoginDialog.mjs'
import { createElement, buildKanbearProjectsSelectBox, buildWorkspacesSelectBox } from './utils/createHtml.mjs';
import { sendMessage, sendErrorMessage } from './utils/sendMessage.mjs';

await Kontext.loadConfig()
await Kontext.init()

let login = new LoginDialog('login')
login.create({})

document.addEventListener("loginKo", async (ev) => {
    alert("Login infos are wrong")
    location.reload();
})

document.addEventListener("loginCancelled", async (ev) => {
    location.reload();
})

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Vérifier le token et rafraîchir si nécessaire
        //verifierEtRafraichirToken();
        console.log("visibilty change listener decodedToken, ev.detail.decodedToken")
    }
});

let rightsTimer = null;
document.addEventListener("loginOk", async (ev) => {
    console.log("loginOk listener fired <ev>", ev)
    //await Kontext.init()
    document.getElementById("resultsHeader").innerHTML = ""
    document.getElementById("results").innerHTML = ""
    document.getElementById('Tags').style.visibility = "hidden"
    if (!Kontext.isAdmin) {
        //document.getElementById('Actors').style.visibility = "hidden"
        document.getElementById('Actors').setAttribute("aria-disabled", true)
        document.getElementById('Actors').setAttribute("tabindex", -1)
        //document.getElementById('Kanboard').style.visibility = "hidden"
        //document.getElementById('showEvents').style.visibility = "hidden"
        //document.getElementById('clearProject').style.visibility = "hidden"
        document.getElementById('Kanboard').disabled = true
        document.getElementById('showEvents').disabled = true
        document.getElementById('clearProject').disabled = true
        document.getElementById('isAdmin').innerHTML = `N`;
    } else {
        //document.getElementById('Actors').style.visibility = "visible"
        document.getElementById('Actors').setAttribute("aria-disabled", false)
        document.getElementById('Actors').setAttribute("tabindex", 0)
        //document.getElementById('Kanboard').style.visibility = "visible"
        //document.getElementById('showEvents').style.visibility = "visible"
        //document.getElementById('clearProject').style.visibility = "visible"
        document.getElementById('Kanboard').disabled = false
        document.getElementById('showEvents').disabled = false
        document.getElementById('clearProject').disabled = false
        document.getElementById('isAdmin').innerHTML = `Y`;
    }
    document.getElementById('user').innerHTML = `${Kontext.getUserName()}`;
    await buildWorkspacesSelectBox()
    await buildKanbearProjectsSelectBox()
    for (let item of ['project', 'swimlane', 'task']) {
        for (let status of ['Open', 'Closed']) {
            const id = `${item}${status}`
            console.log(`index.mjs() ${id} listener creation`)
            document.getElementById(id).addEventListener("change", async (ev) => {
                console.log(`index.mjs() ${id} listener fired <ev>`, ev)
                Kontext.loadKanbearJsonBulkData()
                Kontext.renderPanel()
            })
        }
    }

    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopRightsTimer()
        } else {
            Kontext.getUserRights()
            startRightsTimer()
        }
    });
    Kontext.getUserRights()
    startRightsTimer();
    

})

function startRightsTimer() {
    rightsTimer = setInterval(Kontext.getUserRights, 600_000);
}
function stopRightsTimer() {
    clearInterval(rightsTimer)
    rightsTimer = null;
}
//function refreshUserRights() {
//    console.log("refreshUserRights()")
//}


document.getElementById("projectOpen").addEventListener("change", async (ev) => {
    console.log(`index.mjs() projectOpen2 listener fired <ev>`, ev)
    buildKanbearProjectsSelectBox()
})

document.getElementById("projectClosed").addEventListener("change", async (ev) => {
    console.log(`index.mjs() projectClosed listener fired <ev>`, ev)
    buildKanbearProjectsSelectBox()
})

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
    wsEntity.setName(ws.name)
    let workspaceLink = buildWorkspaceLink(ws.id, ws.name)
    document.getElementById("workspace").replaceChildren(workspaceLink)
    buildWorkspacesSelectBox()
})

document.addEventListener("workspaceSelected", async (ev) => {
    console.log("workspaceSelected listener fired", "<ev>", ev)
    Kontext.setWorkspaceId(ev.detail.workspaceId)
    buildKanbearProjectsSelectBox()
})

//document.querySelectorAll("projectCreated").addEventListener("projectCreated", (ev) => {
document.addEventListener("projectCreated", async (ev) => {
    console.log("projectCreated listener fired <ev>", ev)
    // project was created and given rights
    await Kontext.getTokensManager().handleRefreshToken();
    await buildKanbearProjectsSelectBox()
    await Kontext.setProject(ev.detail.projectId);
    sendEvent("_projectReloaded", { projectId: ev.detail.projectId })
    new KanbanPanel().render()
})

document.addEventListener("cancelProjectBtn", async (ev) => {
    console.log("projectCreationCancelled listener fired <ev>", ev)
    document.getElementById('addProjectButton').replaceWith(buildAddProjectButton(Kontext.getWorkspaceId()))
})

document.addEventListener("cancelWorkspaceBtn", async (ev) => {
    console.log("workspaceCreationCancelled listener fired <ev>", ev)
    document.getElementById('addWorkspaceButton').replaceWith(buildAddWorkspaceButton())
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
    await Kontext.setProject(ev.detail.id);
    sendEvent("_projectReloaded", { projectId: ev.detail.id })
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
    const kb = await KanbanPanel.builder()
    kb.render()
})

document.addEventListener("projectDeleted", async (ev) => {
    console.log("projectDeleted listener fired <ev>", ev)
    if (ev.detail.deleted) {
        document.getElementById("project").replaceChildren(createElement('span', {
            textContent: ""
        }))
        buildKanbearProjectsSelectBox()
        sendMessage("Project deleted")
    } else {
        const kb = await KanbanPanel.builder()
        kb.render()
    }
})

document.addEventListener("swimlaneCreated", async (ev) => {
    console.log("index.mjs() swimlane listener Created fired <ev>", ev)
    const kb = await KanbanPanel.builder()
    kb.render()
})

document.addEventListener("swimlaneModified", async (ev) => {
    console.log("index.mjs() swimlane Modified listener fired <ev>", ev)
    const kb = await KanbanPanel.builder()
    kb.render()
})

document.addEventListener("swimlaneDeleted", async (ev) => {
    console.log("index.mjs() swimlane deleted listener fired <ev>", ev)
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

document.addEventListener("userCreated", async (ev) => {
    console.log("index.mjs() userCreated listener fired <ev>", ev)
    new KanbearUserPanel().render()
})

document.addEventListener("userDeleted", async (ev) => {
    console.log("index.mjs() userDeleted listener fired <ev>", ev)
    new KanbearUserPanel().render()
})

document.addEventListener("userModified", async (ev) => {
    new KanbearUserPanel().render()
})


document.addEventListener("assigneeModified", async (ev) => {
    new KanbearAssigneePanel().render()
})

document.addEventListener("columnCreated", async (ev) => {
    console.log("index.mjs() column created listener fired <ev>", ev)
    const kb = await KanbanPanel.builder()
    kb.render()
})

document.addEventListener("columnModified", async (ev) => {
    console.log("index.mjs() column  modified listener fired <ev>", ev)
    const kb = await KanbanPanel.builder()
    kb.render()
})

document.addEventListener("columnDeleted", async (ev) => {
    console.log("index.mjs() column deleted listener fired <ev>", ev)
    const kb = await KanbanPanel.builder()
    kb.render()
})

document.addEventListener("columnDragged", async (ev) => {
    console.log("index.mjs() columnDragged listener fired <ev>", ev)
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
document.addEventListener("taskDeleted", async (ev) => {
    console.log("index.mjs() task deleted listener fired <ev>", ev)
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
    //document.getElementById("message").innerHTML = "Error : " + ev.detail.error
    sendErrorMessage(ev.detail.errors)
})

document.getElementById('kanboard').href = Kontext.getKanboardUrl()

document.getElementById('loadProject').addEventListener('click', async () => {
    try {
        const response = await Kontext.loadKanbearJsonBulkData()
        document.getElementById('results').innerHTML = '<pre>' + JSON.stringify(Kontext.getJsonBulkData(), null, 2) + '</pre>';
        //document.getElementById('message').innerHTML = '<p>Loaded</p>';
    } catch (error) {
        //document.getElementById('message').innerHTML = `<p style="color: red;">Erreur: ${error.message}</p>`;
    }
})

//------------------- migrate from kanboard to kanbear --------------------------------------
function migrateFromKanboard() {
    new KanbearMigrator().migrate()
}

//------------------- migrate from kanboard to kanbear --------------------------------------
document.getElementById('migrateFromKanboard').addEventListener('click', () => {
    new KanbearMigrator().migrate()
});

//------------------- Assignee --------------------------------------
document.getElementById('assigneePanel').addEventListener('click', () => {
    new KanbearAssigneePanel().render()
});

//------------------- User --------------------------------------
document.getElementById('userPanel').addEventListener('click', () => {
    new KanbearUserPanel().render()
});

//------------------- Login --------------------------------------
document.getElementById('loginPanel').addEventListener('click', () => {
    let login = new LoginDialog('login')
    login.create({})
});


//------------------- list --------------------------------------
document.getElementById('listWorkspace').addEventListener('click', async () => {
    try {
        let kl = await KanbearListPanel.builder()
        kl.render()
    } catch (error) {
        alert(error)
    }
});

//------------------- kanban --------------------------------------
document.getElementById('kanban').addEventListener('click', () => {
    new KanbanPanel().render()
});


// Effacer les données
document.getElementById('clearProject').addEventListener('click', () => {
    new KanbearProjectCleanor().cleanup()
});



