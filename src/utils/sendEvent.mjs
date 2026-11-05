  //----------------------------------------------------------------
  function sendEvent(eventName,detail={}) {
        const event = new CustomEvent(eventName, {
            detail: detail,
            bubbles: true,
            cancelable: true,
            composed: true
        })
        console.log("sendEvent() eventName fired", eventName, detail)
        document.dispatchEvent(event)
  }

  export { sendEvent }
