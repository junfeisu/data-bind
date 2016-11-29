(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? 
    module.exports = factory() :
    typeof define === 'function' && define.amd ? 
      define(factory) :
      (global.sjfDataBind = factory())
})(typeof window != 'undefined' ? window : this, function () {
  'use strict'
  var watchers = []
  var judgeType = function (obj) {
    return Object.prototype.toString.call(obj)
  }
  var compile = function () {
    var sjfElements = document.querySelectorAll('[sjf-for]')
    var self = this
    Array.from(sjfElements).reverse().forEach(function (value) {
      var message = value.getAttribute('sjf-for').replace(/\s/g, "/")
      var nodeType = value.nodeName.toLowerCase()
      var instance = message.split("/")[0]
      var dataName = message.split("/")[2]
      if (!self._data[dataName]) {
        console.error('sjf[error]: pleaes add the ' + dataName + ' into data')
        return
      }
      if (judgeType(self._data[dataName]) !== '[object Array]') {
        console.warn('sjf[warn]: the ' + dataName + ' is not a Array')
        return
      }
      for (var i = 0; i < self._data[dataName].length; i++) {
        var newElement = document.createElement(nodeType)
        value.innerHTML.replace(/{{dataName}}/g, self._data[dataName][i])
        value.parentElement.appendChild(newElement)
      }
    })
  }

  var link = function () {
    console.log('link')
  }

  function Sjf (param) {
    if (!param.hasOwnProperty('el') || !param.hasOwnProperty('data')) {
      console.error('sjf[error]: There is need `data` and `el` attribute');
      return;
    }
    this._el = document.querySelector(param.el)
    this._data = param.data
    for (var method in param.methods) {
      this['_' + method] = param.methods[method]
    }
    compile.call(this)
  }

  return Sjf
})