  //---------------------------------------------------------------------------------
  async function selectBoxBuilder(params) {
    
    console.log(params)
    let domId=params.domId
    let boxLabel=params.boxLabel
    let items=params.items
    let labelText=params.labelText
    let klass=params.klass
    ////"filter-group") {

    console.log("selectBoxBuilder", items)
    const itemDiv = document.createElement("div")
    itemDiv.classList.add(klass)
    const label = document.createElement(boxLabel)
    label.setAttribute("for", boxLabel)
    label.innerHTML = labelText
    const select = document.createElement("select")
    select.setAttribute("name", label)
    select.setAttribute("id", domId)
    
    const fakeOption = document.createElement('option')
    fakeOption.setAttribute("value", -items.length)
    //fakeOption.setAttribute("selected", "selected")
    fakeOption.innerHTML = '- No selection  -'
    select.appendChild(fakeOption)

    items.forEach((item, idx) => {
      console.log(item)
      const option = document.createElement('option')
      option.setAttribute("value", item.id)
      option.innerHTML = item.name
      select.appendChild(option)
    })
    itemDiv.appendChild(label)
    itemDiv.appendChild(select)
    return (itemDiv)
  }

  export { selectBoxBuilder }

