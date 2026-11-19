import { Rights } from './Rights.mjs';
import { Workspace } from './Workspace.mjs';
import { Project } from './Project.mjs';
import { User } from './User.mjs';
import { Group } from './Group.mjs';

/**
 * Charge en parallèle les données nécessaires à RightsModal
 * et prépare les index (hash) + les listes havingRights*.
 */
class RightsLoader {

  //--------------------------------------------------------------------------
  async loadAll() {
    // ⚡ 5 requêtes en parallèle au lieu de 5 await séquentiels
    console.log("RightsLoader loadAll load begins")
    const [rights, workspaces, projects, users, groups] = await Promise.all([
      Rights.getAll('rights'),
      Workspace.getAll('workspaces'),
      Project.getAll('projects'),
      User.getAll('users'),
      Group.getAll('groups'),
    ]);
console.log("RightsLoader loadAll load over")
    // ── Tris ──
    workspaces.sort((a, b) => a.name.localeCompare(b.name));
    projects.sort((a, b) => a.name.localeCompare(b.name));
    users.sort((a, b) => a.name.localeCompare(b.name));
    groups.sort((a, b) => a.name.localeCompare(b.name));

    // ── Données brutes ──
    this.rights = rights;
    this.workspaces = workspaces;
    this.projects = projects;
    this.users = users;
    this.groups = groups;

    // ── Index (id → entité), accès O(1) ──
    this.rightsHash    = buildHash(rights);
    this.workspacesHash = buildHash(workspaces);
    this.projectsHash  = buildHash(projects);
    this.usersHash     = buildHash(users);
    this.groupsHash    = buildHash(groups);

    // ── Listes "ayant des droits" ──
    this.buildHavingRights();
    return this;
  }

  //--------------------------------------------------------------------------
  buildHavingRights() {
    const wsIds = new Set();
    const prIds = new Set();

    for (const r of this.rights) {
      if (r.target_id < 1) continue;
      if (r.target_kind === 'workspace' && this.workspacesHash[r.target_id]) {
        wsIds.add(r.target_id);
      } else if (r.target_kind === 'project' && this.projectsHash[r.target_id]) {
        prIds.add(r.target_id);
      }
    }

    // someRights sur l'entité entière : utilisable pour désactiver un bouton
    const hasSomeRights = (p) => this.rights.some(r => r.target_id === p.id);

    this.havingRightsWorkspaces = [...wsIds]
      .map(id => this.workspacesHash[id])
      .sort((a, b) => a.name.localeCompare(b.name));

    this.havingRightsProjects = [...prIds]
      .map(id => this.projectsHash[id])
      .sort((a, b) => a.name.localeCompare(b.name));

    // Accessoire : lookup rapide target_id → boolean "existe une ligne de droits"
    this.targetHasRights = new Set(
      this.rights.filter(r => r.target_id > 0).map(r => `${r.target_kind}:${r.target_id}`)
    );
  }

  //--------------------------------------------------------------------------
  // Debug : diagnostic rapide de l'état chargé
  summary() {
    return {
      rights: this.rights.length,
      workspaces: this.workspaces.length,
      projects: this.projects.length,
      users: this.users.length,
      groups: this.groups.length,
      havingRightsWorkspaces: this.havingRightsWorkspaces.length,
      havingRightsProjects: this.havingRightsProjects.length,
      orphanRights: this.rights.filter(r => {
        if (r.target_kind === 'workspace') return !this.workspacesHash[r.target_id];
        if (r.target_kind === 'project')   return !this.projectsHash[r.target_id];
        return true;
      }).length,
    };
  }
}

// helper partagé : Array → { id: entity }
function buildHash(items) {
  const hash = {};
  for (const it of items) hash[it.id] = it;
  return hash;
}

export { RightsLoader };

