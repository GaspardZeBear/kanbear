import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { formatDuration, dateToString, getDurationFromNow } from "../utils/dateAndTime.mjs";
import { createElement } from '../utils/createHtml.mjs';

class N2nModal {


  //------------------------------------------------------------------------
  constructor(params) {
    console.log("N2nModal ", params)
    this.type = params.type
    this.id = params.id
    this.name = params.name
    this.left = params.left
    this.right = params.rights
    this.dialog = document.getElementById(`n2nModal`)
    //document.getElementById(`taskCommentsDialogTitle`).innerHTML="www"
    this.dialog.showModal();
    this.htmlElement = `n2nModalResults`
    this.createListeners(this)
    this.render()
  }

  //-----------------------------------------------------------------
  async render() {
    console.log("N2nModal ")
    const result = document.getElementById(this.htmlElement);
    const leftBox = document.getElementById('n2nLeftBox');
    const rightBox = document.getElementById('n2nRightBox');
    const toRightBtn = document.getElementById('n2nToRight');
    const toLeftBtn = document.getElementById('n2nToLeft');

    let leftElements = []
    for (let l of this.left) {
      console.log("N2nModal l", l.name)
      leftElements.push(createElement("div", {
        classes: ["n2n-item"],
        textContent: l.name
      }))
    }

    leftBox.replaceChildren(createElement('div', {
      children: leftElements
    }))
    // Gestion de la sélection au clic
    document.addEventListener('click', function (e) {
      console.log("N2nModal leftBoxElement clicked")
      if (e.target.classList.contains('n2n-item')) {
        e.target.classList.toggle('selected');
      }
    });

    // Déplacer de gauche à droite
    toRightBtn.addEventListener('click', () => {
      const selectedItems = leftBox.querySelectorAll('.n2n-item.selected');
      console.log("N2nModal toRight clicked",selectedItems)
      selectedItems.forEach(item => {
        item.classList.remove('selected');
        rightBox.appendChild(item);
      });
    });

    // Déplacer de droite à gauche
    toLeftBtn.addEventListener('click', () => {
      const selectedItems = rightBox.querySelectorAll('.n2n-item.selected');
      selectedItems.forEach(item => {
        item.classList.remove('selected');
        leftBox.appendChild(item);
      });
    });


  }

  //---------------------------------------------------------------------
  async createListeners(thisClass) {
    document.addEventListener("tasksCommentsCreated", async (ev) => {
      console.log("index.mjs() tasksCommentsCreated listener fired <ev>", ev)
      thisClass.render()
    })
    document.addEventListener("tasksCommentsDeleted", async (ev) => {
      console.log("index.mjs() tasksCommentsDeleted listener fired <ev>", ev)
      thisClass.render()
    })
  }

  //------------------------------------------------------------------------
  buildExitN2nButton() {
    //let projectId = this.project.id
    const exitTasksCommentsButton = document.createElement('button')
    exitTN2nButton.classList.add("add-item-btn")
    exitN2nButton.setAttribute("id", "exitN2nButton")
    exitN2nButton.innerHTML = "Exit"
    const myThis = this
    let exitN2nFn = async function (ev) {
      console.log("exitN2nButton event Listener fired")
      ev.stopPropagation();
      document.getElementById(`N2nModal`).close()
    }
    //let dialog = document.getElementById(`tasksCommentsModal`)
    exitN2nButton.addEventListener('click', exitN2nFn, { once: false });
    return (exitN2nButton)
  }




}

export { N2nModal }
