  //----------------------------------------------------------------
  function sendMessage(message) {
    document.getElementById('message').innerHTML = `${new Date().toISOString()} ${message}`;
  }

  function sendErrorMessage(message) {
    document.getElementById('message').innerHTML = `${new Date().toISOString()} ${message}`;
  }

  export { sendMessage, sendErrorMessage }
