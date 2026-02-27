class KanboardFilter { 
  constructor(filtersMap) {
    console.log("kanboardFilter() ", filtersMap)
    this.pRx = new RegExp(filtersMap.projectFilter)
    this.sRx = new RegExp(filtersMap.swimlaneFilter)
    this.tRx = new RegExp(filtersMap.taskFilter)
    this.cRx = new RegExp(filtersMap.columnFilter)
    this.aRx = new RegExp(filtersMap.assigneeFilter)
    // WIP for assignee !!
    this.aRx = new RegExp('.*')
  }

  keep(pName, sName, tTitle, cName, aName) {
    //console.log('kanboardFilter.keep()',pName, sName, tTitle, cName)
    console.log('kanboardFilter.keep() aName',aName,' arx  ', this.aRx, ' test ', this.aRx.test(aName))
    let aNameTest=(aName ? this.aRx.test(aName):true)
    if ( !aName ) {
      aNameTest=(aName ? this.aRx.test(''):true)
    }
    return (
      (pName ? this.pRx.test(pName):true)
      && (sName ? this.sRx.test(sName):true)
      && (tTitle ?this.tRx.test(tTitle):true)
      && (cName ? this.cRx.test(cName):true)
      && aNameTest
    )
  }

}
export { KanboardFilter }
