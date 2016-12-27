'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (global, factory) {
  (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.sjfDataBind = factory();
})(typeof window != 'undefined' ? window : undefined, function () {
  'use strict';

  var priority = {
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
  };

  var sjfEvents = ['sjf-click', 'sjf-mouseover', 'sjf-mouseout', 'sjf-mousemove', 'sjf-mouseenter', 'sjf-mouseleave', 'sjf-mousedown', 'sjf-mouseup'];

  // judge the type of obj
  var judgeType = function judgeType(obj) {
    return Object.prototype.toString.call(obj);
  };

  // remove the prefix of sjf-
  var removePrefix = function removePrefix(str) {
    return str = str.replace(/sjf-/, '');
  };

  // remove the brackets ()
  var removeBrackets = function removeBrackets(str) {
    str = str.replace(/\"/g, '');
    // console.log("str is " + str)
    return str = str.replace(/\(\)/, '');
  };

  // traverse the DOM
  function circleElement(parent, isFirst) {
    var child = parent.children;
    if (isFirst && !child.length) {
      link.call(this);
      return;
    }
    for (var i = child.length - 1; i >= 0; i--) {
      var node = child[i];
      if (!!node.children.length) {
        circleElement.call(this, node, false);
      } else {
        compileNode.call(this, node);
      }
    }
    if (this._el.lastElementChild === child[child.length - 1]) {
      link.call(this);
    }
  }

  var compileNode = function compileNode(node) {
    var _this = this;

    var matchExpress = /sjf-.+=\".+\"|\{\{.+\}\}/;
    if (matchExpress.test(node.outerHTML)) {
      var directives = matchExpress.exec(node.outerHTML);
      directives.forEach(function (value) {
        var slices = value.split('=');
        if (sjfEvents.indexOf(slices[0]) >= 0) {
          var eventType = removePrefix(slices[0]);
          var eventFunc = _this['_' + removeBrackets[slices[1]]];
          node.addEventListener(eventType, eventFunc, false);
        }
      });
      node.outerHTML = node.outerHTML.replace(matchExpress, "");
      this._uncompileNodes.push(node);
    }
  };

  // compile the sjf
  var compile = function compile() {
    circleElement.call(this, this._el, true);
  };

  var linkRender = {
    'sjf-if': function sjfIf(value) {
      this.style.display = !!value ? 'block!important' : 'none!important';
    },
    'sjf-show': function sjfShow(value) {
      this.style.display = !!value ? 'block!important' : 'none!important';
    },
    'sjf-for': function sjfFor() {},
    'sjf-text': function sjfText(value) {
      this.innerText = value;
    }
  };

  var link = function link() {
    var self = this;
    if (!!self._uncompileNodes.length) {
      self._uncompileNodes.forEach(function (value) {
        var attributes = value.attributes;
        console.log(attributes);
      });
    }
  };

  function Sjf(param) {
    if (!param.hasOwnProperty('el') || !param.hasOwnProperty('data')) {
      console.error('sjf[error]: There is need `data` and `el` attribute');
      return;
    }
    this._el = document.querySelector(param.el);
    this._data = param.data;
    this._watchers = [];
    this._uncompileNodes = [];
    for (var method in param.methods) {
      this['_' + method] = param.methods[method];
    }
    compile.call(this);
  }

  return Sjf;
});