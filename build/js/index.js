(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? 
    module.exports = factory() :
    typeof define === 'function' && define.amd ? 
      define(factory) :
      (global.sjfDataBind = factory())
})(typeof window != 'undefined' ? window : this, function () {
  'use strict'
  const priority = {
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

  // judge the type of obj
  const judgeType = function (obj) {
    return Object.prototype.toString.call(obj)
  }

  // compile the sjf
  let compile = function () {
    let self = this
    let html = self._el.innerHTML
    let matchExpress = /sjf-.+=\".+\"|\{\{.+\}\}/g
    let results = html.match(matchExpress)
    if (results.length !== 0) {
      results.forEach(value => {
        if (value.indexOf('=') < 0) {
          let slices = value.match(/\w+/g)
          self._watchers.push({ref: self._el, name: 'text', expression: slices[0], filters: slices[1]})
        } else {
          let slices = value.split('=')
          self._watchers.push({ref: self._el, name: slices[0], expression: slices[1], filters: slices[1].split("| ")[1]})
        }
      })
    }
  }


  let link = function () {
  }

  function Sjf (param) {
    if (!param.hasOwnProperty('el') || !param.hasOwnProperty('data')) {
      console.error('sjf[error]: There is need `data` and `el` attribute')
      return
    }
    this._el = document.querySelector(param.el)
    this._data = param.data
    this._watchers = []
    for (var method in param.methods) {
      this['_' + method] = param.methods[method]
    }
    compile.call(this)
  }

  return Sjf
})