# kanbear
A little companion for kanboard


~~~
<div class="kanban-board" id="1" data-projectid="1">
   <div class="kanban-swimlane" data-swimlane-id="2">
      <div class="swimlane-header">
         <h2>SceneNord</h2>
     </div>
      <div class="swimlane-columns">
      <div class="kanban-column" data-status="5" data-swimlane-id="2">
        <div data-swimlane-id="2" class="kanban-column-header">
          <h3>Available</h3>
        </div>
        <div class="kanban-items" data-status="5" data-swimlane-id="2">
          <div id="drag-1" class="kanban-item" draggable="true">
            <div class="kanban-item-header">
                <div class="kanban-item-title">#1</div>
                <div class="kanban-item-title">Equipe1</div>
                <button class="edit-task-btn" data-task-id="1">Edit</button>
            </div>
            <div class="kanban-item-description"></div>
          </div>
          <div id="drag-49" class="kanban-item" draggable="true">
            <div class="kanban-item-header">
                <div class="kanban-item-title">#49</div>
                <div class="kanban-item-title">test</div>
                <button class="edit-task-btn" data-task-id="49">Edit</button>
            </div>
            <div class="kanban-item-description"></div>
          </div>
          </div><button class="add-item-btn" data-swimlane-id="2" data-status="5">Add</button></div><div class="kanban-column" data-status="6" data-swimlane-id="2"><div data-swimlane-id="2" class="kanban-column-header"><h3>Engaged</h3></div><div class="kanban-items" data-status="6" data-swimlane-id="2"><div id="drag-2" class="kanban-item" draggable="true">
            <div class="kanban-item-header">
                <div class="kanban-item-title">#2</div>
                <div class="kanban-item-title">Equipe2</div>
                <button class="edit-task-btn" data-task-id="2">Edit</button>
            </div>
            <div class="kanban-item-description"></div>
          </div><div id="drag-4" class="kanban-item" draggable="true">
            <div class="kanban-item-header">
                <div class="kanban-item-title">#4</div>
                <div class="kanban-item-title">Equipe4</div>
                <button class="edit-task-btn" data-task-id="4">Edit</button>
            </div>
            <div class="kanban-item-description"></div>
          </div></div><button class="add-item-btn" data-swimlane-id="2" data-status="6">Add</button></div><div class="kanban-column" data-status="7" data-swimlane-id="2"><div data-swimlane-id="2" class="kanban-column-header"><h3>Out</h3></div><div class="kanban-items" data-status="7" data-swimlane-id="2"><div id="drag-3" class="kanban-item" draggable="true">
            <div class="kanban-item-header">
                <div class="kanban-item-title">#3</div>
                <div class="kanban-item-title">Equipe3</div>
                <button class="edit-task-btn" data-task-id="3">Edit</button>
 
 ~~~



 ## Gestion drop 
 ~~~
J'ai les div suivantes pour faire du drag and drop.     <div class="kanban-column" data-status="5" data-swimlane-id="2">
        <div data-swimlane-id="2" class="kanban-column-header">
          <h3>Available</h3>
        </div>
        <div class="kanban-items" data-status="5" data-swimlane-id="2">
          <div id="drag-1" class="kanban-item" draggable="true">
            <div class="kanban-item-header">
                <div class="kanban-item-title">#1</div>
                <div class="kanban-item-title">Equipe1</div>
                <button class="edit-task-btn" data-task-id="1">Edit</button>
            </div>
            <div class="kanban-item-description"></div>
          </div>
          <div id="drag-49" class="kanban-item" draggable="true">
            <div class="kanban-item-header">
                <div class="kanban-item-title">#49</div>
                <div class="kanban-item-title">test</div>
                <button class="edit-task-btn" data-task-id="49">Edit</button>
            </div>
            <div class="kanban-item-description"></div>
          </div>. Je veux que seule la div class="kanban-items" accepte le drop. Les div kanban-item-header, kanban-item-title ne doivent pas être droppable. Comment faire ?





11:26









Pour restreindre le drop uniquement aux zones .kanban-items et empêcher les éléments comme .kanban-item-header ou .kanban-item-title d'accepter les drops, voici comment procéder :

