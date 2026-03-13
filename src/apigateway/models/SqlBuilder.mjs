class SqlBuilder {

    /**
 * Génère un prepared statement SQL UPDATE et les valeurs associées
 * à partir des champs présents dans req.body.
 * @param {string} tableName - Nom de la table à mettre à jour.
 * @param {Object} updates - Objet contenant les champs à mettre à jour (req.body).
 * @param {string} idColumn - Nom de la colonne d'ID (ex: 'id').
 * @param {number|string} idValue - Valeur de l'ID.
 * @returns {Object} - { sql: string, params: Array } - Requête SQL et paramètres.
 */
    //generatePatchStatement(tableName, updates, idColumn, idValue) {
    generatePatchStatement(tableName, id, updates) {
        // Filtrer les champs vides ou non définis
        console.log(updates)
        const fields = Object.keys(updates).filter(key => updates[key] !== undefined);

        if (fields.length === 0) {
            throw new Error('Aucun champ à mettre à jour');
        }

        // Construire la partie SET de la requête (ex: "name = ?, description = ?")
        const setClauses = fields.map(field => `${field} = ?`).join(', ');
        const sql = `UPDATE ${tableName} SET ${setClauses} WHERE id=${id}`;
console.log(sql)
        // Construire le tableau des paramètres (valeurs + ID)
        const params = fields.map(field => updates[field]);
        params.push(params);
console.log(params)
        return { sql, params };
    }
}

export { SqlBuilder }