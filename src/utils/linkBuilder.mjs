
import { ProjectDialog } from '../classes/ProjectDialog.mjs'
import { SwimlaneDialog } from '../classes/SwimlaneDialog.mjs'
import { ColumnDialog } from '../classes/ColumnDialog.mjs'
import { WorkspaceDialog } from '../classes/WorkspaceDialog.mjs'
import { AssigneeDialog } from '../classes/AssigneeDialog.mjs'
import { TasksCommentsModal } from '../classes/TasksCommentsModal.mjs'
import { RightsModal } from '../classes/RightsModal.mjs'
import { UserDialog } from '../classes/UserDialog.mjs'
import { GroupDialog } from '../classes/GroupDialog.mjs'
import { User } from '../classes/User.mjs'
import { UsersGroups } from '../classes/UsersGroups.mjs'
import { N2nModal } from '../classes/N2nModal.mjs'

class LinkCounter {
  static counter = 0
}

//------------------------------------------------------------------------
function buildWorkspaceLink(workspaceId, workspaceName) {
  const href = document.createElement("a")
  //LinkCounter.counter++
  //href.setAttribute("id", `projectHref_${projectId}_${LinkCounter.counter}`)
  href.setAttribute("href", "javascript:void(0)")
  href.innerHTML = `${workspaceName}`
  let wId = workspaceId
  let editWorkspaceFn = function (ev) {
    console.log("editWorkspaceHref event Listener fired ")
    ev.stopPropagation();
    const workspace = new WorkspaceDialog()
    workspace.modify({ workspaceId: wId });
  }
  href.addEventListener('click', editWorkspaceFn, { once: true });
  return (href)
}


//------------------------------------------------------------------------
function buildProjectLink(projectId, projectName) {
  const href = document.createElement("a")
  //LinkCounter.counter++
  href.setAttribute("id", `projectHref_${projectId}_${LinkCounter.counter}`)
  href.setAttribute("href", "javascript:void(0)")
  href.innerHTML = `${projectName}`
  let pId = projectId
  let editProjectFn = function (ev) {
    console.log("editProjectHref event Listener fired ")
    ev.stopPropagation();
    const project = new ProjectDialog()
    project.modify({ projectId: pId });
  }
  href.addEventListener('click', editProjectFn, { once: true });
  return (href)
}

//----------------------------------------------------------------------------------
function buildSwimlaneLink(swimlaneId, swimlaneName) {
  const href = document.createElement("a")
  //LinkCounter.counter++
  href.setAttribute("id", `swimlaneHref_${swimlaneId}_${LinkCounter.counter}`)
  href.setAttribute("href", "javascript:void(0)")
  href.innerHTML = `${swimlaneName}`
  let sId = swimlaneId
  let editSwimlaneFn = function (ev) {
    console.log("editSwimlaneHref event Listener fired ")
    ev.stopPropagation();
    const swimlane = new SwimlaneDialog()
    swimlane.modify({ swimlaneId: sId });
  }
  href.addEventListener('click', editSwimlaneFn, { once: true });
  return (href)
}

//----------------------------------------------------------------------------------
function buildColumnLink(columnId, columnName) {
  const href = document.createElement("a")
  //LinkCounter.counter++
  //href.setAttribute("id", `columnHref_${columnId}_${LinkCounter.counter}`)
  href.setAttribute("href", "javascript:void(0)")
  href.innerHTML = `${columnName}`
  //let myProject = this.project
  let cId = columnId
  let editColumnFn = function (ev) {
    console.log("editColumnHref event Listener fired ")
    ev.stopPropagation();
    const column = new ColumnDialog()
    column.modify({ columnId: cId });
  }
  href.addEventListener('click', editColumnFn, { once: true });
  return (href)
}

//----------------------------------------------------------------------------------
function buildAssigneeLink(assigneeId, assigneeName) {
  const href = document.createElement("a")
  //LinkCounter.counter++
  //href.setAttribute("id", `columnHref_${columnId}_${LinkCounter.counter}`)
  href.setAttribute("href", "javascript:void(0)")
  href.innerHTML = `${assigneeName}`
  //let myProject = this.project
  let aId = assigneeId
  let editAssigneeFn = function (ev) {
    console.log("editAssigneeHref event Listener fired ")
    ev.stopPropagation();
    const assignee = new AssigneeDialog()
    assignee.modify({ assigneeId: aId });
  }
  href.addEventListener('click', editAssigneeFn, { once: true });
  console.log(href)
  return (href)
}

//----------------------------------------------------------------------------------
function buildUserLink(userId, userName) {
  const href = document.createElement("a")
  //LinkCounter.counter++
  //href.setAttribute("id", `columnHref_${columnId}_${LinkCounter.counter}`)
  href.setAttribute("href", "javascript:void(0)")
  href.innerHTML = `${userName}`
  //let myProject = this.project
  let uId = userId
  let editUserFn = function (ev) {
    console.log("editUserHref event Listener fired ")
    ev.stopPropagation();
    const user = new UserDialog()
    user.modify({ userId: uId });
  }
  href.addEventListener('click', editUserFn, { once: true });
  console.log(href)
  return (href)
}

