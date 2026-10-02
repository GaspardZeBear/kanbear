import { Kontext } from "../classes/Kontext.mjs"


const REFERENCE = 4
const READ = 2
const WRITE = 1

//---------------------------------------------------------------------------
function isAdmin() {
  return(Kontext.getAdmin())
}

//---------------------------------------------------------------------------
function mustDisable(perm, kind = "project") {
  let disabled = Kontext.getAdmin()
  if (disabled) {
    //console.log("button mustDisabled() isAdmin", disabled)
    return (false)
  }
  switch (kind) {
    case "project":
      disabled = (Kontext.getCurrentProjectRights() & perm) !== perm
      break
    case "workspace":
      console.log("button mustDisable() Kontext.getCurrentWorkspaceRights()", Kontext.getCurrentWorkspaceRights())
      disabled = (Kontext.getCurrentWorkspaceRights() & perm) !== perm
      break
    default:
      console.log("button mustDisable() bad kind ", kind)
      disabled = true
      break
  }
  console.log("button mustDisable() ", "<perm>", perm, "<kind>", kind, "<disabled>", disabled)
  return (disabled)
}

export {
    REFERENCE,READ,WRITE,
    isAdmin,
  mustDisable
}