1. Désactiver le comportement par défaut de drag sur les éléments non-droppables
Ajoutez du CSS et du JavaScript pour empêcher les éléments enfants d'interférer avec le drag and drop.
CSS (à ajouter à votre feuille de style)
css
Copier

/* Empêcher les éléments enfants de capturer les événements de drag */
.kanban-item-header,
.kanban-item-title,
.edit-task-btn {
    pointer-events: none; /* Désactive les interactions de la souris */
    user-drag: none;      /* Empêche le drag sur ces éléments */
    -webkit-user-drag: none;
}

/* Style pour indiquer que la zone accepte le drop */
.kanban-items.drag-over {
    background-color: #f0f8ff;
    border: 2px dashed #4CAF50;
}


2. JavaScript pour gérer le drag and drop
Voici comment configurer les événements pour que seuls les .kanban-items acceptent les drops :
javascript
Copier

document.addEventListener('DOMContentLoaded', function() {
    // Sélection de toutes les zones droppables (kanban-items)
    const dropZones = document.querySelectorAll('.kanban-items');

    // Sélection de tous les éléments draggables (kanban-item)
    const draggableItems = document.querySelectorAll('.kanban-item');

    // Ajouter les événements de drag à chaque élément draggable
    draggableItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });

    // Ajouter les événements de drop aux zones droppables
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });

    // Fonction pour démarrer le drag
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.id);
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    // Fonction pour terminer le drag
    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    // Fonction pour gérer le survol d'une zone droppable
    function handleDragOver(e) {
        e.preventDefault(); // Nécessaire pour permettre le drop
        this.classList.add('drag-over');
    }

    // Fonction pour gérer le départ d'une zone droppable
    function handleDragLeave(e) {
        this.classList.remove('drag-over');
    }

    // Fonction pour gérer le drop
    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        const taskId = e.dataTransfer.getData('text/plain');
        const draggedItem = document.getElementById(taskId);

        // Vérifier que l'élément dragged existe
        if (draggedItem) {
            // Ajouter l'élément à la zone droppable
            this.appendChild(draggedItem);

            // Mettre à jour les données ou l'affichage si nécessaire
            console.log(`Tâche ${taskId} déplacée vers ${this.dataset.status} (swimlane ${this.dataset.swimlaneId})`);
        }
    }

    // Empêcher le drag sur les éléments enfants (optionnel, si le CSS ne suffit pas)
    document.querySelectorAll('.kanban-item-header, .kanban-item-title, .edit-task-btn').forEach(el => {
        el.addEventListener('dragstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });
    });
});


3. Explication des points clés :


pointer-events: none :

Désactive les interactions de la souris sur les éléments enfants (comme .kanban-item-header).
Empêche ces éléments de capturer les événements de drag.


user-drag: none :

Empêche explicitement le drag sur les éléments enfants.


Écouteurs d'événements :

dragstart : Déclenché quand un élément est glissé.
dragover : Déclenché quand un élément est glissé au-dessus d'une zone droppable.
dragleave : Déclenché quand un élément quitte une zone droppable.
drop : Déclenché quand un élément est lâché sur une zone droppable.


e.preventDefault() :

Obligatoire dans dragover pour permettre le drop.
Empêche aussi les comportements par défaut indésirables.


e.stopPropagation() :

Empêche la propagation des événements aux éléments parents.


4. Exemple complet avec gestion des données
Si vous voulez aussi mettre à jour vos données (par exemple, un tableau JavaScript ou un backend) quand une tâche est déplacée :
javascript
Copier

// Exemple de structure de données (à adapter selon vos besoins)
const tasksData = {
    '2': { // swimlane-id = 2
        '5': [ // status = 5
            { id: 'drag-1', title: '#1', team: 'Equipe1' },
            { id: 'drag-49', title: '#49', team: 'test' }
        ]
    }
};

