  //---------------------------------------------------------------------------------
  async function selectBoxBuilder(params) {
    
    console.log(params)
    let domId=params.domId
    let boxLabel=params.boxLabel
    let wss=params.items
    let labelText=params.labelText
    let klass=params.klass
    ////"filter-group") {

    console.log("selectBoxBuilder", wss)
    const wsDiv = document.createElement("div")
    wsDiv.classList.add(klass)
    const label = document.createElement(boxLabel)
    label.setAttribute("for", boxLabel)
    label.innerHTML = labelText
    const select = document.createElement("select")
    select.setAttribute("name", label)
    select.setAttribute("id", domId)
    
    const fakeOption = document.createElement('option')
    fakeOption.setAttribute("value", -wss.length)
    //fakeOption.setAttribute("selected", "selected")
    fakeOption.innerHTML = '- No selection  -'
    select.appendChild(fakeOption)

    wss.forEach((ws, idx) => {
      console.log(ws)

      const option = document.createElement('option')
      //if (idx == 0) {
      //  option.setAttribute("selected", "selected")
      //}
      option.setAttribute("value", ws.id)
      option.innerHTML = ws.name
      select.appendChild(option)
    })
    wsDiv.appendChild(label)
    wsDiv.appendChild(select)
    return (wsDiv)
  }

  export { selectBoxBuilder }

