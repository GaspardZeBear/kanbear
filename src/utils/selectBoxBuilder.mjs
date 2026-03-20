  //---------------------------------------------------------------------------------
  async function selectBoxBuilder(id, blabel, wss, labelText, klass="filter-group") {

    console.log("selectBoxBuilder", wss)
    const wsDiv = document.createElement("div")
    wsDiv.classList.add(klass)
    const label = document.createElement(blabel)
    label.setAttribute("for", "workspace")
    label.innerHTML = labelText
    const select = document.createElement("select")
    select.setAttribute("name", label)
    select.setAttribute("id", id)
    
    const fakeOption = document.createElement('option')
    fakeOption.setAttribute("value", -2)
    //fakeOption.setAttribute("selected", "selected")
    fakeOption.innerHTML = '- No selection  -'
    select.appendChild(fakeOption)

    const newOption = document.createElement('option')
    newOption.setAttribute("value", -1)
    //fakeOption.setAttribute("selected", "selected")
    newOption.innerHTML = '- Create new workspace -'
    select.appendChild(newOption)

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

