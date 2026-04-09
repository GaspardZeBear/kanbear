//---------------------------------------------------------------------------------
async function selectBoxBuilder(params) {

  console.log("selectBoxBuilder() <params>", params)
  let domId = params.domId
  let boxLabel = params.boxLabel
  let items = params.items
  let labelText = params.labelText
  let klass = params.klass
  let selected = params.selected
  ////"filter-group") {

  console.log("selectBoxBuilder", items)
  const itemDiv = document.createElement("div")
  itemDiv.classList.add(klass)
  //const label = document.createElement(boxLabel)

  const label = document.createElement('label')
  label.setAttribute("for", boxLabel)
  label.innerHTML = labelText
  const select = document.createElement("select")
  select.setAttribute("name", boxLabel)
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
    if (item.name == selected) {
      option.setAttribute("selected", "")
    }
    option.setAttribute("name", item.name)
    if (item.inner) {
      option.innerHTML = item.inner
    } else {
      option.innerHTML = item.name
    }
    select.appendChild(option)
  })
  itemDiv.appendChild(label)
  itemDiv.appendChild(select)
    console.log("selectBoxBuilder() <itemDiv>",itemDiv)
  return (itemDiv)
}

//-------------------------------------------------------------------

async function colorBoxBuilder(params) {
  let colors = [
    { id: "red", name: "red", inner: "\u{1F7E5} red" },
    { id: "green", name: "green", inner: "\u{1F7E9}green" },
    { id: "blue", name: "blue", inner: "\u{1F7E6}blue" },
    { id: "purple", name: "purple", inner: "\u{1F7EA}purple" },
    { id: "orange", name: "orange", inner: "\u{1F7E7}orange" },
    { id: "yellow", name: "yellow", inner: "\u{1F7E8}yellow" },
  ]
  params["items"] = colors
  //console.log("colorBox <params>",params)
  let box = await selectBoxBuilder(params)

  return(box)
}

        //---------------------------------------------------------------------------
async function buildColorSelectBox(selectedColor,name,labelText) {
        let color = colorBoxBuilder({
            domId: name,
            label: name,
            labelText: labelText,
            boxLabel: name,
            klass: 'filter-group',
            selected: selectedColor
        })
        return(color)
    }



export { colorBoxBuilder, buildColorSelectBox, selectBoxBuilder }

