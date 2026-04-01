  //----------------------------------------------------------------
  function sendEvent(eventName,detail) {
        const event = new CustomEvent(eventName, {
            detail: detail,
            bubbles: true,
            cancelable: true,
            composed: true
        })
        //document.querySelectorAll(".projectCreated").dispatchEvent(projectCreatedEvent)
        document.dispatchEvent(event)
  }
  export { sendEvent }
