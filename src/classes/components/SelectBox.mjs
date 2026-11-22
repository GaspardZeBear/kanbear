class SelectBox extends HTMLElement {
  // Attributs HTML surveillés (chaînes de caractères uniquement)
  static get observedAttributes() {
    return ['label', 'name', 'select-id', 'selected', 'selected-option'];
  }

  constructor() {
    super();
    this._items = [];
    this._rendered = false;
  }

  // --- PROPRIÉTÉS JS (pour les données complexes) ---
  set items(value) {
    this._items = Array.isArray(value) ? value : [];
    if (this._rendered) {
      this.renderOptions();
    }
  }

  get items() {
    return this._items;
  }

  // Permet de récupérer facilement la valeur sélectionnée depuis l'extérieur
  get value() {
    return this.selectElement ? this.selectElement.value : null;
  }

  // --- CYCLE DE VIE ---
  connectedCallback() {
    if (!this._rendered) {
      this.renderStructure();
      this._rendered = true;
    }
    this.renderOptions();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this._rendered || oldValue === newValue) return;

    if (name === 'label') {
      this.labelTextNode.textContent = newValue || '';
    } else if (name === 'name') {
      this.labelElement.setAttribute('for', newValue);
      this.selectElement.setAttribute('name', newValue);
    } else if (name === 'select-id') {
      newValue ? this.selectElement.id = newValue : this.selectElement.removeAttribute('id');
    } else if (name === 'selected' || name === 'selected-option') {
      this.renderOptions();
    }
  }

  // --- RENDU ---
  renderStructure() {
    // 1. Récupération des boutons passés en enfants dans le HTML avant de vider
    const existingButtons = Array.from(this.children);

    // 2. Création du <label>
    this.labelElement = document.createElement('label');
    const boxName = this.getAttribute('name') || '';
    this.labelElement.setAttribute('for', boxName);

    // Utilisation d'un TextNode pour éviter d'écraser les boutons lors d'un changement de label
    this.labelTextNode = document.createTextNode(this.getAttribute('label') || '');
    this.labelElement.appendChild(this.labelTextNode);

    // Réinsertion des boutons dans le label (remplace params.buttons)
    existingButtons.forEach(btn => this.labelElement.appendChild(btn));

    // 3. Création du <select>
    this.selectElement = document.createElement('select');
    this.selectElement.setAttribute('name', boxName);
    
    const domId = this.getAttribute('select-id');
    if (domId) {
      this.selectElement.id = domId;
    }

    // Relais de l'événement 'change' vers l'extérieur avec les détails utiles
    this.selectElement.addEventListener('change', (e) => {
      this.dispatchEvent(new CustomEvent('selection-change', {
        bubbles: true,
        detail: {
          value: e.target.value,
          selectedItem: this._items.find(item => String(item.id) === e.target.value) || null
        }
      }));
    });

    // 4. Assemblage (la balise <select-box> elle-même remplace votre <div>)
    this.appendChild(this.labelElement);
    this.appendChild(this.selectElement);
  }

  renderOptions() {
    if (!this.selectElement) return;
    this.selectElement.innerHTML = ''; // Nettoie les anciennes options

    const selectedName = this.getAttribute('selected');
    const selectedId = this.getAttribute('selected-option');

    // Option par défaut ("No selection")
    const fakeOption = document.createElement('option');
    fakeOption.value = -this._items.length;
    fakeOption.textContent = '- No selection -';
    this.selectElement.appendChild(fakeOption);

    // Génération des options
    this._items.forEach(item => {
      const option = document.createElement('option');
      option.value = item.id;
      option.setAttribute('name', item.name);

      if ((selectedId && String(item.id) === String(selectedId)) || 
          (selectedName && item.name === selectedName)) {
        option.selected = true;
      }

      // Sécurité : textContent par défaut, innerHTML uniquement si item.inner est explicitement fourni
      if (item.inner) {
        option.innerHTML = item.inner;
      } else {
        option.textContent = item.name;
      }

      this.selectElement.appendChild(option);
    });
  }
}

customElements.define('select-box', SelectBox);
export { SelectBox }

