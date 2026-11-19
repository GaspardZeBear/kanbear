//-------------------------------------------------------------------------
  //---------------------------------------------------------------------------------
  /*
  [
  {
    id: 101, name: "Workspace Kanbear", rightsId: 13,
    users:  [ { id: 1, name: "Gaspard", rightsId: 1 } ],
    groups: [ { id: 10, name: "Équipe Design", rightsId: 2 } ],
    projects: [
      {
        id: 201, name: "Site vitrine", rightsId: 45
        users:  [ { id: 1, name: "Gaspard", rightsId: 3 } ],
        groups: [ { id: 11, name: "Dev Backend", rightsId: 4 } ],
      },
      // ... autres projets sans droits : présents, listes vides
    ],
  },
  // ...
]
  */
function buildRightsTree(rights, users, groups, workspaces, projects) {
    console.log("buildRightsTree() workspaces", workspaces)
    console.log("buildRightsTree() projects", projects)
    const usersById = new Map(users.map(u => [u.id, u]));
    const groupsById = new Map(groups.map(g => [g.id, g]));

    const ownerRef = (type, id) => {
        const row = (type === 'user' ? usersById : groupsById).get(id);
        return { id, name: row ? row.name : `#${type}:${id}` };
    };

    const createKindMap = (rights, kind) => new Map(
        rights
            .filter(r => !r.owner_type && r.target_id > 0 && r.target_kind === kind)
            .map(r => [r.target_id, r])
    );

    console.log("buildRightsTree() rights", rights)
    const workspacesRightIdsMap = createKindMap(rights, 'workspace');
    const projectsRightIdsMap = createKindMap(rights, 'project');

    console.log("buildRightsTree() workspacesRightIdsMap", workspacesRightIdsMap)
    console.log("buildRightsTree() projectsRightIdsMap", projectsRightIdsMap)

    // 1. Noeuds workspaces, chacun avec ses projets
    const workspaceNodes = new Map();
    for (const w of workspaces) {
        console.log("buildRightsTree() w", w, "w.id", w.id, workspacesRightIdsMap.get(w.id) ?? "not found")
        if (workspacesRightIdsMap.get(w.id)) {
            workspaceNodes.set(w.id, {
                id: w.id,
                name: w.name,
                rightsId: workspacesRightIdsMap.get(w.id).id,
                users: [],
                groups: [],
                projects: new Map(projects
                    .filter(p => p.workspace_id === w.id)
                    .map(p => {
                        console.log("buildTree workspaceNodes p", p)
                        const right = projectsRightIdsMap.get(p.id);
                        return [p.id, { id: p.id, name: p.name, rightsId: right?.id, users: [], groups: [] }]
                    })
                ),
            });
        }
    }

    console.log("buildTree workspaceNodes", workspaceNodes)
    // 2. index target_id → node pour ranger les droits en O(1)
    const targetIndex = new Map(); // "kind:id" → node
    for (const w of workspaceNodes.values()) {
        targetIndex.set(`workspace:${w.id}`, w);
        console.log("buildTree target w", w)
        for (const p of w.projects.values()) {
            console.log("buildTree target p", p)
            targetIndex.set(`project:${p.id}`, p);
        }
    }

    for (const r of rights) {
        const key = `${r.target_kind}:${r.target_id}`
        const node = targetIndex.get(key);
        if (!node) continue; // cible inconnue/supprimée → ligne ignorée (ou logger)
        const list = r.owner_type === 'user' ? node.users : node.groups;
        switch (r.owner_type) {
            case 'user':
                node.users.push({ ...ownerRef(r.owner_type, r.owner_id), rightsId: r.id });
                break
            case 'group':
                node.groups.push({ ...ownerRef(r.owner_type, r.owner_id), rightsId: r.id });
                break
            default:
                console.log("buildRightsTree() Not usable right r", r)
                break
        }
        //list.push({ ...ownerRef(r.owner_type, r.owner_id), rightsId: r.id });
    }

    // 4. Map → Array
    let tree = [...workspaceNodes.values()].map(w => ({
        ...w,
        projects: [...w.projects.values()],
    }));
    return (tree)
}

export { buildRightsTree }


