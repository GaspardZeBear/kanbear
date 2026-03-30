  //----------------------------------------------------------------
  function log(ulDiv,...items) {
    let liDiv=document.createElement("li")
    let msg=new Date().toJSON()
    items.forEach( (m) => {
      msg += ` ${m}`
    })
    liDiv.innerHTML=msg
    ulDiv.appendChild(liDiv)
  }
  export { log }
