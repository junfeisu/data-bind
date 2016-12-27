(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? 
    module.exports = factory() :
    typeof define === 'function' && define.amd ? 
      define(factory) :
      (global.sjfDataBind = factory())
})(typeof window != 'undefined' ? window : this, function () {
  'use strict'
  const priority = {
    'sjf-if': 2000,
    'sjf-show': 2000,
    'sjf-for': 1000,
    'sjf-click': 100,
    'sjf-mouseover': 100,
    'sjf-mouseout': 100,
    'sjf-mousemove': 100,
    'sjf-mouseenter': 100,
    'sjf-mouseleave': 100,
    'sjf-mousedown': 100,
    'sjf-mouseup': 100,
    'sjf-change': 100,
    'sjf-model': 10,
    'sjf-text': 1
  }

  const sjfEvents = [
    'sjf-click', 
    'sjf-mouseover', 
    'sjf-mouseout', 
    'sjf-mousemove', 
    'sjf-mouseenter',
    'sjf-mouseleave',
    'sjf-mousedown',
    'sjf-mouseup'
  ]

  // judge the type of obj
  const judgeType = function (obj) {
    return Object.prototype.toString.call(obj)
  }

  // remove the prefix of sjf-
  const removePrefix = function (str) {
    return str = str.replace(/sjf-/, '')
  }

  // remove the brackets ()
  const removeBrackets = function (str) {
    str = str.replace(/\"/g, '')
    // console.log("str is " + str)
    return str = str.replace(/\(\)/, '')
  }

  // traverse the DOM
  function circleElement (parent, isFirst) {
    let child = parent.children
    if (isFirst && !child.length) {
      link.call(this)
      return
    }
    for (let i = child.length - 1; i >= 0; i--) {
      let node = child[i]
      if (!!node.children.length) {
        circleElement.call(this, node, false)
      } else {
        compileNode.call(this, node)
      }
    }
    if (this._el.lastElementChild === child[child.length - 1]) {
      link.call(this)
    }
  }

  let compileNode = function (node) {
    let matchExpress = /sjf-.+=\".+\"|\{\{.+\}\}/
    if (matchExpress.test(node.outerHTML)) {
      let directives = matchExpress.exec(node.outerHTML)
      directives.forEach((value) => {
        let slices = value.split('=')
        if (sjfEvents.indexOf(slices[0]) >= 0) {
          let eventType = removePrefix(slices[0])
          let eventFunc = this['_' + removeBrackets[slices[1]]]
          node.addEventListener(eventType, eventFunc, false)
        }
      })
      node.outerHTML = node.outerHTML.replace(matchExpress, "");
      this._uncompileNodes.push(node)
    }
  }

  // compile the sjf
  let compile = function () {
    circleElement.call(this, this._el, true)
  }

  const linkRender = {
    'sjf-if': function (value) {
      this.style.display = (!!value ? 'block!important' : 'none!important')
    },
    'sjf-show': function (value) {
      this.style.display = (!!value ? 'block!important' : 'none!important')
    },
    'sjf-for': function () {

    },
    'sjf-text': function (value) {
      this.innerText = value
    }
  }

  let link = function () {
    let self = this
    if (!!self._uncompileNodes.length) {
      self._uncompileNodes.forEach(value => {
        let attributes = value.attributes
        console.log(attributes)
      })
    }
  }

  function Sjf (param) {
    if (!param.hasOwnProperty('el') || !param.hasOwnProperty('data')) {
      console.error('sjf[error]: There is need `data` and `el` attribute')
      return
    }
    this._el = document.querySelector(param.el)
    this._data = param.data
    this._watchers = []
    this._uncompileNodes = []
    for (var method in param.methods) {
      this['_' + method] = param.methods[method]
    }
    compile.call(this)
  }

  return Sjf
})