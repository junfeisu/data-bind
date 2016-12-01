'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (global, factory) {
  (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.sjfDataBind = factory();
})(typeof window != 'undefined' ? window : undefined, function () {
  'use strict';

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
  };

  // judge the type of obj
  var judgeType = function judgeType(obj) {
    return Object.prototype.toString.call(obj);
  };

  // compile the sjf
  var compile = function compile() {
    var self = this;
    var html = self._el.innerHTML;
    var matchExpress = /sjf-.+=\".+\"|\{\{.+\}\}/g;
    var results = html.match(matchExpress);
    if (results.length !== 0) {
      results.forEach(function (value) {
        if (value.indexOf('=') < 0) {
          var slices = value.match(/\w+/g);
          self._watchers.push({ ref: self._el, name: 'text', expression: slices[0], filters: slices[1] });
        } else {
          var _slices = value.split('=');
          self._watchers.push({ ref: self._el, name: _slices[0], expression: _slices[1], filters: _slices[1].split("| ")[1] });
        }
      });
    }
  };

  var link = function link() {};

  function Sjf(param) {
    if (!param.hasOwnProperty('el') || !param.hasOwnProperty('data')) {
      console.error('sjf[error]: There is need `data` and `el` attribute');
      return;
    }
    this._el = document.querySelector(param.el);
    this._data = param.data;
    this._watchers = [];
    for (var method in param.methods) {
      this['_' + method] = param.methods[method];
    }
    compile.call(this);
  }

  return Sjf;
});