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
      console.error('the toLoopObject of sjf-for should be a number or an Array')
      return 
    }
    // 判断是数组还是数字，从而赋值length
    let isArray = util.isArray(toLoopObject)
    let len = isArray ? toLoopObject.length : toLoopObject

    // value.search.removeAttribute('sjf-for')
    console.log(value.node.parentNode)
    console.log(value.node.check.parentNode === value.node.parent)
    // for (let i = 0; i < len; i++) {
    //   let clonedNode = value.node.check.cloneNode(true)
    //   console.log(value.node.parent)
    //   value.node.parent.appendChild(clonedNode)
    // }

    if (toLoopObject && isArray) {
      this._watchers.push(toLoopObject)
    }
  },
  'sjf-text': function (value) {
    value.node.innerText = this._data[value.expression]
  }
}

class render {
  constructor (sjf) {
    this.sjf = sjf
    this.unBindEvents = []
    this.unSortDirectives = []
    console.log(this.sjf._unrenderNodes)
    let hasRender = this.sjf._unrenderNodes.length
    if (hasRender) {
      this.sjf._unrenderNodes.forEach(val => {
        val.type === 'event' ? this.unBindEvents.push(val) : this.unSortDirectives.push(val)
      this.sjf._unrenderNodes = []
      })
    }
    this.sortDirective()
  }

  sortDirective () {
    let executeQueue = util.sortExexuteQueue('directive', this.unSortDirectives)
    if (executeQueue.length) {
      executeQueue.forEach(value => {
        linkRender[value.directive].bind(this.sjf)(value)
      })
    }
    this.bindEvent()
  }

  // 绑定事件
  bindEvent () {
    let eventQuene = this.unBindEvents
    if (eventQuene.length) {
      eventQuene.forEach(val => {
        val.target.search.removeAttribute(val.name)
        let eventType = util.removePrefix(val.name)
        let eventFunc = this.sjf['_' + util.removeBrackets(val.func)]
        val.target.check.addEventListener(eventType, eventFunc, false)
      })
    }
  }
}

export default render
