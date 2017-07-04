import util from './utils'

const linkRender = {
  'sjf-if': function (value) {
    value.node.style.display = (!!(value.expression) ? 'block!important' : 'none!important')
  },
  'sjf-show': function (value) {
    value.node.style.display = (!!(value.expression) ? 'block!important' : 'none!important')
  },
  'sjf-for': function (value) {
    // 将表达式通过空格(不限空格数目)给切开
    let loopObjectName = value.expression.split(/\s+/)[2]
    let representativeName = value.expression.split(/\s+/)[0]
    let toLoopObject = null
    if (this._data.hasOwnProperty(loopObjectName)) {
      toLoopObject = this._data[loopObjectName]
    }
    // 判断待循环的是否能进行循环
    let isLoopable = toLoopObject instanceof Array || !isNaN(toLoopObject)
    if (!isLoopable) {
      console.error('sjf[error]: the toLoopObject of sjf-for should be a number or an Array')
      return 
    }
    // 判断是数组还是数字，从而赋值length
    let isArray = util.isArray(toLoopObject)
    let len = isArray ? toLoopObject.length : toLoopObject
    let clonedCheckNode = value.node.check.cloneNode(true)
    let clonedCheckNodeLength = clonedCheckNode.childNodes.length
    value.node.check.removeAttribute('sjf-for')

    for (let i = 0; i < len; i++) {
      value.beforeDirectives.map(directive => {
        if (directive.expression === representativeName) {
          directive['textNodeValue'] = toLoopObject[i]
          directive['representativeName'] = representativeName
          directive['checkNodeChildLength'] = clonedCheckNodeLength
          linkRender[directive.directive].bind(this)(directive)
        }
      })
      let clonedNode = value.node.check.cloneNode(true)
      value.node.parent.insertBefore(clonedNode, value.node.check)
    }
    value.node.parent.removeChild(value.node.check)

    if (toLoopObject && isArray) {
      this._watchers.push(toLoopObject)
    }
  },
  'sjf-text': function (value) {
    console.log(value)
    let textNodeVlaue = !value.textNodeValue ? this._data[value.expression] : value.textNodeValue
    let checkNode = value.node.check

    if (value.node.nodeType === 'elementNode') {
      let textNode = document.createTextNode(textNodeVlaue)
      let hasChild = checkNode.childNodes.length

      if (checkNode.childNodes.length == value.checkNodeChildLength + 1) {
        checkNode.removeChild(checkNode.firstChild)
      }
      hasChild ? checkNode.insertBefore(textNode, checkNode.firstChild) : checkNode.appendChild(textNode)
    } else {
      checkNode.data = textNodeVlaue
    }
  }
}

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
        linkRender[value.directive].bind(this.sjf)(value)
      })
    }
    // this.bindEvent()
  }

  // 绑定事件
  bindEvent () {
    let eventQuene = this.unBindEvents
    if (eventQuene.length) {
      eventQuene.map(val => {
        console.log('val', val)
        val.target.check.removeAttribute(val.name)
        let eventType = util.removePrefix(val.name)
        console.log(val.func)
        let eventFunc = this.sjf['_' + util.removeBrackets(val.func)]
        console.log(eventFunc.arguments)
        if (eventFunc) {
          val.target.check.addEventListener(eventType, eventFunc, false)
        } else {
          console.error('sjf[error]: the ' + val.func + ' is not declared')
        }
      })
    }
  }
}

export default render
