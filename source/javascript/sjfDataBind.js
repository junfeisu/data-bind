'use strict'
import util from './utils'
import option from './option'

// traverse the DOM
const circleElement = function (parent, isFirst) {
  let child = parent.children
  if (isFirst && !child.length) {
    link.call(this)
    return
  }
  for (let i = 0; i < child.length; i++) {
    let node = child[i]
    if (!!node.children.length) {
      circleElement.call(this, node, false)
      this._uncompileNodes.push(node)
    } else {
      this._uncompileNodes.push(node)
      this._uncompileNodes.forEach(value => {
        compileNode.call(this, value)
      })
      this._uncompileNodes = []
    }
  }
  if (this._el.lastElementChild === child[child.length - 1]) {
    link.call(this)
  }
}

const compileNode = function (node) {
  let matchExpress = /sjf-.+=\".+\"|\{\{.+\}\}/
  if (matchExpress.test(node.outerHTML || node.innerText)) {
    let directives = matchExpress.exec(node.outerHTML || node.innerText)
    directives.forEach((value) => {
      let slices = value.split('=')
      if (option.sjfEvents.indexOf(slices[0]) >= 0) {
        node.removeAttribute(slices[0])
        let eventType = util.removePrefix(slices[0])
        let eventFunc = this['_' + util.removeBrackets(slices[1])]
        node.addEventListener(eventType, eventFunc, false)
      } else {
        if (/\{\{.+\}\}/.test(value)) {
          console.log(node.outerHTML)
          node.outerHTML = node.outerHTML.replace(matchExpress, "")
          slices[0] = slices[0].replace(/[\{\}]/g, "")
          this._unlinkNodes.push({node: node, directive: 'sjf-text', expression: slices[0]})
        } else {
          node.removeAttribute(slices[0])
          slices[1] = slices[1].replace(/\"/g, "")
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
    this['_' + method] = param.methods[method].bind(this)
  }
  compile.call(this)
}

export default SjfDataBind