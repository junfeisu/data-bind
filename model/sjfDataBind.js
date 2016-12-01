(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? 
    module.exports = factory() :
    typeof define === 'function' && define.amd ? 
      define(factory) :
      (global.sjfDataBind = factory())
})(typeof window != 'undefined' ? window : this, function () {
  'use strict'
  var watchers = []
  var priority = {
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
  var judgeType = function (obj) {
    return Object.prototype.toString.call(obj)
  }

  var isInherit = function (instance, parent) {}

  var render = function (param) {
    if (!param.hasOwnProperty('html')) {
      console.warn('sjf[warn]: There is need the `html` key in param of render')
      return
    }
    var body = document.querySelector('body')
    param.parent ? body.innerHTML = param.html : parent.innerHTML = param.html
  }

  // compile the sjf
  var compile = function () {
    var self = this
    var sjfElements = Array.from(self._el.querySelectorAll('[sjf-for]'))
    var sForList = []
    sjfElements.forEach(function (value) {
      var message = value.getAttribute('sjf-for').replace(/\s/g, "/")
      var slices = message.split("/")
      sForList.push({instance: slices[0], parent: slices[2]})
    })

    sjfElements.forEach(function (value, index) {
      var dataName = sForList[index].parent
      var instanceName = sForList[index].instance
      var instance = self._data[instanceName]
      var data = self._data[dataName]
      var nodeType = value.nodeName.toLowerCase()
      // to deal the null and type error
      if (!(data || (self._data[sForList[index - 1].parent] && index > 0))) {
        console.error('sjf[error]: please add the ' + dataName + ' into data')
        return
      }
      // if (judgeType(data) !== '[object Array]') {
        //   console.warn('sjf[warn]: the ' + dataName + ' is not a Array')
      //   return
      // }
      console.log(instanceName)
      var re = new RegExp("{{" + instanceName + "}}", "g")
      for (var i = 0; i < data.length; i++) {
        var html = value.innerHTML.replace(re, data[i])
        var newElement = document.createElement(nodeType)
        newElement.innerHTML = html
        value.parentElement.appendChild(newElement)
      }
      value.parentElement.removeChild(value)
    })
  }

  var link = function () {
    console.log('link')
  }

  function Sjf (param) {
    console.log('123')
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