//----------------------------------------------------------------------------------
function buildGroupLink(groupId, groupName) {
  const href = document.createElement("a")
  //LinkCounter.counter++
  //href.setAttribute("id", `columnHref_${columnId}_${LinkCounter.counter}`)
  href.setAttribute("href", "javascript:void(0)")
  href.innerHTML = `${groupName}`
  //let myProject = this.project
  let gId = groupId
  let editGroupFn = function (ev) {
    console.log("editGroupHref event Listener fired ")
    ev.stopPropagation();
    const group = new GroupDialog()
    group.modify({ groupId: gId });
  }
  href.addEventListener('click', editGroupFn, { once: true });
  console.log(href)
  return (href)
}

//-----------------------------------------------------------------------
function buildUsersGroupsLinkWrapper(group) {
  const usersGroupLink=buildUsersGroupsLink({
    id: group.id,
    name: group.name,
    text: group?.text??`Users`,
    leftCallback: () => {
      console.log("Users callback fired")
      return (User.getAll('users'))
    },
    rightKey: 'user_id',
    rightCallback: () => {
      console.log("KanbearGroupPanel rightCallback fired")
      return (UsersGroups.getUsersByGroupId({ groupId: group.id }))
    },
    onSave: async (ids) => {
      console.log("KanbearGroupPanel onSave fired", ids)

      for (let id of ids['mustDelete']) {
        let gu = new UsersGroups('usersGroups')
        gu.setId(id)
        await gu.delete()
      }
      for (let id of ids['mustAdd']) {
        let gu = new UsersGroups('usersGroups')
        gu.setData("group_id", group.id)
        gu.setData("user_id", id)
        await gu.create()
      }
      alert("Group saved")
    }
  })
  return(usersGroupLink)
}


//----------------------------------------------------------------------------------
function buildUsersGroupsLink(params) {
  const href = document.createElement("a")
  //LinkCounter.counter++
  //href.setAttribute("id", `columnHref_${columnId}_${LinkCounter.counter}`)
  href.setAttribute("href", "javascript:void(0)")
  href.textContent = params?.text??`Users`
  //let myProject = this.project
  //let uId=userId
  let editUsersGroupsFn = function async(ev) {
    console.log("editGroupUsersHref event Listener fired ")
    ev.stopPropagation();
    //const userRights = new UserDialog()
    let modal = new N2nModal({
      type: 'group',
      id: params.id,
      name: params.name,
      leftCallback: params.leftCallback,
      rightKey: params.rightKey,
      rightCallback: params.rightCallback,
      onSave: params.onSave
    })
    modal.render()
  }
  href.addEventListener('click', editUsersGroupsFn, { once: false });
  console.log(href)
  return (href)
}


//----------------------------------------------------------------------------------
function buildUserRightsLink(userId, userName) {
  const href = document.createElement("a")
  //LinkCounter.counter++
  //href.setAttribute("id", `columnHref_${columnId}_${LinkCounter.counter}`)
  href.setAttribute("href", "javascript:void(0)")
  href.innerHTML = `${userName}`
  //let myProject = this.project
  let uId = userId
  let editUserRightsFn = function (ev) {
    console.log("editUserHref event Listener fired ")
    ev.stopPropagation();
    //const userRights = new UserDialog()
    let modal = new RightsModal('user', userId, userName)
    //userRights.modify({userId:uId});
  }
  href.addEventListener('click', editUserRightsFn, { once: false });
  console.log(href)
  return (href)
}

//----------------------------------------------------------------------------------
function buildTasksCommentsLink(taskId, taskName) {
  const href = document.createElement("a")
  //LinkCounter.counter++
  //href.setAttribute("id", `columnHref_${columnId}_${LinkCounter.counter}`)
  href.setAttribute("href", "javascript:void(0)")
  href.innerHTML = taskName
  //let myProject = this.project
  let editTasksCommentsFn = function (ev) {
    console.log("editTasksCommentsHref event Listener fired ")
    ev.stopPropagation();
    const user = new TasksCommentsModal(taskId)
    //user.modify({userId:uId});
  }
  href.addEventListener('click', editTasksCommentsFn, { once: false });
  //href.addEventListener('mouseover', editTasksCommentsFn, { once: false });
  console.log(href)
  return (href)
}

export {
  buildAssigneeLink,
  buildUserLink,
  buildUserRightsLink,
  buildGroupLink,
  buildUsersGroupsLink,
  buildUsersGroupsLinkWrapper,
  buildWorkspaceLink,
  buildProjectLink,
  buildSwimlaneLink,
  buildColumnLink,
  buildTasksCommentsLink
}