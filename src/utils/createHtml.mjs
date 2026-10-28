import { buildOpenCloseButton } from "./buttonBuilder.mjs";
import { mustDisable, WRITE } from "./rights.mjs";
import { KanbearEntity } from "../classes/KanbearEntity.mjs";
import { sendEvent } from "./sendEvent.mjs";


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



export { createElement, getIdentityDiv, getDeleteEntityDiv }