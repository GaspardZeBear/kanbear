import { KanboardFilter } from "./KanboardFilter.mjs"
import { formatDuration, dateToString, getDurationFromNow } from "../utils/dateAndTime.mjs";
import { Kontext } from "./Kontext.mjs";
import { User } from "./User.mjs"
import { UserDialog } from "./UserDialog.mjs"
import { buildUserLink, buildUserRightsLink } from "../utils/linkBuilder.mjs";
import { sendEvent } from "../utils/sendEvent.mjs";
import { getFiltersMap } from "../utils/filters.mjs";


class KanbearUserPanel {
  constructor() {
    this.projects = Kontext.getJsonBulkData()
    this.htmlElement = 'results'
    this.kanboardFilter = new KanboardFilter(getFiltersMap())
    this.buttons = {}
    this.table = undefined
  }

  //-----------------------------------------------------------------
  async render() {
    if ( !await Kontext.isUserAdmin()) {
      alert("You must be admin to see users")
      return
    }
    console.log("KanbearUserPanel render()")
    const result = document.getElementById(this.htmlElement);
    //document.getElementById(this.htmlElement).innerHTML = `<h2>${this.project.name} filtered by ...</h2>`

    let resultTitleUser = document.createElement('h3')
    let addUserButton = this.buildAddUserButton()
    //let resultTitleUser = document.createElement('h3')
    resultTitleUser.appendChild(addUserButton)
    let delUserButton = this.buildDelUserButton()
    resultTitleUser.appendChild(delUserButton)

    let titleUser = document.createElement('span')
    titleUser.innerHTML = `Users list filtered by .....`
    resultTitleUser.appendChild(titleUser)

    let resultTitle = document.createElement("div")
    //resultTitle.appendChild(resultTitleWorkspace)
    resultTitle.appendChild(resultTitleUser)

    const elementHeader = `${this.htmlElement}Header`
    document.getElementById(this.htmlElement).replaceChildren()
    document.getElementById(elementHeader).replaceChildren(resultTitle)
    await this.createTable()
    result.appendChild(this.table)
  }


  //------------------------------------------------------------------------
  buildDelUserButton() {
    //let projectId = this.project.id
    const delUserButton = document.createElement('button')
    delUserButton.classList.add("add-item-btn")
    delUserButton.setAttribute("id", "delUserButton")
    delUserButton.innerHTML = "D"
    const myThis = this
    let delUserFn = async function (ev) {
      console.log("delUserButton event Listener fired")
      ev.stopPropagation();
      const toDelete = Array.from(document.querySelectorAll('input.userCheckbox')).filter(input => input.checked);

      // Never use await in forEach!!!!! 
      for (let toDel of toDelete) {
        console.log("KanbearUserPanel <toDel>", toDel.getAttribute("userid"))
        const user = new User()
        user.setId(toDel.getAttribute("userid"))
        await user.delete()
      }
      sendEvent('userDeleted', { "ids" : [] })
      console.log("KanbearUserPanel <userDeletedEvent>",toDelete)
    }
      delUserButton.addEventListener('click', delUserFn, { once: true });
      return (delUserButton)
    }

    //------------------------------------------------------------------------
    buildAddUserButton() {
      //let projectId = this.project.id
      const addUserButton = document.createElement('button')
      addUserButton.classList.add("add-item-btn")
      addUserButton.setAttribute("id", "addUserButton")
      addUserButton.innerHTML = "+A"
      let addUserFn = function (ev) {
        console.log("addUserButton event Listener fired")
        ev.stopPropagation();
        const user = new UserDialog('user')
        user.create({});
      }
      //removeEventListener("click", addSwimlaneFn)
      addUserButton.addEventListener('click', addUserFn, { once: true });
      return (addUserButton)
    }

  //-----------------------------------------------------------------
  async createTable() {
      const users = await User.getAll('users')
      console.log("KanbearUserPanel.createTable()","<users>",users)
      this.table = document.createElement('table')
      const thead = document.createElement('thead')
      const hrow = document.createElement('tr')
      hrow.innerHTML = `
        <th>Sel</th>
        <th>Name</th>
        <th>Password</th>
        <th>Description</th>
        <th>Tel</th>
        <th>Email</th>
        <th>Rights</th>
        <th>isAdmin</th>
        <th>Delete</th>
        `
      thead.appendChild(hrow)
      this.table.appendChild(thead)
      const tbody = document.createElement('tbody')

      Object.entries(users).forEach((userEntity) => {
        const user = userEntity[1]
        //console.log("KanbearUserPanel.createTable() <user>", user)
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
        const id = "userSel"
        row.appendChild(td('<input class="userCheckbox" userId=' + user.id + ' type="checkbox"/>'))
        row.appendChild(tdHref(buildUserLink(user.id, user.name)))
        row.appendChild(td("**** ..."))
        row.appendChild(td(user.description))
        row.appendChild(td(user.tel))
        row.appendChild(td(user.email))
        row.appendChild(tdHref(buildUserRightsLink(user.id, user.name)))
        row.appendChild(td(user.is_admin))
        row.appendChild(td("Delete"))
        tbody.appendChild(row);
      }
      );
      this.table.appendChild(tbody)
    }

  }
export { KanbearUserPanel }
