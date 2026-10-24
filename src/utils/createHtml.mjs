function createElement(tag, options = {}) {
  // On extrait les clés connues, le reste (rest) contiendra nos onEvent, classes, attributes...
  const { classes = [], textContent = '', innerHTML='', children = [], ...rest } = options;

  const element = document.createElement(tag);

  // 1. Classes CSS
  if (Array.isArray(classes) && classes.length > 0) {
    element.classList.add(...classes.filter(Boolean));
  } else if (typeof classes === 'string' && classes.trim() !== '') {
    element.className = classes;
  }

  // 2. Séparation et traitement des Attributs et des Événements "onEvent"
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined || value === null) continue;

    // Si la clé commence par "on" (ex: onclick, oninput, onmouseover)
    if (key.startsWith('on') && key.length > 2) {
      const eventType = key.slice(2).toLowerCase(); // Extraire "click" de "onclick"

      if (typeof value === 'function') {
        // Syntaxe ultra-simple : onclick: (e) => {}
        element.addEventListener(eventType, value);
      } else if (Array.isArray(value) && typeof value[0] === 'function') {
        // Syntaxe avec options : onclick: [(e) => {}, { once: true }]
        const [handler, eventOptions] = value;
        element.addEventListener(eventType, handler, eventOptions);
      }
    } else {
      // Sinon, c'est un attribut classique (id, type, src, etc.)
      element.setAttribute(key, value);
    }
  }

  // 3. Texte
  if (textContent) {
    element.textContent = textContent;
  }

  if (innerHTML) {
    element.textContent = innerHTML;
  }

  // 4. Enfants
  if (Array.isArray(children)) {
    children.forEach(child => {
      if (child instanceof Node) {
        element.appendChild(child);
      }
    });
  }

  return element;
}


export { createElement }