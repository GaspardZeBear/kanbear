import { buildOpenCloseButton, buildAddDummyButton, buildAddProjectButton, buildAddWorkspaceButton } from "./buttonBuilder.mjs";
import { mustDisable, WRITE } from "./rights.mjs";
import { KanbearEntity } from "../classes/KanbearEntity.mjs";
import { sendEvent } from "./sendEvent.mjs";
import { Kontext } from "../classes/Kontext.mjs";
import { Project } from "../classes/Project.mjs";
import { Workspace } from "../classes/Workspace.mjs";
import { selectBoxBuilder } from "./selectBoxBuilder.mjs";
import { getOpenCloseParmBoolean } from "./openClose.mjs";
import { buildWorkspaceLink, buildProjectLink } from './linkBuilder.mjs';


//-----------------------------------------------------------------------------------------------
function createElement(tag, options = {}) {
  // On extrait les clés connues, le reste (rest) contiendra nos onEvent, classes, attributes...
  const { classes = [], textContent = '', innerHTML = '', children = [], ...rest } = options;
  const element = document.createElement(tag);

  if (Array.isArray(classes) && classes.length > 0) {
    element.classList.add(...classes.filter(Boolean));
  } else if (typeof classes === 'string' && classes.trim() !== '') {
    element.className = classes;
  }

  // 2. Séparation et traitement des Attributs et des Événements "onEvent"
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined || value === null) continue;
    // Si la clé commence par "on" (ex: onclick, oninput, onmouseover)
    if (key.startsWith('on') && key.length > 2) {
      const eventType = key.slice(2).toLowerCase(); // Extraire "click" de "onclick"
      console.log("createElement() key", key, "value", value)
      if (typeof value === 'function') {
        // Syntaxe ultra-simple : onclick: (e) => {}
        console.log("createElement() add listener", element)
        element.addEventListener(eventType, value);
      } else if (Array.isArray(value) && typeof value[0] === 'function') {
        // Syntaxe avec options : onclick: [(e) => {}, { once: true }]
        const [handler, eventOptions] = value;
        element.addEventListener(eventType, handler, eventOptions);
      }
    } else {
      // Sinon, c'est un attribut classique (id, type, src, etc.)
      element.setAttribute(key, value);
    }
  }

  if (textContent) {
    element.textContent = textContent;
  }
  if (innerHTML) {
    element.textContent = innerHTML;
  }
  if (Array.isArray(children)) {
    children.forEach(child => {
      if (child instanceof Node) {
        element.appendChild(child);
      }
    });
  }

  return element;
}


//----------------------------------------------------------------------------------
function getIdentityDiv(entity, dialog) {
  let editFn = function (ev) {
    console.log("editFn event Listener fired <myEntity>", entity.kind, entity.id)
    ev.stopPropagation();
    dialog.modify({ [`${entity.getKind()}Id`]: entity.id })
  }

  return (createElement('div', {
    classes : ["kanban-identity"],
    children: [
      createElement("a", {
        id: `${entity.kind}_href_${entity.id}`,
        href: "javascript:void(0)",
        innerHTML: `${entity.getKind()} #${entity.id}`,
        onclick: [editFn, { once: true }]
      }),
      buildOpenCloseButton(entity, mustDisable(WRITE), (doIt) => {
        if (doIt) {
          entity.patch({ is_open: entity.getOpen() })
          .then( () => {})
          .catch(() => { })
          .finally( () => sendEvent(`${entity.getKind()}Modified`, entity))
        }
        // Event will be sent twice, to be fixed  !!!!
        // Must be sent even if cancel to reset once on the listener
        sendEvent(`${entity.getKind()}Modified`, entity)
      }),
      createElement('br'),
      createElement('b', {
        children: [createElement("span", { textContent: entity.getName() })]
      })
    ]
  })
  )
}

//---------------------------------------------------------------------------------------------------
function getDeleteEntityDiv(entity,buttonDiv) {
        const deleteDiv = document.createElement("div")
        return (deleteDiv.appendChild(buttonDiv))
}


//---------------------------------------------------------------------------------
async function buildKanbearProjectsSelectBox() {
    let workspaceId = Kontext.getWorkspaceId()
    let projects = []
    console.log("buildKanbearProjectsSelectBox() <workspaceId>", workspaceId)
    if (workspaceId) {
        const isOpen = document.getElementById("projectOpen").checked;
        const isClosed = document.getElementById("projectClosed").checked;
        const openClosed = getOpenCloseParmBoolean('project', isOpen, isClosed)
        const parms = { workspace_id: workspaceId }
        if (!(openClosed === undefined)) {
            parms["is_open"] = openClosed
        }
        projects = await Project.getAll('projects', parms)
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
    let checkboxes = []

    let boxParams = {
        domId: boxName,
        boxLabel: "Project",
        buttons: buttons,
        checkboxes: checkboxes,
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

    /*
    let wss0
    let wss = []

    
    let retries = 10
    while (!Array.isArray(wss0)) {
        try {
            wss0 = await Workspace.getAll('workspaces')
            console.log("buildWorkspacesSelectBox() ", "retries", retries, "wss0", wss0)
            retries--
            if (retries == 0) {
                // throw("Workspaces list not avalailable")
                wss0 = []
            }
        } catch (err) {
            console.log("buildWorkspacesSelectBox() error", err.cause)
            document.getElementById("message").innerHTML = "Cannot get workspace list (is back launched ?)"
            setTimeout(function () {
                location.reload();
            }, 30000);
        }
    }
        */

    let wss0 = []
    try {
        wss0 = await Workspace.getAll('workspaces')
    } catch (err) {

    }
    let wss = wss0

    //document.getElementById("message").innerHTML = "Ready"

    if (wss.length == 0) {
        document.getElementById("message").innerHTML = "No workspace found"
        alert("Could not initialize workspaces, are you logged in with a right user  ?")
    } else {
        document.getElementById("message").innerHTML = "Ready"
    }
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

        let workspaceId = parseInt(e.target.value)
        if (workspaceId < 0) {
            sendEvent("workspaceSelected", workspaceId)
            return
        }
        Kontext.setWorkspaceId(e.target.value);
        //console.log("wss",e.wss)
        let box = document.getElementById("kanbearWorkspaceSelectBox")

        //let addedElementsCount=box.length-wssOrigin.length
        console.log("wssOrigin in listener", wssOrigin)
        const ws = wssOrigin.find((element) => element.id == workspaceId)
        console.log("ws", ws)
        Kontext.setWorkspaceName(ws.name);
        document.getElementById("workspace").innerHTML = `${ws.id} ${ws.name}`
        let workspaceLink = buildWorkspaceLink(ws.id, ws.name)
        document.getElementById("workspace").replaceChildren(workspaceLink)
        buildKanbearProjectsSelectBox()
        console.log({ boxName }, e.target.value)
    });
}

export { createElement, getIdentityDiv, getDeleteEntityDiv, buildKanbearProjectsSelectBox, buildWorkspacesSelectBox }