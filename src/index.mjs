// Variable globale pour stocker le JSON
//import { renderTable } from './report.mjs'
//import { KanboardFilter } from './classes/KanboardFilter.mjs'
import { KanbanPanel } from './classes/KanbanPanel.mjs';
import { KanbearEntityFactory } from './classes/KanbearEntityFactory.mjs';
import { KanbearAssigneePanel } from './classes/KanbearAssigneePanel.mjs';
import { KanbearUserPanel } from './classes/KanbearUserPanel.mjs';
import { KanbearGroupPanel } from './classes/KanbearGroupPanel.mjs';
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
import { RightsModal } from './classes/RightsModal.mjs';
import { SelectBox } from './classes/components/SelectBox.mjs'
import { createElement, buildKanbearProjectsSelectBox, buildWorkspacesSelectBox } from './utils/createHtml.mjs';
import { sendMessage, sendErrorMessage } from './utils/sendMessage.mjs';
import { EventsHub } from './classes/EventsHub.mjs';

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
        document.getElementById('Actors').style.visibility = "hidden"
        //document.getElementById('Actors').setAttribute("aria-disabled", true)
        //document.getElementById('Actors').setAttribute("tabindex", -1)
        document.getElementById('Kanboard').style.visibility = "hidden"
        document.getElementById('showEvents').style.visibility = "hidden"
        document.getElementById('clearProject').style.visibility = "hidden"
        document.getElementById('Kanboard').disabled = true
        document.getElementById('showEvents').disabled = true
        document.getElementById('clearProject').disabled = true
        document.getElementById('isAdmin').innerHTML = `N`;
    } else {
        document.getElementById('Actors').style.visibility = "visible"
        //document.getElementById('Actors').setAttribute("aria-disabled", false)
        //document.getElementById('Actors').setAttribute("tabindex", 0)
        document.getElementById('Kanboard').style.visibility = "visible"
        document.getElementById('showEvents').style.visibility = "visible"
        document.getElementById('clearProject').style.visibility = "visible"
        document.getElementById('Kanboard').disabled = false
        document.getElementById('showEvents').disabled = false
        document.getElementById('clearProject').disabled = false
        document.getElementById('isAdmin').innerHTML = `Y`;
    }
    document.getElementById('user').innerHTML = `${Kontext.getUserName()}`;
    await buildWorkspacesSelectBox()
    // try for test with webComponent !! buildWorkspacesSelectBoxComponent()

    Kontext.eventsHub.on('index.mjs', [
        'workspaceOpen', 'worskpaceClosed',
        'projectOpen', 'projectClosed',
        'swimlaneOpen', 'swimlaneClosed',
        'taskOpen', 'taskClosed'],
        async (e) => {
            await Kontext.loadKanbearJsonBulkData()
            await Kontext.renderPanel()
        })

    Kontext.eventsHub.on('index.mjs', [
        'workspaceOpen', 'worskpaceClosed',
    ],
        async (e) => {
            console.log("workspace opened/closed")
        })

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopRightsTimer()
        } else {
            Kontext.fetchUserRights()
            startRightsTimer()
        }
    });
    Kontext.fetchUserRights()
    startRightsTimer();
})

function startRightsTimer() {
    rightsTimer = setInterval(Kontext.getUserRights, 600_000);
}
function stopRightsTimer() {
    clearInterval(rightsTimer)
    rightsTimer = null;
}

Kontext.eventsHub.on('index.mjs', ['workspaceCreated', 'rightsModified', 'rightsDeleted'],
    async (e) => {
        await buildWorkspacesSelectBox()
        //await buildKanbearProjectsSelectBox()
    })
Kontext.eventsHub.on("index.mjs", ["assigneeCreated", "assigneeModified", "assigneeDeleted"],
    async (e) => { new KanbearAssigneePanel().render() })
Kontext.eventsHub.on("index.mjs", ["userCreated", "userDeleted", "userModified"],
    async (e) => { new KanbearUserPanel().render() })
Kontext.eventsHub.on("index.mjs", ["groupCreated", "groupModified", "groupDeleted"],
    async (e) => { new KanbearGroupPanel().render() })
Kontext.eventsHub.on("index.mjs", [
    "taskCreated", "taskModified", "taskDeleted",
    "dialogCanceled",
    "swimlaneCreated", "swimlaneModified", "swimlaneDeleted", "swimlaneDragged",
    "columnCreated", "columnModified", "columnDeleted", "columnDragged",
],
    async (e) => {
        const kb = await KanbanPanel.builder()
        kb.render()
    })
Kontext.eventsHub.on('index.mjs', ['workspaceModified'],
    async (ev) => {
        const wsEntity = await KanbearEntityFactory.generate('workspace')
        wsEntity.setId(ev.workspaceId)
        let ws = await wsEntity.get()
        wsEntity.setName(ws.name)
        let workspaceLink = buildWorkspaceLink(ws.id, ws.name)
        document.getElementById("workspace").replaceChildren(workspaceLink)
        await buildWorkspacesSelectBox()
    })
Kontext.eventsHub.on('index.mjs', ['workspaceSelected'],
    async (ev) => {
        Kontext.setWorkspaceId(ev.workspaceId)
        await buildKanbearProjectsSelectBox()
    })
Kontext.eventsHub.on('index.mjs', ['projectCreated'],
    async (ev) => {
        // project was created and given rights
        await Kontext.getTokensManager().handleRefreshToken();
        await buildKanbearProjectsSelectBox()
        await Kontext.setProject(ev.projectId);
        sendEvent("_projectReloaded", { projectId: ev.projectId })
        new KanbanPanel().render()
    })
Kontext.eventsHub.on('index.mjs', ['cancelProjectBtn'],
    async (ev) => { document.getElementById('addProjectButton').replaceWith(buildAddProjectButton(Kontext.getWorkspaceId())) })
