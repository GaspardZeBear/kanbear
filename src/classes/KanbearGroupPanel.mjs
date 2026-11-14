import { KanboardFilter } from "./KanboardFilter.mjs"
import { formatDuration, dateToString, getDurationFromNow } from "../utils/dateAndTime.mjs";
import { Kontext } from "./Kontext.mjs";
import { Group } from "./Group.mjs"
import { GroupDialog } from "./GroupDialog.mjs"
import { buildGroupLink, buildGroupRightsLink } from "../utils/linkBuilder.mjs";
import { sendEvent } from "../utils/sendEvent.mjs";
import { getFiltersMap } from "../utils/filters.mjs";
import { SmartTable } from "./SmartTable.mjs";


class KanbearGroupPanel {
  constructor() {
    //this.projects = Kontext.getJsonBulkData()
    this.htmlElement = 'results'
    this.kanboardFilter = new KanboardFilter(getFiltersMap())
    this.buttons = {}
    this.table = undefined
  }

  //-----------------------------------------------------------------
  async render() {
    if ( !await Kontext.isUserAdmin()) {
      alert("You must be admin to see groups")
      return
    }
    console.log("KanbearGroupPanel render()")
    const result = document.getElementById(this.htmlElement);
    //document.getElementById(this.htmlElement).innerHTML = `<h2>${this.project.name} filtered by ...</h2>`

    let resultTitleGroup = document.createElement('h3')
    let addGroupButton = this.buildAddGroupButton()
    //let resultTitleGroup = document.createElement('h3')
    resultTitleGroup.appendChild(addGroupButton)
    let delGroupButton = this.buildDelGroupButton()
    resultTitleGroup.appendChild(delGroupButton)

    let titleGroup = document.createElement('span')
    titleGroup.innerHTML = `Groups list filtered by .....`
    resultTitleGroup.appendChild(titleGroup)

    let resultTitle = document.createElement("div")
    //resultTitle.appendChild(resultTitleWorkspace)
    resultTitle.appendChild(resultTitleGroup)

    const elementHeader = `${this.htmlElement}Header`
    document.getElementById(this.htmlElement).replaceChildren()
    document.getElementById(elementHeader).replaceChildren(resultTitle)
    await this.createTable()
    //console.log(this.table)
    result.appendChild(this.table)
    let table=new SmartTable(this.table)
  }


  //------------------------------------------------------------------------
  buildDelGroupButton() {
    //let projectId = this.project.id
    const delGroupButton = document.createElement('button')
    delGroupButton.classList.add("add-item-btn")
    delGroupButton.setAttribute("id", "delGroupButton")
    delGroupButton.innerHTML = "D"
    const myThis = this
    let delGroupFn = async function (ev) {
      console.log("delGroupButton event Listener fired")
      ev.stopPropagation();
      const toDelete = Array.from(document.querySelectorAll('input.groupCheckbox')).filter(input => input.checked);

      // Never use await in forEach!!!!! 
      for (let toDel of toDelete) {
        console.log("KanbearGroupPanel <toDel>", toDel.getAttribute("groupid"))
        const group = new Group()
        group.setId(toDel.getAttribute("groupid"))
        await group.delete()
      }
      sendEvent('groupDeleted', { "ids" : [] })
      console.log("KanbearGroupPanel <groupDeletedEvent>",toDelete)
    }
      delGroupButton.addEventListener('click', delGroupFn, { once: true });
      return (delGroupButton)
    }

    //------------------------------------------------------------------------
    buildAddGroupButton() {
      //let projectId = this.project.id
      const addGroupButton = document.createElement('button')
      addGroupButton.classList.add("add-item-btn")
      addGroupButton.setAttribute("id", "addGroupButton")
      addGroupButton.innerHTML = "+A"
      let addGroupFn = function (ev) {
        console.log("addGroupButton event Listener fired")
        ev.stopPropagation();
        const group = new GroupDialog('group')
        group.create({});
      }
      //removeEventListener("click", addSwimlaneFn)
      addGroupButton.addEventListener('click', addGroupFn, { once: true });
      return (addGroupButton)
    }

  //-----------------------------------------------------------------
  async createTable() {
      const groups = await Group.getAll('groups')
      console.log("KanbearGroupPanel.createTable()","<groups>",groups)
      this.table = document.createElement('table')
      this.table.id="GroupsTable"
      const thead = document.createElement('thead')
      const hrow = document.createElement('tr')
      hrow.innerHTML = `
        <th>Sel</th>
        <th>Id</th>
        <th>Name</th>
        <th>Description</th>
        `
      thead.appendChild(hrow)
      this.table.appendChild(thead)
      const tbody = document.createElement('tbody')

      Object.entries(groups).forEach((groupEntity) => {
        const group = groupEntity[1]
        //console.log("KanbearGroupPanel.createTable() <group>", group)
        const row = document.createElement('tr');

        const td = (p) => {
          const td = document.createElement('td')
          td.innerHTML = p
          return (td)
        }
        const tdHref = (href) => {
          const td = document.createElement('td')
          td.appendChild(href)
          return (td)
        }
        const id = "groupSel"
        row.appendChild(td('<input class="groupCheckbox" groupId=' + group.id + ' type="checkbox"/>'))
        row.appendChild(td(group.id))
        row.appendChild(tdHref(buildGroupLink(group.id, group.name)))
        //row.appendChild(td(group.name))
        row.appendChild(td(group.description))
        tbody.appendChild(row);
      }
      );
      this.table.appendChild(tbody)
      //this.table=new SmartTable(this.table)
      
    }

  }
export { KanbearGroupPanel }
