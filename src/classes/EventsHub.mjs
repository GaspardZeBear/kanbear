class EventsHub {
  // Ajout du paramètre target (par défaut window)
  constructor(hubId = 'default-hub', target = window) {
    this.hubId = hubId;
    this.target = target;
    // Map<eventType, Map<listenerId, Function>>
    this.listeners = new Map();
    // Verrou synchrone pour les ré-entrées immédiates
    this.processingEvents = new Set();
  }

  on(listenerId, eventTypes, callback) {
    const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

    for (const type of types) {
      if (!this.listeners.has(type)) {
        this.listeners.set(type, new Map());
        this.target.addEventListener(type, this); 
      }
      
      this.listeners.get(type).set(listenerId, callback);
    }

    return () => this.off(listenerId, types);
  }

  off(listenerId, eventTypes = null) {
    const types = eventTypes
      ? (Array.isArray(eventTypes) ? eventTypes : [eventTypes])
      : Array.from(this.listeners.keys());

    for (const type of types) {
      const callbacksMap = this.listeners.get(type);
      if (callbacksMap) {
        callbacksMap.delete(listenerId);

        if (callbacksMap.size === 0) {
          this.target.removeEventListener(type, this);
          this.listeners.delete(type);
        }
      }
    }
  }

  /**
   * Méthode utilitaire pour émettre un événement en garantissant la propagation de _trace
   */
  emit(eventType, detail = {}) {
    const event = new CustomEvent(eventType, {
      detail,
      bubbles: true,
      cancelable: true
    });
    this.target.dispatchEvent(event);
  }

  handleEvent = (ev) => {
    const previousTrace = Array.isArray(ev.detail?._trace) ? ev.detail._trace : [];

    // 1. PROTECTION ASYNCHRONE (A -> B -> A)
    if (previousTrace.includes(ev.type)) {
      console.warn(
        `[EventsHub:${this.hubId}] Boucle asynchrone bloquée : ${[...previousTrace, ev.type].join(' -> ')}`
      );
      return;
    }

    // 2. PROTECTION SYNCHRONE
    if (this.processingEvents.has(ev.type)) {
      console.warn(`[EventsHub:${this.hubId}] Boucle synchrone bloquée sur : ${ev.type}`);
      return;
    }

    const callbacksMap = this.listeners.get(ev.type);
    if (!callbacksMap || callbacksMap.size === 0) return;

    // 3. ENRICHISSEMENT DU DETAIL & TRAÇABILITÉ
    const currentTrace = [...previousTrace, ev.type];
    const enrichedDetail = {
      ...(typeof ev.detail === 'object' && ev.detail !== null ? ev.detail : {}),
      EventsHubId: ev.detail?.EventsHubId ?? this.hubId,
      _trace: currentTrace
    };

    // 4. EXÉCUTION DES CALLBACKS
    this.processingEvents.add(ev.type);
    try {
      for (const [listenerId, callback] of callbacksMap.entries()) {
        try {
          // Utilisez console.debug plutôt que console.error pour le suivi normal
          console.debug(`[EventsHub:${this.hubId}] listener "${listenerId}" | ev.type "${ev.type}" :`, enrichedDetail);
          callback(enrichedDetail, ev, { listenerId, trace: currentTrace });
        } catch (err) {
          console.error(`[EventsHub:${this.hubId}] Erreur dans le listener "${listenerId}" sur "${ev.type}" :`, err);
        }
      }
    } finally {
      this.processingEvents.delete(ev.type);
    }
  };
}

export { EventsHub };
