class KanboardFilter { 
  constructor(filtersMap) {
    console.log("kanboardFilter() ", filtersMap)
    this.pRx = new RegExp(filtersMap.projectFilter)
    this.sRx = new RegExp(filtersMap.swimlaneFilter)
    this.tRx = new RegExp(filtersMap.taskFilter)
    this.cRx = new RegExp(filtersMap.columnFilter)
  }

  keep(pName, sName, tTitle, cName) {
    console.log('kanboardFilter.keep()',pName, sName, tTitle, cName)
    console.log('kanboardFilter.keep() pName',this.pRx,this.pRx.test(pName))
    return (
      (pName ? this.pRx.test(pName):true)
      && (sName ? this.sRx.test(sName):true)
      && (tTitle ?this.tRx.test(tTitle):true)
      && (cName ? this.cRx.test(cName):true)
    )
  }

}
export { KanboardFilter }
