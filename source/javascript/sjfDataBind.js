import util from './utils'
import option from './option'

// 递归DOM树
const circleElement = function (parent, isFirst) {
  let child = parent.children
  let self = this
  // 如果是第一次遍历并且没有子节点就直接跳过compile
  if (isFirst && !child.length) {
    link.bind(this)()
    return
  }

  Array.prototype.forEach.call(child, node => {
    if (!!node.children.length) {
      circleElement.bind(self)(node, false)
      self._uncompileNodes.push(node)
    } else {
      self._uncompileNodes.push(node)
      self._uncompileNodes.forEach(value => {
        compileNode.bind(self)(value)
      })
      self._uncompileNodes = []
    }
  })
  // 如果当前节点是这个Sjf实例的根节点的最后一个子节点就跳出递归
  if (this._el.lastElementChild === child[child.length - 1]) {
    link.bind(this)()
  }
}

// 对具有sjf-的进行初步解析
const compileNode = function (node) {
  let matchExpress = /sjf-.+=\".+\"|\{\{.+\}\}/
  if (matchExpress.test(node.outerHTML || node.innerText)) {
    let directives = matchExpress.exec(node.outerHTML || node.innerText)
    directives.forEach((value) => {
      let slices = value.split('=')
      // 如果是事件就直接通过addEventListener进行绑定
      if (option.sjfEvents.indexOf(slices[0]) >= 0) {
        node.removeAttribute(slices[0])
        let eventType = util.removePrefix(slices[0])
        let eventFunc = this['_' + util.removeBrackets(slices[1])]
        node.addEventListener(eventType, eventFunc, false)
      } else {
        // 对{{}}这种表达式进行单独处理
        if (/\{\{.+\}\}/.test(value)) {
          // node.outerHTML = node.outerHTML.replace(matchExpress, '')
          let expression = slices[0].replace(/[\{\}]/g, '')
          this._unlinkNodes.push({node: node, directive: 'sjf-text', expression: expression})
        } else {
          // node.removeAttribute(slices[0])
          slices[1] = slices[1].replace(/\"/g, '')
          this._unlinkNodes.push({node: node, directive: slices[0], expression: slices[1]})
        }
      }
    })
  }
}

// compile the sjf
const compile = function () {
  circleElement.bind(this)(this._el, true)
}

const linkRender = {
  'sjf-if': function (value) {
    value.node.style.display = (!!(value.expression) ? 'block!important' : 'none!important')
  },
  'sjf-show': function (value) {
    value.node.style.display = (!!(value.expression) ? 'block!important' : 'none!important')
  },
  'sjf-for': function (value) {
    // 将表达式通过空格(不限空格数目)给切开
    let expressionSlices = value.expression.split(/\s+/)
    if (typeof expressionSlices[2] !== 'number' && this._data.hasOwnProperty(expressionSlices[2])) {
      this._watchers.push(this._data[expressionSlices[2]])
    }
    for (let i = 0; i < this._data[expressionSlices[2]].length; i++) {
      let clonedNode = value.node.cloneNode(true)
      value.node.parentElement.insertBefore(clonedNode, value.node)
    }
  },
  'sjf-text': function (value) {
    this.innerText = this._data[value.expression]
  }
}

const link = function () {
  let self = this
  if (!!self._unlinkNodes.length) {
    let executeQueue = util.sortExexuteQueue('directive', self._unlinkNodes)
    executeQueue.forEach(value => {
      linkRender[value.directive].bind(self)(value)
    })
  }
  console.log(this)
}

function SjfDataBind (param) {
  if (!param.hasOwnProperty('el') || !param.hasOwnProperty('data')) {
    console.error('sjf[error]: There is need `data` and `el` attribute')
    return
  }
  this._el = document.querySelector(param.el)
  this._data = param.data
  this._watchers = []
  this._uncompileNodes = []
  this._unlinkNodes = []
  for (var method in param.methods) {
    // 强制将定义在methods上的方法直接绑定在SjfDataBind上，并修改这些方法的this指向为SjfDataBind
    this['_' + method] = param.methods[method].bind(this)
  }
  compile.bind(this)()
}

export default SjfDataBind
