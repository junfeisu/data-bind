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
    let hasUnSortDirective = this.unSortDirectives.length
    if (hasUnSortDirective) {
      for (let i = hasUnSortDirective - 1; i >= 0; i--) {
        if (this.unSortDirectives[i].directive === 'sjf-for') {
          let sjfArr = Object.assign([], this.unSortDirectives)
          let beforeForDirectives = util.searchChild(sjfArr.splice(i + 1), this.unSortDirectives[i].node.check)

          this.unSortDirectives[i]['beforeDirectives'] = beforeForDirectives
          this.unSortDirectives.splice(i + 1, beforeForDirectives.length)
        }
      }

      this.unSortDirectives.map(value => {
        directiveDeal[value.directive].bind(this.sjf)(value)
      })
    }
    // this.bindEvent()
  }

  // 绑定事件
  bindEvent () {
    let eventQuene = this.unBindEvents
    if (eventQuene.length) {
      eventQuene.map(val => {
        let checkNode = val.target.check
        let eventType = util.removePrefix(val.name)
        let eventFunc = this.sjf['_' + util.removeBrackets(val.func)]
        checkNode.removeAttribute(val.name)

        eventFunc ? checkNode.addEventListener(eventType, eventFunc, false) : console.error('sjf[error]: the ' + val.func + ' is not declared')
      })
    }
  }
}

export default render
