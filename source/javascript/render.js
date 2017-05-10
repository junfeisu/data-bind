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
    value.node.check.removeAttribute('sjf-for')
    for (let i = 0; i < len - 1; i++) {
      let clonedNode = value.node.check.cloneNode(true)
      value.node.parent.insertBefore(clonedNode, value.node.check)
    }

    if (toLoopObject && isArray) {
      this._watchers.push(toLoopObject)
    }
  },
  'sjf-text': function (value) {
    // value.node.check = this._data[value.expression]
  }
}

const searchParent = (root, node) => {
  root = root || document
}

class render {
  constructor (sjf) {
    this.sjf = sjf
    this.unBindEvents = []
    this.unSortDirectives = []
    console.log(this.sjf._unrenderNodes)
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
    if (this.unSortDirectives.length) {
      this.unSortDirectives.map(value => {
        linkRender[value.directive].bind(this.sjf)(value)
      })
    }
    this.bindEvent()
  }

  // 绑定事件
  bindEvent () {
    let eventQuene = this.unBindEvents
    if (eventQuene.length) {
      eventQuene.map(val => {
        val.target.check.removeAttribute(val.name)
        let eventType = util.removePrefix(val.name)
        console.log(val.func)
        let eventFunc = this.sjf['_' + util.removeBrackets(val.func)]
        if (eventFunc) {
          val.target.check.addEventListener(eventType, eventFunc, false)
        } else {
          console.error('sjf[error]: the ' + val.func + ' is not declared')
        }
      })
    }
  }

  searchParent () {

  }
}

export default render