Kontext.eventsHub.on('index.mjs', ['cancelWorkspaceBtn'],
    async (ev) => { document.getElementById('addWorkspaceButton').replaceWith(buildAddWorkspaceButton()) })
Kontext.eventsHub.on('index.mjs', ['projectSelected'],
    async (ev) => {
        await Kontext.setProject(ev.projectId);
        sendEvent("_projectReloaded", { projectId: ev.projectId })
        const kb = await KanbanPanel.builder()
        kb.render()
    })
Kontext.eventsHub.on('index.mjs', ['projectModified'],
    async (ev) => {
        console.log("Hub ", ev)
        const projectId = ev?.entity?.id ?? ev?.projectId;
        await Kontext.setProject(projectId);
        sendEvent("_projectReloaded", { projectId: projectId })
        const kb = await KanbanPanel.builder()
        kb.render()
    })
// Event _projectReloaded : "subevent" to update various things
Kontext.eventsHub.on('index.mjs', ['_projectReloaded'],
    async (ev) => {
        console.log("index.mjs() _projectReloaded listener fired <ev>", ev)
        await buildKanbearProjectsSelectBox()
        let projectLink = buildProjectLink(Kontext.getCurrentProjectId(), Kontext.getCurrentProjectName())
        document.getElementById("project").replaceChildren(projectLink)
        const kb = await KanbanPanel.builder()
        kb.render()
    })
Kontext.eventsHub.on('index.mjs', ['projectDeleted'],
    async (ev) => {
        if (ev.deleted) {
            document.getElementById("project").replaceChildren(createElement('span', {
                textContent: ""
            }))
            await buildKanbearProjectsSelectBox()
            sendMessage("Project deleted")
        } else {
            const kb = await KanbanPanel.builder()
            kb.render()
        }
    })

Kontext.eventsHub.on('index.mjs', ['error'],
    async (ev) => { sendErrorMessage(ev.errors) })


Kontext.eventsHub.on('index.mjs.projectClosedWatcher', ['change'],
    async (detail, ev) => { await buildKanbearProjectsSelectBox(); },
    { elementId: 'projectClosed' });

Kontext.eventsHub.on('index.mjs.loadProject', ['change'],
    async (detail, ev) => {
        await Kontext.loadKanbearJsonBulkData()
        document.getElementById('results').innerHTML = '<pre>' + JSON.stringify(Kontext.getJsonBulkData(), null, 2) + '</pre>';
    },
    { elementId: 'loadProject' });


document.getElementById('kanboard').href = Kontext.getKanboardUrl()

Kontext.eventsHub.on('index.mjs projectsOpenedCheckbox', ['change'],
    async (detail, ev) => {
        await buildKanbearProjectsSelectBox()
    },
    { elementId: 'projectsOpenedCheckbox' });

Kontext.eventsHub.on('index.mjs projectsClosedCheckbox', ['change'],
    async (detail, ev) => {
        await buildKanbearProjectsSelectBox()
    },
    { elementId: 'projectsClosedCheckbox' });
Kontext.eventsHub.on('index.mjs workspaceOpenedCheckbox', ['change'],
    async (detail, ev) => {
        await buildWorkspacesSelectBox()
    },
    { elementId: 'workspacesOpenedCheckbox' });

Kontext.eventsHub.on('index.mjs workspacesClosedCheckbox', ['change'],
    async (detail, ev) => {
        await buildWorkspacesSelectBox()
    },
    { elementId: 'workspacesClosedCheckbox' });


//------------------- migrate from kanboard to kanbear --------------------------------------
function migrateFromKanboard() {
    new KanbearMigrator().migrate()
}

document.getElementById('migrateFromKanboard').addEventListener('click', () => {
    new KanbearMigrator().migrate()
});

document.getElementById('assigneePanel').addEventListener('click', () => {
    new KanbearAssigneePanel().render()
});

document.getElementById('userPanel').addEventListener('click', () => {
    new KanbearUserPanel().render()
});

document.getElementById('groupPanel').addEventListener('click', () => {
    new KanbearGroupPanel().render()
});

document.getElementById('rightPanel').addEventListener('click', () => {
    new RightsModal().render()
});

document.getElementById('loginPanel').addEventListener('click', () => {
    let login = new LoginDialog('login')
    login.create({})
});

document.getElementById('refreshRightsPanel').addEventListener('click', () => {
    Kontext.fetchUserRights()
});

document.getElementById('listWorkspace').addEventListener('click', async () => {
    try {
        let kl = await KanbearListPanel.builder()
        kl.render()
    } catch (error) {
        alert(error)
    }
});

document.getElementById('kanban').addEventListener('click', () => {
    new KanbanPanel().render()
});


// Effacer les données
document.getElementById('clearProject').addEventListener('click', () => {
    new KanbearProjectCleanor().cleanup()
});

// for test with Web component !
function buildWorkspacesSelectBoxComponent() {
    const box = document.createElement('select-box');
    box.className = 'filter-group';
    box.setAttribute('label', 'Mon filtre');
    box.setAttribute('name', 'mon-filtre');
    box.setAttribute('select-id', 'dom-id-1');
    box.setAttribute('selected', 'Livres');

    // Ajout d'un bouton enfant si nécessaire
    const btn = document.createElement('button');
    btn.textContent = 'Reset';
    box.appendChild(btn);

    // Injection des données
    /*box.items = [
        { id: 1, name: 'Électronique' },
        { id: 2, name: 'Livres' }
    ];
    */
    Workspace.getAll('workspaces')
        .then((ws) => box.items = ws)
        .finally(() => console.log('workspaces loaded'))

    document.body.appendChild(box);
}


