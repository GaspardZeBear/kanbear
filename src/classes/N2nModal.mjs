import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { formatDuration, dateToString, getDurationFromNow } from "../utils/dateAndTime.mjs";
import { createElement } from '../utils/createHtml.mjs';

class N2nModal {


  //------------------------------------------------------------------------
  // - left is all that apppears in left box : ex : users
  // id is id of user
  //- right is all that exists in table : ex : users_groups
  // rightKey is the key to get id of user

  constructor(params) {
    console.log("N2nModal ", params)
    this.type = params.type
    this.id = params.id
    this.name = params.name
    this.leftCallback = params.leftCallback
    this.rightCallback = params.rightCallback
    this.rightKey = params.rightKey
    this.onSave = params.onSave
    this.dialog = document.getElementById(`n2nModal`)
    //document.getElementById(`taskCommentsDialogTitle`).innerHTML="www"
    this.dialog.showModal();
    this.htmlElement = `n2nModalResults`
    this.hasResetListener = false
    this.createResetListener()
    this.createListeners()
    //this.render()
  }

  //-----------------------------------------------------------------
  async render() {
    this.left = await this.leftCallback()
    this.fullMap = new Map(this.left.map(u => [u.id, u]));
    this.right = await this.rightCallback()
    console.log("N2nModal ", this.left, this.right)
    const result = document.getElementById(this.htmlElement);
    let buttons = createElement("div", {
      children: [this.buildExitN2nButton(), this.buildSaveN2nButton()]
    }
    )
    document.getElementById("N2n-buttons").replaceChildren(buttons)
    const leftBox = document.getElementById('n2nLeftBox');
    const rightBox = document.getElementById('n2nRightBox');


    this.rightHash = {}
    let rightElements = []
    for (let l of this.right) {
      console.log("N2nModal l", this.fullMap.get(l[this.rightKey]).name)
      let fullRef = `n2n-element:${l[this.rightKey]}:${l.id}`
      this.rightHash[l[this.rightKey]] = true
      rightElements.push(createElement("div", {
        classes: ["n2n-item", "inRightBox", "rightBoxInitial"],
        id: fullRef,
        textContent: this.fullMap.get(l[this.rightKey]).name
      }))
    }
    rightBox.replaceChildren(createElement('div', {
      children: rightElements
    }))

    /*
    this.leftHash = {}
    let leftElements = []
    for (let l of this.left) {
      console.log("N2nModal l", l.name)
      this.leftHash[l.id] = true
      if (!this.rightHash[l.id]) {
        leftElements.push(createElement("div", {
          classes: ["n2n-item","inLeftBox"],
          id: `n2n-element:${l.id}`,
          textContent: l.name
        }))
      }
    }
    leftBox.replaceChildren(createElement('div', {
      children: leftElements
    }))*/

    //this.leftHash = {}
    let leftElements = []
    for (let l of this.left) {
      console.log("N2nModal l", l.name)
      //this.leftHash[l.id] = true
      const id = `n2n-element:${l.id}`
      if (!this.rightHash[l.id]) {
        leftElements.push(createElement("div", {
          classes: ["n2n-item", "inLeftBox"],
          id: id,
          textContent: l.name
        }))
      }
    }
    leftBox.replaceChildren(createElement('div', {
      children: leftElements
    }))
  }

  //---------------------------------------------------------------------
  createResetListener() {
    let myThis = this
    if (!this.hasResetListener) {
      document.addEventListener('resetListeners', function (e) {
        console.log("N2nModal resetListeners fired ", e)
        e.detail.controller.abort()
        myThis.createListeners()
      })
      this.hasResetListener=true
    }
  }

  //---------------------------------------------------------------------
  createListeners() {
    const leftBox = document.getElementById('n2nLeftBox');
    const rightBox = document.getElementById('n2nRightBox');
    const toRightBtn = document.getElementById('n2nToRight');
    const toLeftBtn = document.getElementById('n2nToLeft');
    const controller = new AbortController();
    const { signal } = controller;
    // Gestion de la sélection au clic
    document.addEventListener('click', function (e) {
      console.log("N2nModal leftBoxElement clicked")
      if (e.target.classList.contains('n2n-item')) {
        e.target.classList.toggle('selected');
      }
      sendEvent("resetListeners", { controller: controller })
    },
      { signal }
    );

    // Déplacer de gauche à droite
    toRightBtn.addEventListener('click', () => {
      const selectedItems = leftBox.querySelectorAll('.n2n-item.selected');
      console.log("N2nModal toRight clicked", selectedItems)
      selectedItems.forEach(item => {
        item.classList.remove('selected');
        item.classList.remove('inLeftBox')
        item.classList.add('inRightBox')
        rightBox.appendChild(item);
        console.log("N2nModal rightBox", rightBox)
      })
    },
      { signal });

    // Déplacer de droite à gauche
    toLeftBtn.addEventListener('click', () => {
      const selectedItems = rightBox.querySelectorAll('.n2n-item.selected');
      selectedItems.forEach(item => {
        item.classList.remove('selected');
        item.classList.remove('inRightBox')
        item.classList.add('inLeftBox')
        leftBox.appendChild(item)
      })
    },
      { signal });

  }

  //------------------------------------------------------------------------
  buildExitN2nButton() {
    //let projectId = this.project.id
    const exitN2nButton = document.createElement('button')
    exitN2nButton.classList.add("add-item-btn")
    exitN2nButton.setAttribute("id", "exitN2nButton")
    exitN2nButton.innerHTML = "Exit"
    const myThis = this
    let exitN2nFn = async function (ev) {
      console.log("exitN2nButton event Listener fired")
      ev.stopPropagation();
      document.getElementById(`n2nModal`).close()
    }
    //let dialog = document.getElementById(`tasksCommentsModal`)
    exitN2nButton.addEventListener('click', exitN2nFn, { once: false });
    return (exitN2nButton)
  }

  //------------------------------------------------------------------------
  async saveN2n() {
    //alert("saveN2n Saving")
    let ids = { mustAdd: [], mustDelete: [] }
    document.querySelectorAll('.inRightBox').forEach(element => {
      if (!element.classList.contains("rightBoxInitial")) {
        let ref = element.id.split(':')[1]
        ids.mustAdd.push(parseInt(ref))
      }
    })
    document.querySelectorAll('.rightBoxInitial').forEach(element => {
      if (!element.classList.contains("inRightBox")) {
        let ref = element.id.split(':')[2]
        ids.mustDelete.push(parseInt(ref))
      }
    })
    console.log("saveN2n() inRightBox", ids)
    await this.onSave(ids)
    this.render()
  }

  //------------------------------------------------------------------------
  buildSaveN2nButton() {
    const saveN2nButton = document.createElement('button')
    saveN2nButton.classList.add("add-item-btn")
    saveN2nButton.setAttribute("id", "saveRightsButton")
    saveN2nButton.innerHTML = "Save"
    const myThis = this
    let saveN2nFn = async function (ev) {
      console.log("saveN2nButton event Listener fired")
      ev.stopPropagation();
      myThis.saveN2n()
      myThis.render()
      //document.getElementById(`rightsModal`).close()
    }
    //let dialog = document.getElementById(`projectsRightsModal`)
    saveN2nButton.addEventListener('click', saveN2nFn, { once: true });
    return (saveN2nButton)
  }




}

export { N2nModal }
