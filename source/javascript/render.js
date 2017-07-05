import util from './utils'
import directiveDeal from './directive'

class render {
  constructor (sjf) {
    this.sjf = sjf
    this.unBindEvents = []
    this.unSortDirectives = []

    let hasRender = this.sjf._unrenderNodes.length
    if (hasRender) {
      this.sjf._unrenderNodes.map(val => {
        val.type === 'event' ? this.unBindEvents.push(val) : this.unSortDirectives.push(val)
      })
      this.sjf._unrenderNodes = []
    }

    this.sortDirective()
  }

  sortDirective () {
    let unSortDirectiveLen = this.unSortDirectives.length
    if (unSortDirectiveLen) {
      for (let i = unSortDirectiveLen - 1; i >= 0; i--) {
        if (this.unSortDirectives[i].directive === 'sjf-for') {
          let copyDirectives = Object.assign([], this.unSortDirectives)
          let copyEvents = Object.assign([], this.unBindEvents)
          let beforeForDirectives = util.searchChild(copyDirectives.splice(i + 1), this.unSortDirectives[i].node.check)
          let beforeForEvents = util.searchChild(copyEvents, this.unSortDirectives[i].node.check)

          this.unSortDirectives[i]['beforeDirectives'] = beforeForDirectives
          this.unSortDirectives.splice(i + 1, beforeForDirectives.length)

          this.unSortDirectives[i]['beforeEvents'] = beforeForEvents
          this.unBindEvents.splice(copyEvents.indexOf(beforeForEvents[0]), beforeForEvents.length)
        }
      }

      this.unSortDirectives.map(value => {
        directiveDeal[value.directive].bind(this.sjf)(value)
      })
    }
    
    this.bindEvent()
  }

  // 绑定事件
  bindEvent () {
    let eventQuene = this.unBindEvents
    if (eventQuene.length) {
      eventQuene.map(val => {
        let checkNode = val.node.check
        let eventType = util.removePrefix(val.name)
        let eventFunc = this.sjf['_' + util.removeBrackets(val.func)]
        checkNode.removeAttribute(val.name)

        eventFunc ? checkNode.addEventListener(eventType, eventFunc, false) : console.error('sjf[error]: the ' + val.func + ' is not declared')
      })
    }
  }
}

export default render