// Fonction handleDrop mise à jour
function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');

    const taskId = e.dataTransfer.getData('text/plain');
    const draggedItem = document.getElementById(taskId);

    if (draggedItem) {
        const oldStatus = draggedItem.dataset.status;
        const oldSwimlaneId = draggedItem.dataset.swimlaneId;
        const newStatus = this.dataset.status;
        const newSwimlaneId = this.dataset.swimlaneId;

        // Mettre à jour les données
        if (oldStatus !== newStatus || oldSwimlaneId !== newSwimlaneId) {
            // Trouver et déplacer la tâche dans vos données
            // (Exemple simplifié, à adapter selon votre structure de données)
            console.log(`Déplacement de ${taskId} de (${oldSwimlaneId}, ${oldStatus}) vers (${newSwimlaneId}, ${newStatus})`);

            // Mettre à jour l'élément DOM avec les nouvelles données
            draggedItem.dataset.status = newStatus;
            draggedItem.dataset.swimlaneId = newSwimlaneId;
        }

        // Ajouter l'élément à la nouvelle zone
        this.appendChild(draggedItem);
    }
}


5. Gestion des événements sur les éléments enfants
Si certains éléments enfants (comme les boutons) capturent encore les événements, vous pouvez désactiver explicitement le drag sur ces éléments :
javascript
Copier

// Désactiver le drag sur les boutons et autres éléments enfants
document.querySelectorAll('.kanban-item-header button, .kanban-item-title').forEach(el => {
    el.addEventListener('dragstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    });
});


6. Résumé des étapes :

Ajoutez le CSS pour désactiver les interactions sur les éléments enfants.
Ajoutez les écouteurs d'événements sur les éléments .kanban-items (zones droppables).
Empêchez les événements de drag sur les éléments enfants (.kanban-item-header, etc.).
Gérez le drop uniquement dans les zones .kanban-items.
(Optionnel) Mettez à jour vos données quand une tâche est déplacée.

7. Exemple complet avec gestion des erreurs
Voici un exemple complet avec gestion des erreurs et mise à jour des données :
javascript
Copier

document.addEventListener('DOMContentLoaded', function() {
    // Données initiales (exemple)
    const tasksData = {
        '2': { // swimlane-id = 2
            '5': [ // status = 5
                { id: 'drag-1', title: '#1', team: 'Equipe1' },
                { id: 'drag-49', title: '#49', team: 'test' }
            ]
        }
    };

    // Sélection des zones droppables
    const dropZones = document.querySelectorAll('.kanban-items');

    // Sélection des éléments draggables
    const draggableItems = document.querySelectorAll('.kanban-item');

    // Ajout des événements de drag
    draggableItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });

    // Ajout des événements de drop aux zones droppables
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });

    // Désactiver le drag sur les éléments enfants
    document.querySelectorAll('.kanban-item-header, .kanban-item-title, .edit-task-btn').forEach(el => {
        el.addEventListener('dragstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    // Fonctions de gestion des événements
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.id);
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        try {
            const taskId = e.dataTransfer.getData('text/plain');
            const draggedItem = document.getElementById(taskId);

            if (!draggedItem) {
                throw new Error('Élément dragged introuvable');
            }

            const oldStatus = draggedItem.dataset.status;
            const oldSwimlaneId = draggedItem.dataset.swimlaneId;
            const newStatus = this.dataset.status;
            const newSwimlaneId = this.dataset.swimlaneId;

            // Mettre à jour les données (exemple simplifié)
            console.log(`Déplacement de ${taskId} de (${oldSwimlaneId}, ${oldStatus}) vers (${newSwimlaneId}, ${newStatus})`);

            // Mettre à jour les attributs data de l'élément
            draggedItem.dataset.status = newStatus;
            draggedItem.dataset.swimlaneId = newSwimlaneId;

            // Ajouter l'élément à la nouvelle zone
            this.appendChild(draggedItem);

        } catch (error) {
            console.error('Erreur lors du drop:', error);
        }
    }
});


Points clés à retenir :

Seuls les .kanban-items accepteront les drops.
Les éléments enfants (comme .kanban-item-header) ne captureront pas les événements de drag.
Le code est robuste et gère les erreurs.
Vous pouvez étendre la logique pour mettre à jour un backend ou une structure de données plus complexe.

Avec ce code, votre drag and drop fonctionnera uniquement sur les zones .kanban-items, et les éléments enfants comme les titres ou les boutons n'interféreront pas avec le drag and drop.




11:26









 ~~~


