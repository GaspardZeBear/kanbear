import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { ProjectsRights } from './ProjectsRights.mjs'
import { Project } from './Project.mjs'
import { WorkspacesRights } from './WorkspacesRights.mjs'
import { Workspace } from './Workspace.mjs'
//import { UserRightsDialog } from './UserRightsDialog.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { formatDuration, dateToString, getDurationFromNow } from "../utils/dateAndTime.mjs";
import { selectBoxBuilder } from '../utils/selectBoxBuilder.mjs';
//import { buildAddProjectsRightsButton, buildAddWorkspacesRightsButton } from '../utils/buttonBuilder.mjs'
import { RightsModal } from './RightsModal.mjs'

// Rights flags
/*
const REFERENCEFLAG = 4
const READFLAG = 2
const WRITEFLAG = 1
const DELETEFLAG = 8
const ISADMINFLAG = 16
*/

class UserRightsModal extends RightsModal{

  //------------------------------------------------------------------------
  constructor(userId, userName) {
    super('user',userId,userName)
  }

  //-----------------------------------------------------------------------------
  async XgetRightsList() {
    const projectsRightsEntity = new ProjectsRights({ ownerId: this.ownerId })
    let rightsList = await projectsRightsEntity.getByUserId()
    return(rightsList)
  }

    //------------------------------------------------------------------------
  getItemId(kind, action, id) {
    return (`${kind}:${id}:rights:${action}`)
  }


}


export { UserRightsModal }
